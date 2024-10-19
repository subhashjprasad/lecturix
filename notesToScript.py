import os
from dotenv import load_dotenv
import google.generativeai as genai
import PIL.Image
import PyPDF2
from cartesia import Cartesia
import subprocess
import ffmpeg
import json

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel("gemini-1.5-flash")

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
    
input_type = "pdf"

prompt = "Create a detailed and comprehensive college-level lecture based on these notes. The lecture should be no more than 500 words in length. Remove any unnecessary formatting (that isn't part of an equation), like * before headers and # symbols."

if (input_type == "image"):
    lecture_notes = PIL.Image.open("notes.png")

elif (input_type == "pdf"):
    lecture_notes = read_pdf_content("notes.pdf")

elif (input_type == "txt"):
    lecture_notes = read_file_content("notes.txt")

elif (input_type == "text"): 
    lecture_notes = """
    **Introduction to Machine Learning**

    * What is machine learning?
    * Types of machine learning
    * Supervised vs. unsupervised learning
    * Applications of machine learning
    * Challenges in machine learning

    **Supervised Learning**

    * Regression analysis
    * Classification
    * Linear regression
    * Logistic regression
    * Decision trees
    * Random forests
    * Support vector machines
    * Neural networks
    """

else:
    print("invalid input type")
    exit()

response = model.generate_content(
    [prompt, lecture_notes],
    generation_config=genai.types.GenerationConfig(
        max_output_tokens=50000,
        temperature=1.0,
    ),
)

prompt = "Based on the lecture script given, create corresponding slides for the script. The slides should only have a few key words on them. Return a JSON list of the text on these slides, mapped to the corresponding text in the script. If there is any LaTeX, please clear it."

response = model.generate_content(
    [prompt, response.text],
    # generation_config=genai.types.GenerationConfig(
    #     max_output_tokens=50000,
    #     temperature=1.0,
    # ),
)

json_text = response.text[7:-3]
data = json.loads(json_text)

client = Cartesia(api_key=os.getenv("CARTESIA_API_KEY"))

voice_id = "a0e99841-438c-4a64-b679-ae501e7d6091"  # Barbershop Man
model_id = "sonic-english"
transcript = response.text

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

# Prompt for the model
prompt = "This is the script that will be played alongside a certain slide in a lecture. If there is a reasonable graph/diagram/equation that could accompany this script, please provide the matplotlib code to create this figure, and animate it if possible (and only the python code, no other text). Otherwise, simply return 'no'"

for slide in data:
    response = model.generate_content(
        [prompt, slide['script']],
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=50000,
            temperature=1.0,
        ),
    )
    
    print(response.text)

    # Record the timestamp for this slide (in seconds)
    timestamps.append((slide['slide'], current_time))

    # Generate and stream audio
    total_bytes_written = 0
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

# Play the file
subprocess.run(["ffplay", "-autoexit", "-nodisp", "sonic.wav"])

# Print timestamps
for slide_text, timestamp in timestamps:
    print(f"Slide: {slide_text} starts at {timestamp:.2f} seconds")