import argparse
import numpy as np
from scipy.io import wavfile
import json
import os

class HornSoundConfig:
    def __init__(self, sample_rate=44100, duration=1.5, 
                 primary_freq=420, secondary_freq=350,
                 attack_time=0.05, decay_time=0.1,
                 sustain_time=1.0, release_time=0.35,
                 amplitude=0.8):
        self.sample_rate = sample_rate
        self.duration = duration
        self.primary_freq = primary_freq
        self.secondary_freq = secondary_freq
        self.attack_time = attack_time
        self.decay_time = decay_time
        self.sustain_time = sustain_time
        self.release_time = release_time
        self.amplitude = amplitude

    def to_dict(self):
        return {
            'sample_rate': self.sample_rate,
            'duration': self.duration,
            'primary_freq': self.primary_freq,
            'secondary_freq': self.secondary_freq,
            'attack_time': self.attack_time,
            'decay_time': self.decay_time,
            'sustain_time': self.sustain_time,
            'release_time': self.release_time,
            'amplitude': self.amplitude
        }

    @classmethod
    def from_dict(cls, config_dict):
        return cls(**config_dict)

    def save(self, filename):
        with open(filename, 'w') as f:
            json.dump(self.to_dict(), f, indent=4)

    @classmethod
    def load(cls, filename):
        with open(filename, 'r') as f:
            config_dict = json.load(f)
        return cls.from_dict(config_dict)

class HornSoundGenerator:
    def __init__(self, config=None):
        self.config = config or HornSoundConfig()
        total_samples = int(self.config.sample_rate * self.config.duration)
        self.t = np.linspace(0, self.config.duration, total_samples, endpoint=False)

    def generate_horn_sound(self):
        primary_tone = np.sin(2 * np.pi * self.config.primary_freq * self.t)
        secondary_tone = np.sin(2 * np.pi * self.config.secondary_freq * self.t)
        
        combined_wave = 0.6 * primary_tone + 0.4 * secondary_tone
        
        envelope = self._create_envelope()
        enveloped_sound = combined_wave * envelope
        
        return self._normalize_audio(enveloped_sound)

    def _create_envelope(self):
        total_samples = len(self.t)
        envelope = np.zeros(total_samples)
        
        attack_samples = int(self.config.attack_time * self.config.sample_rate)
        decay_samples = int(self.config.decay_time * self.config.sample_rate)
        sustain_samples = int(self.config.sustain_time * self.config.sample_rate)
        release_samples = int(self.config.release_time * self.config.sample_rate)
        
        attack_end = attack_samples
        decay_end = attack_end + decay_samples
        sustain_end = decay_end + sustain_samples
        release_end = min(sustain_end + release_samples, total_samples)
        
        envelope[:attack_end] = np.linspace(0, 1, attack_samples)
        envelope[attack_end:decay_end] = np.linspace(1, 0.9, decay_samples)
        envelope[decay_end:sustain_end] = 0.9
        release_portion = min(release_samples, total_samples - sustain_end)
        envelope[sustain_end:release_end] = np.linspace(0.9, 0, release_portion)
        
        return envelope

    def _normalize_audio(self, audio):
        audio_max = np.max(np.abs(audio))
        return self.config.amplitude * (audio / audio_max) if audio_max > 0 else audio

    def save_to_wav(self, audio, filename):
        wavfile.write(filename, self.config.sample_rate, np.int16(audio * 32767))

def create_horn_config(filename='horn.json'):
    config = HornSoundConfig()
    config.save(filename)
    return f"Horn configuration saved to {filename}"

def main():
    parser = argparse.ArgumentParser(description="Generate standard car horn sound")
    parser.add_argument("--output", "-o", default="car-horn.wav", help="Output WAV filename")
    parser.add_argument("--config", "-c", default="horn.json", help="Configuration JSON file")
    parser.add_argument("--create-config", action="store_true", help="Create a default configuration file and exit")
    args = parser.parse_args()

    if args.create_config:
        result = create_horn_config(args.config)
        print(result)
        return

    if os.path.exists(args.config):
        config = HornSoundConfig.load(args.config)
    else:
        print(f"Config file {args.config} not found, using default parameters")
        config = HornSoundConfig()

    generator = HornSoundGenerator(config)
    horn_sound = generator.generate_horn_sound()
    generator.save_to_wav(horn_sound, args.output)
    print(f"Horn sound saved to {args.output}")

if __name__ == "__main__":
    main()