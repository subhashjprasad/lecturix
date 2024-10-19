from moviepy.editor import TextClip, CompositeVideoClip, ColorClip, VideoFileClip, AudioFileClip, concatenate_videoclips
import os
def create_animated_slide(text, slide_number, duration=5):
    # Create a background clip
    background = ColorClip(size=(1280, 720), color=(255, 255, 255), duration=duration)  # White background
    # print(TextClip.search('Courier', 'font'))
    # Create a TextClip with animation
    txt_clip = TextClip(text, fontsize=70, color='black', size=(1280, 720))  # Text in black
    txt_clip = txt_clip.set_position('center').set_duration(duration)
    
    # Add fade-in and fade-out effects for smooth transitions
    txt_clip = txt_clip.crossfadein(1).crossfadeout(1)
    
    # Composite text onto the background
    final_clip = CompositeVideoClip([background, txt_clip])
    
    # Save the slide as an individual video clip
    output = f"slide_{slide_number}.mp4"
    final_clip.write_videofile(output, fps=24)
    return output

# Example usage
# slide_files = [create_animated_slide("Slide 1: Introduction to Python", 1),
#                create_animated_slide("Slide 2: Variables and Data Types", 2)]


def create_video_from_animated_slides(slide_videos, audio_file, output_file):
    # Load all the individual slide videos
    video_clips = [VideoFileClip(slide).set_duration(5) for slide in slide_videos]  # Assuming each slide lasts 5 seconds
    
    # Concatenate all the slides
    final_video = concatenate_videoclips(video_clips, method="compose")
    
    # Load the audio and set it for the video
    if audio_file:
        audio = AudioFileClip(audio_file)
        final_video = final_video.set_audio(audio)
    
    # Write the final video
    final_video.write_videofile(output_file, fps=24)
    
    # Cleanup: Delete all slide videos after creating the final video
    for slide in slide_videos:
        os.remove(slide)

# Example usage
# create_video_from_animated_slides(slide_files, None, "lecture_video.mp4")

def video_to_blob(video_file_path):
    # Open the video file in binary read mode
    with open(video_file_path, "rb") as video_file:
        video_blob = video_file.read()  # Read the file as binary (BLOB)
    return video_blob

