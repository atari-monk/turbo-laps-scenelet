from pydub import AudioSegment
from pydub.generators import Sine

# 2. Generate click sound (short beep, 0.2 seconds)
click = Sine(1000).to_audio_segment(duration=200)  # 1000 Hz
click.export("click.wav", format="wav")

# 3. Generate effect sound (short descending tone, 1 second)
effect = Sine(800).to_audio_segment(duration=500).fade_out(500)
effect.export("effect.mp3", format="mp3")

print("Test sounds generated!")
