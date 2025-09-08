import argparse
import numpy as np
from scipy.io import wavfile
from scipy import signal
import json
import os

class EngineSoundConfig:
    def __init__(self, sample_rate=44100, duration=10, base_freq=120, rpm_variation=0.5, 
                 exhaust_notes=3, main_amplitude=0.6, harmonic_amplitude=0.4, 
                 exhaust_amplitude=0.7, rpm_modulation_freq=0.5, rpm_modulation_depth=0.3,
                 harmonic_weights=None, burst_count=2000, min_burst_length=50, max_burst_length=200,
                 seamless_loop=True, loop_length=4.0):
        self.sample_rate = sample_rate
        self.duration = duration
        self.base_freq = base_freq
        self.rpm_variation = rpm_variation
        self.exhaust_notes = exhaust_notes
        self.main_amplitude = main_amplitude
        self.harmonic_amplitude = harmonic_amplitude
        self.exhaust_amplitude = exhaust_amplitude
        self.rpm_modulation_freq = rpm_modulation_freq
        self.rpm_modulation_depth = rpm_modulation_depth
        self.harmonic_weights = harmonic_weights or [0.7/2, 0.7/3, 0.7/4, 0.7/5]
        self.burst_count = burst_count
        self.min_burst_length = min_burst_length
        self.max_burst_length = max_burst_length
        self.seamless_loop = seamless_loop
        self.loop_length = loop_length

    def to_dict(self):
        return {
            'sample_rate': self.sample_rate,
            'duration': self.duration,
            'base_freq': self.base_freq,
            'rpm_variation': self.rpm_variation,
            'exhaust_notes': self.exhaust_notes,
            'main_amplitude': self.main_amplitude,
            'harmonic_amplitude': self.harmonic_amplitude,
            'exhaust_amplitude': self.exhaust_amplitude,
            'rpm_modulation_freq': self.rpm_modulation_freq,
            'rpm_modulation_depth': self.rpm_modulation_depth,
            'harmonic_weights': self.harmonic_weights,
            'burst_count': self.burst_count,
            'min_burst_length': self.min_burst_length,
            'max_burst_length': self.max_burst_length,
            'seamless_loop': self.seamless_loop,
            'loop_length': self.loop_length
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

class EngineSoundGenerator:
    def __init__(self, config=None):
        self.config = config or EngineSoundConfig()
        self.t = np.linspace(0, self.config.duration, int(self.config.sample_rate * self.config.duration), endpoint=False)

    def generate_engine_sound(self):
        main_engine = self._generate_engine_rumble()
        exhaust = self._generate_exhaust_notes()
        combined = main_engine + self.config.exhaust_amplitude * exhaust
        
        if self.config.seamless_loop:
            combined = self._apply_seamless_loop(combined)
        
        return self._normalize_audio(combined)

    def _generate_engine_rumble(self):
        rpm_modulation = self.config.rpm_modulation_depth * np.sin(2 * np.pi * self.config.rpm_modulation_freq * self.t) + (1 - self.config.rpm_modulation_depth)
        freq_modulation = self.config.base_freq * (1 + self.config.rpm_variation * rpm_modulation)
        
        if self.config.seamless_loop:
            phase_integral = np.cumsum(freq_modulation) / self.config.sample_rate
            phase_integral -= phase_integral[0]
            
            cycles = phase_integral[-1]
            if cycles > 0:
                phase_integral = phase_integral * (np.floor(cycles) / cycles)
            
            main_oscillator = np.sin(2 * np.pi * phase_integral)
        else:
            main_oscillator = np.sin(2 * np.pi * np.cumsum(freq_modulation) / self.config.sample_rate)
        
        harmonics = np.zeros_like(main_oscillator)
        for i, weight in enumerate(self.config.harmonic_weights, start=2):
            if self.config.seamless_loop:
                harmonic_phase = phase_integral * i
                harmonics += weight * np.sin(2 * np.pi * harmonic_phase)
            else:
                harmonics += weight * np.sin(2 * np.pi * i * np.cumsum(freq_modulation) / self.config.sample_rate)
        
        return self.config.main_amplitude * main_oscillator + self.config.harmonic_amplitude * harmonics

    def _generate_exhaust_notes(self):
        exhaust_sound = np.zeros_like(self.t)
        if self.config.exhaust_amplitude == 0:
            return exhaust_sound
            
        for i in range(self.config.exhaust_notes):
            note_freq = self.config.base_freq * (i + 1) * 0.5
            burst_points = np.random.choice(len(self.t), size=self.config.burst_count, replace=False)
            for point in burst_points:
                burst_length = np.random.randint(self.config.min_burst_length, self.config.max_burst_length)
                if point + burst_length < len(exhaust_sound):
                    burst = np.random.randn(burst_length) * 0.3
                    burst *= np.hanning(burst_length)
                    exhaust_sound[point:point+burst_length] += burst
        
        if self.config.seamless_loop:
            exhaust_sound = self._fade_exhaust_edges(exhaust_sound)
            
        return exhaust_sound

    def _apply_seamless_loop(self, audio):
        loop_samples = int(self.config.loop_length * self.config.sample_rate)
        if loop_samples > len(audio):
            return audio
            
        audio_loop = audio[:loop_samples]
        
        fade_duration = 0.1
        fade_samples = int(fade_duration * self.config.sample_rate)
        
        if fade_samples * 2 > len(audio_loop):
            return audio_loop
            
        crossfade = np.linspace(0, 1, fade_samples)
        audio_start = audio_loop[:fade_samples]
        audio_end = audio_loop[-fade_samples:]
        
        crossfaded_section = audio_start * (1 - crossfade) + audio_end * crossfade
        
        seamless_loop = np.concatenate([
            crossfaded_section,
            audio_loop[fade_samples:-fade_samples],
            crossfaded_section
        ])
        
        full_audio = np.tile(seamless_loop, int(np.ceil(len(audio) / len(seamless_loop))))
        
        return full_audio[:len(audio)]

    def _fade_exhaust_edges(self, audio, fade_duration=0.05):
        fade_samples = int(fade_duration * self.config.sample_rate)
        fade_out = np.linspace(1, 0, fade_samples)
        audio[-fade_samples:] *= fade_out
        return audio

    def _normalize_audio(self, audio):
        audio_max = np.max(np.abs(audio))
        return audio / audio_max if audio_max > 0 else audio

    def apply_constant_envelope(self, audio):
        return audio

    def save_to_wav(self, audio, filename):
        wavfile.write(filename, self.config.sample_rate, np.int16(audio * 32767))

def create_default_config(filename='engine.json'):
    config = EngineSoundConfig()
    config.save(filename)
    return f"Default configuration saved to {filename}"

def main():
    parser = argparse.ArgumentParser(description="Generate Formula 1 engine sound")
    parser.add_argument("--output", "-o", default="car-engine.wav", help="Output WAV filename")
    parser.add_argument("--config", "-c", default="engine.json", help="Configuration JSON file")
    parser.add_argument("--create-config", action="store_true", help="Create a default configuration file and exit")
    args = parser.parse_args()

    if args.create_config:
        result = create_default_config(args.config)
        print(result)
        return

    if os.path.exists(args.config):
        config = EngineSoundConfig.load(args.config)
    else:
        print(f"Config file {args.config} not found, using default parameters")
        config = EngineSoundConfig()

    generator = EngineSoundGenerator(config)
    engine_sound = generator.generate_engine_sound()
    engine_sound = generator.apply_constant_envelope(engine_sound)
    generator.save_to_wav(engine_sound, args.output)
    print(f"Engine sound saved to {args.output}")

if __name__ == "__main__":
    main()