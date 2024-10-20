from flask import Flask, request, jsonify, send_file
import os
from dotenv import load_dotenv
import google.generativeai as genai
import PIL.Image
import PyPDF2
from cartesia import Cartesia
import ffmpeg
import json
from moviepy.editor import TextClip, CompositeVideoClip, ColorClip, VideoFileClip, AudioFileClip, concatenate_videoclips
import importlib.util
import tempfile
from openai import OpenAI
import requests
import singlestoredb as s2
import os

# helper funcs
def read_pdf_content(filepath):
    with open(filepath, 'rb') as pdf_file:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    
def read_file_content(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        return file.read()

load_dotenv()

app = Flask(__name__)

openclient = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-pro")
    
@app.route("/generate-lecture-video", methods=["GET", "POST"])
def generate_lecture():
    
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')
    data = request.get_json()

    # Validate input
    course_id = data.get('course_id')
    video_name = data.get('name')
    description = data.get('description')
    uploaded_file = request.files.get('file')  # file input from frontend
    input_type = uploaded_file.content_type
    # create script from lecture notes
    # input_type = "text"

    prompt = "Create a detailed and comprehensive college-level lecture based on these notes. The lecture should be no more than 200 words in length. Remove any unnecessary formatting (that isn't part of an equation), like * and # symbols."

    if (input_type == "image/png"):
        lecture_notes = PIL.Image.open(uploaded_file)
    elif (input_type == "image/jpg"):
        lecture_notes = PIL.Image.open(uploaded_file)
    elif (input_type == "application/pdf"):
        lecture_notes = read_pdf_content(uploaded_file)
    elif (input_type == "text/plain"):
        lecture_notes = read_file_content(uploaded_file)
    elif (input_type == "text"): 
        lecture_notes = """
        Physics is the study of matter, energy, and the fundamental forces of nature. At its core, physics seeks to understand how the universe behaves, from the smallest particles to the largest galaxies. One of the fundamental concepts in physics is Newton's Laws of Motion, which describe the relationship between a body and the forces acting upon it. Newton's first law, often called the law of inertia, states that an object will remain at rest or in uniform motion unless acted upon by a force. His second law defines force as the product of mass and acceleration (F = ma), while the third law famously states that every action has an equal and opposite reaction.

        Another essential area of physics is energy, particularly the concepts of kinetic and potential energy. Kinetic energy is the energy of motion, while potential energy is stored energy due to an object's position or state. The principle of conservation of energy asserts that energy cannot be created or destroyed, only transferred or transformed, such as when potential energy is converted into kinetic energy in a falling object.

        In the realm of thermodynamics, we study heat, temperature, and energy transfer. The first law of thermodynamics states that the total energy in a closed system is constant, while the second law introduces the concept of entropy, indicating that systems tend toward disorder over time. This explains why heat flows from hot objects to cooler ones, and why perpetual motion machines are impossible.

        Physics also delves into the nature of light and electromagnetic waves. Electromagnetic theory, developed by James Clerk Maxwell, describes how electric and magnetic fields propagate through space as waves. Light, as an electromagnetic wave, exhibits both wave-like and particle-like properties, a concept known as wave-particle duality in quantum mechanics. This is fundamental to modern physics, where quantum theory describes the behavior of particles at the smallest scales, challenging classical notions of determinism and introducing the concept of probability in the behavior of particles.
        """
    else:
        return jsonify({"error": "invalid input type"}), 400

    print("creating script")
    response = model.generate_content(
        [prompt, lecture_notes],
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=50000,
            temperature=1.0,
        ),
    )
    script = response.text

    # create slides from lecture script
    prompt = "Based on the lecture script given, create corresponding slides for the script. The slides should only have a few key words on them. Return a valid JSON list of the text on these slides, mapped to the corresponding text in the script, clearly defining all variables. (Keys should be 'slide' and 'script'). If there is any LaTeX, please clear it."

    print("creating slides")
    response = model.generate_content(
        [prompt, script],
        # generation_config=genai.types.GenerationConfig(
        #     max_output_tokens=50000,
        #     temperature=1.0,
        # ),
    )

    # format text into json
    json_text = response.text[7:-3]
    data = json.loads(json_text)

    custom_voice = True
    input_voice = 'test.m4a'
    custom_embedding = []
    if custom_voice:
        url = "https://api.cartesia.ai/voices/clone/clip"

        cartesia_api_key = os.environ["CARTESIA_API_KEY"]

        with open(input_voice, 'rb') as f:
            files = { "clip": f }
            payload = { "enhance": "true" }
            headers = {
                "Cartesia-Version": "2024-06-10",
                "X-API-Key": cartesia_api_key
            }

            # Make the first POST request
            response = requests.post(url, data=payload, files=files, headers=headers)

            try:
                # Extract the JSON response
                response_json = response.json()
                custom_embedding = response_json.get("embedding")

            except requests.exceptions.JSONDecodeError:
                # Handle JSON decode errors
                print("First response content is not valid JSON:")
                print(response.text)


    # create voicoever using cartesia and lecture script
    client = Cartesia(api_key=os.getenv("CARTESIA_API_KEY"))
    voice_id = "a0e99841-438c-4a64-b679-ae501e7d6091"  # Barbershop Man
    model_id = "sonic-english"
    transcript = script

    output_format = {
        "container": "raw",
        "encoding": "pcm_f32le",
        "sample_rate": 44100,
    }

    # Set up a WebSocket connection.
    ws = client.tts.websocket()
    # Open a file to write the raw PCM audio bytes to.
    f = open("sonic.pcm", "wb")

    # Sample rate from the output format
    sample_rate = 44100  # 44.1 kHz
    bytes_per_sample = 4  # 32-bit PCM is 4 bytes per sample

    # Initialize the list to store timestamps
    timestamps = []
    # Starting point in the audio (in seconds)
    current_time = 0.0

    # prompt = '''Given the following script segment, generate self-contained Python code that creates a corresponding figure or animation using Matplotlib. The code should:
    # Include all necessary imports and variable definitions.
    # Ensure that all variables used within functions are properly defined and accessible.
    # If an animation is appropriate, define an animation object named ani using FuncAnimation and include code to save it as a video file using ani.save('animation_slide_{slide_number}.mp4', writer='ffmpeg', fps=24).
    # If only a static figure is appropriate, create the figure and save it using plt.savefig('static_slide_{slide_number}.png') and set is_animation = False.
    # The code should be self-contained and executable as is.
    # If no suitable figure or animation can be generated, simply return 'no'.'''
    prompt1 = "Given the following script segment, determine whether a visual/diagram/animation would help explain the concept. If yes, output 'yes', and if not, output 'no'"

    prompt2 = '''Given the following script segment, generate self-contained Python code that creates a corresponding animation using Matplotlib. The animation must be very relevant to the concept in the script. The code should:
    Include all necessary imports and variable definitions.
    The code must be executable via the built-in exec() function in Python.
    Do not include plt.show().
    Ensure that all variables used within functions are properly defined and accessible.
    Define an animation object named ani using FuncAnimation in a form similar to: ani = FuncAnimation(fig, update, frames=len(x), init_func=init, blit=True).
    The code should be self-contained and executable as is.
    Do not add any other comments or any form of explanations or alternatives.'''

    animations = []
    for slide in data:
        print("creating diagram for slide")
        # query for animation (or 'no')
        response = model.generate_content(
            [prompt1, slide['script']],
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=50000,
                temperature=1.0,
            ),
        )
        if response.text != 'no':
            completion = openclient.chat.completions.create(
                model="gpt-4-turbo",

                messages=[
                    {"role": "system", "content": prompt2},
                    {
                        "role": "user",
                        "content": "DO NOT ADD ANY COMMENTS OR EXTRA CODE SUCH AS plt.show(). Make sure graphs or animations are unique and displayed properly. The graphs and animations must be fully accurate to the script. The animations/graphs MUST correspond with the concept. Also, do NOT use the exec() function or execute anything within the code. Avoid sin or cos graphs unless it is absolutely relevant to the content. Use 3D graphs when necessary. If you cannot generate any relevant graphs/animations, create some relevant slide content using matplotlib. Here is the Script: " + slide['script'],
                    }
                ]
            )

            print(completion.choices[0].message.content)
            # response = model.generate_content(
            #     [prompt2, slide['script']],
            #     generation_config=genai.typesw.GenerationConfig(
            #         max_output_tokens=50000,
            #         temperature=0.75,
            #     ),
            # )
            animations.append(completion.choices[0].message.content)
        else:
            animations.append("no")

        # Record the timestamp for this slide (in seconds)
        timestamps.append((slide['slide'], current_time))

        # Generate and stream audio
        total_bytes_written = 0
        if not custom_voice:
            for output in ws.send(
                model_id=model_id,
                transcript=slide['script'],
                voice_id=voice_id,
                stream=True,
                output_format=output_format,
            ):
                buffer = output["audio"]  # buffer contains raw PCM audio bytes
                f.write(buffer)
                total_bytes_written += len(buffer)
        else:
            for output in ws.send(
                model_id=model_id,
                transcript=slide['script'],
                voice_embedding=custom_embedding,
                stream=True,
                output_format=output_format,
            ):
                buffer = output["audio"]  # buffer contains raw PCM audio bytes
                f.write(buffer)
                total_bytes_written += len(buffer)

        # Calculate the duration of the audio segment in seconds
        # Total samples = total_bytes_written / bytes_per_sample
        # Duration (seconds) = total_samples / sample_rate
        duration = total_bytes_written / (bytes_per_sample * sample_rate)

        # Update the current time to reflect the end of this slide's audio
        current_time += duration

    # Close the connection to release resources
    ws.close()
    f.close()

    # Convert the raw PCM bytes to a WAV file.
    ffmpeg.input("sonic.pcm", format="f32le").output("sonic.wav").run()

    print("up until moviepy")

    def create_animated_slide(text, slide_number, duration=5):
        # Create a background clip
        background = ColorClip(size=(1280, 720), color=(255, 255, 255), duration=duration)  # White background
        
        # Create a TextClip with animation
        txt_clip = TextClip(text, fontsize=70, color='black', size=(1280, 720))  # Text in black
        txt_clip = txt_clip.set_position('center').set_duration(duration)
        
        # Add fade-in and fade-out effects for smooth transitions
        txt_clip = txt_clip.crossfadein(1).crossfadeout(1)
        
        # Composite text onto the background
        final_clip = CompositeVideoClip([background, txt_clip])
        
        # Save the slide as an individual video clip
        output = f"slide_{slide_number}.mp4"
        final_clip.write_videofile(output, fps=24, codec='libx264')
        return output

    def run_animation(animation_code, slide_number, duration):
        # Clean the animation code to remove any backticks or language specifiers
        cleaned_code = animation_code.replace("```python", "").replace("```", "").strip()

        # Ensure necessary imports and initial data setup are in the cleaned code
        imports = '''
    import matplotlib.pyplot as plt
    import numpy as np
    from matplotlib.animation import FuncAnimation
    '''

        # Add any missing variables (e.g., X, y) if they are undefined
        additional_vars = '''
    # Define default X and y data if they are missing
    if 'X' not in locals():
        X = np.linspace(0, 10, 100)
    if 'y' not in locals():
        y = 3 * X + 2 + np.random.randn(len(X)) * 5
    '''

        # Final code to execute
        final_code = imports + additional_vars + cleaned_code + f'''
    ani.save("animation_slide_{slide_number}.mp4", writer='ffmpeg', fps=24)
    plt.close()
        '''
        
        output_file = f"animation_slide_{slide_number}.mp4"
        
        # Try to execute the final code
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp_file:
                module_path = temp_file.name
                # Write the received code to the temporary file
                temp_file.write(final_code.encode())

            try:
                # Dynamically load the module from the temporary file
                spec = importlib.util.spec_from_file_location("dynamic_module", module_path)
                dynamic_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(dynamic_module)
            finally:
                # Clean up the temporary file
                os.remove(module_path)
            return output_file  # Return the output video file
        except Exception as e:
            print(f"Error running animation for slide {slide_number}: {e}")
            # If there's an error, generate a fallback slide
            return create_animated_slide(f"Slide {slide_number} (Failed Animation)", slide_number, duration)


    def create_video_from_animated_slides(slide_videos, audio_file, output_file):
        # Load all the individual slide videos and specify the FPS manually
        video_clips = [VideoFileClip(slide, fps_source='fps').set_duration(5) for slide in slide_videos]

        # Concatenate all the slides
        final_video = concatenate_videoclips(video_clips, method="compose")

        # Load the audio and set it for the video
        if audio_file:
            audio = AudioFileClip(audio_file)
            final_video = final_video.set_audio(audio)

        # Write the final video
        final_video.write_videofile(output_file, fps=24)

    # Process the slides and animations
    slide_videos = []
    print(timestamps)
    for index, (slide, animation_code) in enumerate(zip(data, animations)):
        print("making animation")
        print(animation_code)
        duration = timestamps[index + 1][1] - timestamps[index][1] if index < len(timestamps) - 1 else 20
        
        if animation_code.strip() == 'no':
            # Create a slide if no animation is provided
            slide_video = create_animated_slide(slide['slide'], index + 1, duration)
        else:
            # Run the provided animation code
            slide_video = run_animation(animation_code, index + 1, duration)
        
        slide_videos.append(slide_video)

    create_video_from_animated_slides(slide_videos, "sonic.wav", "final_lecture_video.mp4")

    for slide in slide_videos:
        os.remove(slide)

    def video_to_blob(video_file_path):
        # Open the video file in binary read mode
        with open(video_file_path, "rb") as video_file:
            video_blob = video_file.read()  # Read the file as binary (BLOB)
        return video_blob

    video_blob = video_to_blob("final_lecture_video.mp4")

    try:
        with conn.cursor() as cur:
            # Step 1: Insert the new video into the Videos table
            query_insert_video = '''
                INSERT INTO Videos (name, description, video_data)
                VALUES (%s, %s, %s);
            '''
            cur.execute(query_insert_video, (video_name, description, video_blob))
            conn.commit()

            # Step 2: Get the video_id of the newly inserted video
            video_id = cur.lastrowid  # Fetch the last inserted id

            # Step 3: Insert into CourseVideos to associate the video with the course
            query_insert_course_video = '''
                INSERT INTO CourseVideos (course_id, video_id)
                VALUES (%s, %s);
            '''
            cur.execute(query_insert_course_video, (course_id, video_id))
            conn.commit()

            return jsonify({'message': 'Video added and associated with the course successfully', 'video_id': video_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({"video_blob": video_blob})

@app.route('/add_student', methods=['POST'])
def add_student():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')

    if request.method == 'POST':
        data = request.get_json()
        try:
            with conn:
                with conn.cursor() as cur:
                    query = '''
                    INSERT INTO Users (name, email, type, courses)
                    VALUES (%s, %s, %s, %s);
                    '''
                    print('got here 1')
                    cur.execute(query, (data['name'], data['email'], "Student", json.dumps(data['courses'])))
                    print('got here2')
                    conn.commit()
                    print('got here 3')
                    return jsonify({'message': 'New student added!'}), 201
        except Exception as e:
            print(e)
            conn.rollback()
            return jsonify({'error': str(e)}), 500
        
@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')

    if request.method == 'POST':
        data = request.get_json()
        try:
            with conn:
                with conn.cursor() as cur:
                    query = '''
                    INSERT INTO Users (name, email, type, courses)
                    VALUES (%s, %s, %s, %s);
                    '''
                    cur.execute(query, (data['name'], data['email'], "Teacher", json.dumps(data['courses'])))

                    conn.commit()
                    
                    return jsonify({'message': 'New student added!'}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 500

@app.route('/get_user_by_email', methods=['GET'])
def get_user_by_email():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')

    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        with conn:
            with conn.cursor() as cur:
                # SQL Query to fetch the user by email
                query = 'SELECT user_id, name, email, type, courses FROM Users WHERE email = %s;'
                cur.execute(query, (email,))
                conn.commit()

                # Fetch the user record
                user_record = cur.fetchone()
                
                if user_record:
                    return jsonify({
                        'user_id': user_record[0],
                        'name': user_record[1],
                        'email': user_record[2],
                        'type': user_record[3],
                        'courses': user_record[4],
                        'message': 'User found'
                    }), 200
                else:
                    return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/create_course', methods=['POST'])
def create_course():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')
    data = request.get_json()

    if not data or 'course_name' not in data or 'professor' not in data:
        return jsonify({'error': 'Missing required course details'}), 400

    try:
        with conn.cursor() as cur:
            query = '''
                INSERT INTO Courses (course_name, professor, students, join_code, videos)
                VALUES (%s, %s, %s, %s, %s);
            '''
            cur.execute(query, (
                data['course_name'], 
                data['professor'], 
                json.dumps(data.get('students', [])),  # Default to an empty list
                data.get('join_code', ''), 
                json.dumps(data.get('videos', []))  # Default to an empty list
            ))
            conn.commit()
            return jsonify({'message': 'Course created successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
        
@app.route('/get_user_courses', methods=['GET'])
def get_user_courses():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')
    email = request.args.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    try:
        with conn.cursor() as cur:
            # Fetch the user_id based on the email
            query_user = 'SELECT user_id FROM Users WHERE email = %s;'
            cur.execute(query_user, (email,))
            user_record = cur.fetchone()

            if not user_record:
                return jsonify({'error': 'User not found'}), 404

            user_id = user_record[0]

            # Fetch all course_ids associated with the user_id
            query_courses = 'SELECT course_id FROM UserCourses WHERE user_id = %s;'
            cur.execute(query_courses, (user_id,))
            course_ids = cur.fetchall()

            if not course_ids:
                return jsonify({'message': 'No courses found for this user'}), 404

            # Prepare a list of course_ids
            course_ids = [course[0] for course in course_ids]

            # Fetch course details based on the course_ids
            format_strings = ','.join(['%s'] * len(course_ids))
            query_course_details = f'SELECT course_name, professor, join_code FROM Courses WHERE course_id IN ({format_strings});'
            cur.execute(query_course_details, tuple(course_ids))
            courses = cur.fetchall()

            # Format the result
            course_list = [
                {'course_name': course[0], 'professor': course[1], 'join_code': course[2]}
                for course in courses
            ]

            return jsonify({'courses': course_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/get_course_videos', methods=['GET'])
def get_course_videos():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')
    course_id = request.args.get('course_id')

    if not course_id:
        return jsonify({'error': 'course_id is required'}), 400

    try:
        with conn.cursor() as cur:
            # Fetch all video_ids associated with the course_id
            query_videos = 'SELECT video_id FROM CourseVideos WHERE course_id = %s;'
            cur.execute(query_videos, (course_id,))
            video_ids = cur.fetchall()

            if not video_ids:
                return jsonify({'message': 'No videos found for this course'}), 404

            # Prepare a list of video_ids
            video_ids = [video[0] for video in video_ids]

            # Fetch video details based on the video_ids, including video_id, name, and description
            format_strings = ','.join(['%s'] * len(video_ids))
            query_video_details = f'SELECT video_id, name, description FROM Videos WHERE video_id IN ({format_strings});'
            cur.execute(query_video_details, tuple(video_ids))
            videos = cur.fetchall()

            # Format the result
            video_list = [
                {'video_id': video[0], 'name': video[1], 'description': video[2]}
                for video in videos
            ]

            return jsonify({'videos': video_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/get_video_data', methods=['GET'])
def get_video_data():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')
    video_id = request.args.get('video_id')

    if not video_id:
        return jsonify({'error': 'video_id is required'}), 400

    try:
        with conn.cursor() as cur:
            # Fetch video data based on the video_id
            query = 'SELECT video_data, name FROM Videos WHERE video_id = %s;'
            cur.execute(query, (video_id,))
            video_record = cur.fetchone()

            if not video_record:
                return jsonify({'message': 'Video not found'}), 404

            video_data, video_name = video_record

            # Serve the video file as a response
            return send_file(
                io.BytesIO(video_data),
                mimetype='video/mp4',  # or the appropriate mimetype
                as_attachment=True,
                download_name=f"{video_name}.mp4"
            )

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/join_course', methods=['POST'])
def join_course():
    conn = s2.connect('purav:Testuser1012@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_lecturix_d55ab')
    data = request.get_json()

    # Validate input
    email = data.get('email')
    join_code = data.get('join_code')

    if not email or not join_code:
        return jsonify({'error': 'Email and join code are required'}), 400

    try:
        with conn.cursor() as cur:
            # Step 1: Get user_id from email
            query_user = 'SELECT user_id FROM Users WHERE email = %s;'
            cur.execute(query_user, (email,))
            user_record = cur.fetchone()

            if not user_record:
                return jsonify({'error': 'User not found'}), 404

            user_id = user_record[0]

            # Step 2: Get course_id from join_code
            query_course = 'SELECT course_id FROM Courses WHERE join_code = %s;'
            cur.execute(query_course, (join_code,))
            course_record = cur.fetchone()

            if not course_record:
                return jsonify({'error': 'Course not found'}), 404

            course_id = course_record[0]

            # Step 3: Check if the user is already enrolled in the course
            query_enrollment = 'SELECT * FROM UserCourses WHERE user_id = %s AND course_id = %s;'
            cur.execute(query_enrollment, (user_id, course_id))
            existing_enrollment = cur.fetchone()

            if existing_enrollment:
                return jsonify({'message': 'User is already enrolled in this course'}), 400

            # Step 4: Enroll the user in the course (insert into UserCourses)
            query_enroll = '''
                INSERT INTO UserCourses (user_id, course_id)
                VALUES (%s, %s);
            '''
            cur.execute(query_enroll, (user_id, course_id))
            conn.commit()

            return jsonify({'message': 'User successfully enrolled in the course!'}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()





if __name__ == "__main__":
    app.run(debug=True)