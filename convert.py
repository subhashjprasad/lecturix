from moviepy.editor import TextClip, CompositeVideoClip, ColorClip, VideoFileClip, AudioFileClip, concatenate_videoclips
import os
import base64

def video_to_blob(video_file_path):
    # Open the video file in binary read mode
    with open(video_file_path, "rb") as video_file:
        video_blob = video_file.read()  # Read the file as binary (BLOB)
    return video_blob

def save_blob_to_file(blob, output_path):
    with open(output_path, "wb") as file:
        file.write(blob)


def save_blob_to_txt(blob, output_path):
    # Convert binary blob to Base64 string
    base64_encoded_blob = base64.b64encode(blob).decode('utf-8')
    
    # Write the Base64 string to a .txt file
    with open(output_path, "w") as file:
        file.write(base64_encoded_blob)

# Save the video blob to a .txt file

video_blob = video_to_blob("final_lecture_video.mp4")

save_blob_to_txt(video_blob, "output_video.txt")