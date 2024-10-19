import matplotlib.pyplot as plt
import numpy as np
from moviepy.video.io.bindings import mplfig_to_npimage
from moviepy.editor import VideoClip

# Create an animated sine wave
def create_animated_sine_wave(duration=5):
    fig, ax = plt.subplots()
    x = np.linspace(0, 2 * np.pi, 200)
    
    def make_frame(t):
        ax.clear()
        ax.set_xlim(0, 2 * np.pi)
        ax.set_ylim(-1.5, 1.5)
        ax.plot(x, np.sin(x + 2 * np.pi * t / duration), lw=3)
        return mplfig_to_npimage(fig)  # Convert Matplotlib figure to an image
    
    animation = VideoClip(make_frame, duration=duration)
    return animation

# Create and save the animated sine wave
sine_wave_clip = create_animated_sine_wave()
sine_wave_clip.write_videofile("animated_sine_wave.mp4", fps=24)
