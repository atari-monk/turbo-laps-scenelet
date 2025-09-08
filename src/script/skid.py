import argparse
import numpy as np
from scipy.io import wavfile
from scipy import signal
import json
import os

class SkidSoundConfig:
    def __init__(self, sample_rate=44100, duration=3, base_freq=200, 
                 freq_variation=0.3, amplitude_envelope_attack=0.05, 
                 amplitude_envelope_release=0.3, noise_amplitude=0.8, 
                 tone_amplitude=0.4, rumble_amplitude=0.2, 
                 rumble_freq_low=30, rumble_freq_high=80, 
                 texture_variation=0.5, seamless_loop=False):
        self.sample_rate = sample_rate
        self.duration = duration
        self.base_freq = base_freq
        self.freq_variation = freq_variation
        self.amplitude_envelope_attack = amplitude_envelope_attack
        self.amplitude_envelope_release = amplitude_envelope_release
        self.noise_amplitude = noise_amplitude
        self.tone_amplitude = tone_amplitude
        self.rumble_amplitude = rumble_amplitude
        self.rumble_freq_low = rumble_freq_low
        self.rumble_freq_high = rumble_freq_high
        self.texture_variation = texture_variation
        self.seamless_loop = seamless_loop

    def to_dict(self):
        return {
            'sample_rate': self.sample_rate,
            'duration': self.duration,
            'base_freq': self.base_freq,
            'freq_variation': self.freq_variation,
            'amplitude_envelope_attack': self.amplitude_envelope_attack,
            'amplitude_envelope_release': self.amplitude_envelope_release,
            'noise_amplitude': self.noise_amplitude,
            'tone_amplitude': self.tone_amplitude,
            'rumble_amplitude': self.rumble_amplitude,
            'rumble_freq_low': self.rumble_freq_low,
            'rumble_freq_high': self.rumble_freq_high,
            'texture_variation': self.texture_variation,
            'seamless_loop': self.seamless_loop
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

class SkidSoundGenerator:
    def __init__(self, config=None):
        self.config = config or SkidSoundConfig()
        self.t = np.linspace(0, self.config.duration, int(self.config.sample_rate * self.config.duration), endpoint=False)

    def generate_skid_sound(self):
        noise_component = self._generate_noise_component()
        tone_component = self._generate_tone_component()
        rumble_component = self._generate_rumble_component()
        
        combined = (self.config.noise_amplitude * noise_component + 
                   self.config.tone_amplitude * tone_component + 
                   self.config.rumble_amplitude * rumble_component)
        
        envelope = self._generate_amplitude_envelope()
        enveloped = combined * envelope
        
        return self._normalize_audio(enveloped)

    def _generate_noise_component(self):
        white_noise = np.random.randn(len(self.t))
        filtered_noise = self._apply_bandpass_filter(white_noise, 800, 5000)
        textured_noise = self._apply_texture_variation(filtered_noise)
        return textured_noise

    def _generate_tone_component(self):
        freq_modulation = self.config.base_freq * (1 + self.config.freq_variation * np.random.randn(len(self.t)))
        phase_integral = np.cumsum(freq_modulation) / self.config.sample_rate
        return np.sin(2 * np.pi * phase_integral)

    def _generate_rumble_component(self):
        rumble_freq = np.random.uniform(self.config.rumble_freq_low, self.config.rumble_freq_high, len(self.t))
        phase_integral = np.cumsum(rumble_freq) / self.config.sample_rate
        return np.sin(2 * np.pi * phase_integral)

    def _generate_amplitude_envelope(self):
        attack_samples = int(self.config.amplitude_envelope_attack * self.config.sample_rate)
        release_samples = int(self.config.amplitude_envelope_release * self.config.sample_rate)
        sustain_samples = len(self.t) - attack_samples - release_samples
        
        if sustain_samples < 0:
            attack_ratio = attack_samples / (attack_samples + release_samples)
            attack_samples = int(attack_ratio * len(self.t))
            release_samples = len(self.t) - attack_samples
            sustain_samples = 0
        
        attack = np.linspace(0, 1, attack_samples)
        sustain = np.ones(sustain_samples)
        release = np.linspace(1, 0, release_samples)
        
        return np.concatenate([attack, sustain, release])

    def _apply_bandpass_filter(self, audio, lowcut, highcut, order=4):
        nyquist = 0.5 * self.config.sample_rate
        low = lowcut / nyquist
        high = highcut / nyquist
        b, a = signal.butter(order, [low, high], btype='band')
        return signal.lfilter(b, a, audio)

    def _apply_texture_variation(self, audio):
        variation_samples = int(0.1 * self.config.sample_rate)
        variation_points = np.random.choice(len(audio) - variation_samples, size=10, replace=False)
        
        for point in variation_points:
            variation = 1 + self.config.texture_variation * (np.random.random() - 0.5)
            audio[point:point+variation_samples] *= variation
        
        return audio

    def _normalize_audio(self, audio):
        audio_max = np.max(np.abs(audio))
        return audio / audio_max if audio_max > 0 else audio

    def save_to_wav(self, audio, filename):
        wavfile.write(filename, self.config.sample_rate, np.int16(audio * 32767))

def create_skid_config(filename='skid.json'):
    config = SkidSoundConfig()
    config.save(filename)
    return f"Skid sound configuration saved to {filename}"

def main():
    parser = argparse.ArgumentParser(description="Generate car skid sound")
    parser.add_argument("--output", "-o", default="car-skid.wav", help="Output WAV filename")
    parser.add_argument("--config", "-c", default="skid.json", help="Configuration JSON file")
    parser.add_argument("--create-config", action="store_true", help="Create a default configuration file and exit")
    args = parser.parse_args()

    if args.create_config:
        result = create_skid_config(args.config)
        print(result)
        return

    if os.path.exists(args.config):
        config = SkidSoundConfig.load(args.config)
    else:
        print(f"Config file {args.config} not found, using default parameters")
        config = SkidSoundConfig()

    generator = SkidSoundGenerator(config)
    skid_sound = generator.generate_skid_sound()
    generator.save_to_wav(skid_sound, args.output)
    print(f"Skid sound saved to {args.output}")

if __name__ == "__main__":
    main()