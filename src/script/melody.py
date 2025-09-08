import numpy as np
from pydub import AudioSegment
from pydub.playback import play

# Function to generate a sine wave for a given frequency and duration
def generate_tone(frequency, duration_ms, volume=-20.0):
    sample_rate = 44100  # Samples per second
    t = np.linspace(0, duration_ms / 1000, int(sample_rate * duration_ms / 1000), False)
    tone = np.sin(frequency * t * 2 * np.pi)  # Generate sine wave
    audio = np.int16(tone * 32767)  # Convert to 16-bit PCM
    segment = AudioSegment(audio.tobytes(), frame_rate=sample_rate, sample_width=2, channels=1)
    segment = segment + volume  # Adjust volume
    return segment

# Define a simple melody in frequencies (Hz)
melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]  # C major scale
durations = [500, 500, 500, 500, 500, 500, 500, 500]  # Duration of each note in ms

# Combine notes into a melody
song = AudioSegment.silent(duration=0)
for freq, dur in zip(melody, durations):
    song += generate_tone(freq, dur)

# Play the melody
play(song)

# Optionally save as a file
song.export("melody.wav", format="wav")
