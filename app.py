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
    input_data = request.json

    # create script from lecture notes
    # input_type = "text"
    input_type = input_data.get("input_type")
    notes_file = input_data.get("notes_file")

    prompt = "Create a detailed and comprehensive college-level lecture based on these notes. The lecture should be no more than 200 words in length. Remove any unnecessary formatting (that isn't part of an equation), like * and # symbols NO MATTER WHAT."

    if (input_type == "png"):
        lecture_notes = PIL.Image.open("notes.png")
    elif (input_type == "jpg"):
        lecture_notes = PIL.Image.open("notes.jpg")
    elif (input_type == "pdf"):
        lecture_notes = read_pdf_content("notes.pdf")
    elif (input_type == "txt"):
        lecture_notes = read_file_content("notes.txt")
    elif (input_type == "text"): 
        lecture_notes = """
        Physics is the branch of science that seeks to understand the fundamental principles governing the universe, including matter, energy, and their interactions. It covers a broad range of phenomena, from the motion of everyday objects to the behavior of particles at the atomic level. The field of physics is divided into various branches, such as classical mechanics, which deals with the motion of objects under the influence of forces, and electromagnetism, which explores the behavior of electric and magnetic fields and their effects on matter. Thermodynamics studies the transfer of heat and the relationship between energy and work, while quantum mechanics delves into the strange behavior of particles at the subatomic scale, where the classical laws of physics no longer apply. Physics also includes relativity, which explains how space and time are interconnected, particularly at high speeds and in strong gravitational fields, as outlined by Einstein's theory of general relativity.

        At its core, physics seeks to explain the laws of nature through observation, experimentation, and mathematical models. It applies principles such as Newton's laws of motion, which describe how forces cause changes in an object's velocity, and the law of conservation of energy, which states that energy cannot be created or destroyed, only transformed from one form to another. Physics is also the foundation for many technological advances, from the development of electricity and magnetism in the 19th century to the modern advancements in particle physics and cosmology. In addition, physics provides insights into the nature of the universe, from the behavior of planets and stars to the origins of the cosmos itself. Through its study, we gain a deeper understanding of how the world works, helping us develop technologies that shape our modern society.
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
    prompt1 = "Given the following script segment, determine whether a visual/diagram/animation would help explain the concept. If yes, output 'yes'. If there is any risk of generating complex visualizations with potentially erroneous code (e.g., due to dimensionality mismatches or difficult-to-manage animations), output 'no'. Avoid generating overly complex or error-prone visualizations such as 3D scatter plots or animations that depend on non-standard data. If the concept requires such complexity, return 'no' for that slide."

    prompt2 = '''Given the following script segment, generate self-contained Python code that creates a corresponding animation using Matplotlib. The animation must be very relevant to the concept in the script. The code should:
    Include all necessary imports and variable definitions.
    The code must be executable via the built-in exec() function in Python.
    Do not include plt.show().
    Ensure that all variables used within functions are properly defined and accessible.
    Ensure that all arrays or data structures used in the animation are checked for shape mismatches and appropriate indexing.
    Define an animation object named ani using FuncAnimation in a form similar to: ani = FuncAnimation(fig, update, frames=len(x), init_func=init, blit=True).
    The code should be self-contained and executable as is.
    Ensure that any data used in the animation (e.g., arrays like X, y) is generated in a way that guarantees compatibility between different functions (e.g., make sure all arrays have matching shapes). If using random data, ensure the same seed is used for consistency.
    Do not add any other comments or any form of explanations or alternatives.'''

    animations = []
    for ind, slide in enumerate(data):
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
                        "content": "Ensure that any data used in the animation (e.g., arrays like X, y) is generated in a way that guarantees compatibility between different functions (e.g., make sure all arrays have matching shapes). If using random data, ensure the same seed is used for consistency. Ensure that all arrays or data structures used in the animation are checked for shape mismatches and appropriate indexing. DO NOT ADD ANY COMMENTS OR EXTRA CODE SUCH AS plt.show(). Make sure graphs or animations are unique and displayed properly. The graphs and animations must be fully accurate to the script. The animations/graphs MUST correspond with the concept. Also, do NOT use the exec() function or execute anything within the code. Avoid sin or cos graphs unless it is absolutely relevant to the content. Use 3D graphs when necessary. If you cannot generate any relevant graphs/animations, create some relevant slide content using matplotlib. Here is the Script: " + slide['script'],
                    }
                ]
            )

            # print(completion.choices[0].message.content)
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
        print("script:", slide['script'])
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

        if ind == len(data) - 1:
            timestamps.append((slide['slide'], current_time))

    print(timestamps)

    # Close the connection to release resources
    ws.close()
    f.close()

    # Convert the raw PCM bytes to a WAV file.
    ffmpeg.input("sonic.pcm", format="f32le").output("sonic.wav").run()

    print("up until moviepy")

    def create_animated_slide(text, slide_number, duration=5):
        # Create a background clip
        background = ColorClip(size=(1280, 720), color=(255, 255, 255), duration=duration) # white background
        
        # Create a TextClip with animation
        txt_clip = TextClip(text, fontsize=70, color="blue", font="Ubuntu-Regular.ttf", size=(1280, 720))  # Text in blue
        txt_clip = txt_clip.set_position('center').set_duration(duration)
        
        # Add fade-in and fade-out effects for smooth transitions
        txt_clip = txt_clip.crossfadein(1).crossfadeout(1)
        
        # Composite text onto the background
        final_clip = CompositeVideoClip([background, txt_clip])
        
        # Save the slide as an individual video clip
        output = f"C:/Users/subha/code/lecturix/slide_{slide_number}.mp4"
        final_clip.write_videofile(output, fps=24, codec='libx264')
        return output

    def run_animation(animation_code, slide_number, duration, fallback):
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
    ani.save("C:/Users/subha/code/lecturix/animation_slide_{slide_number}.mp4", writer='ffmpeg', fps=24)
    plt.close()
        '''
        
        output_file = f"C:/Users/subha/code/lecturix/animation_slide_{slide_number}.mp4"
        
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
            loop_video_to_duration(output_file, duration)
            return output_file  # Return the output video file
        except Exception as e:
            print(f"Error running animation for slide {slide_number}: {e}")
            # If there's an error, generate a fallback slide
            return create_animated_slide(fallback, slide_number, duration)
        
    @requires_duration
    @apply_to_mask
    @apply_to_audio
    def time_mirror(self):
        """
        Returns a clip that plays the current clip backwards.
        The clip must have its ``duration`` attribute set.
        The same effect is applied to the clip's audio and mask if any.
        """
        duration_per_frame = 1 / self.fps
        return self.fl_time(lambda t: np.max(self.duration - t - duration_per_frame, 0), keep_duration=True)

    def loop_video_to_duration(video_path, target_duration):
        """ Loops the video file to match the target duration by repeating it if necessary. """
        # Load the video using moviepy
        video = mp.VideoFileClip(video_path)
        
        # If the video duration is shorter than the target duration, loop it
        if video.duration < target_duration:
            # Calculate how many times the video needs to be repeated
            looped_video = video.loop(duration=target_duration)

            looped_video = time_mirror(looped_video)
            
            # Write the final looped video to the file
            looped_video.write_videofile(video_path, codec="libx264", fps=24)
        
        # Close the video to free up resources
        video.close()


    def create_video_from_animated_slides(slide_videos, timestamps, audio_file, output_file):
        # Initialize a list for timed video clips
        timed_clips = []

        # Iterate through the slide videos and their corresponding timestamps
        for index, (slide_video, (slide, start_time)) in enumerate(zip(slide_videos, timestamps)):
            print("video", index)
            # Load the slide video
            video_clip = VideoFileClip(slide_video)
            
            # Set the start and end times based on the timestamp
            start_time = timestamps[index][1]
            end_time = timestamps[index + 1][1] if index + 1 < len(timestamps) else video_clip.duration + start_time

            # Adjust the video clip duration to match the required time range
            video_clip = video_clip.set_start(start_time).set_duration(end_time - start_time)
            
            # Add to the list of timed clips
            timed_clips.append(video_clip)

        # Concatenate all the timed slides
        final_video = concatenate_videoclips(timed_clips, method="compose")

        # Load the audio and set it for the video
        if audio_file:
            audio = AudioFileClip(audio_file)
            final_video = final_video.set_audio(audio)

        # Write the final video to file
        final_video.write_videofile(output_file, fps=24)

    # Process the slides and animations
    slide_videos = []
    for index, (slide, animation_code) in enumerate(zip(data, animations)):
        duration = timestamps[index + 1][1] - timestamps[index][1] if index < len(timestamps) - 1 else 0

        print(animation_code)
        if animation_code.strip() == 'no':
            slide_video = create_animated_slide(slide['slide'], index + 1, duration)
        else:
            slide_video = run_animation(animation_code, index + 1, duration, slide['slide'])

        slide_videos.append(slide_video)

    create_video_from_animated_slides(slide_videos, timestamps, "sonic.wav", "final_lecture_video.mp4")

    # for slide in slide_videos:
    #     os.remove(slide)

    def video_to_blob(video_file_path):
        # Open the video file in binary read mode
        with open(video_file_path, "rb") as video_file:
            video_blob = video_file.read()  # Read the file as binary (BLOB)
        return video_blob

    video_blob = video_to_blob("final_lecture_video.mp4")

    return jsonify({"video_blob": video_blob})

if __name__ == "__main__":
    app.run(debug=True)