import argparse
import numpy as np
from scipy.io import wavfile
from scipy import signal
import json
import os

class CrashSoundConfig:
    def __init__(self, sample_rate=44100, duration=4.5, impact_amplitude=0.9, 
                 metal_crumple_amplitude=0.7, glass_break_amplitude=0.5, debris_scatter_amplitude=0.4,
                 tire_screech_amplitude=0.6, impact_duration=0.15, metal_crumple_duration=2.0, 
                 glass_break_duration=1.2, debris_scatter_duration=3.0, tire_screech_duration=1.8,
                 low_freq_impact=60, mid_freq_impact=180, high_freq_impact=400,
                 metal_crumple_freq_range=(300, 1500), glass_break_freq_range=(2500, 10000),
                 debris_count=25, min_debris_length=80, max_debris_length=600,
                 screech_freq_start=800, screech_freq_end=200, secondary_impacts=3,
                 reverberation_time=1.2, impact_attack_time=0.005, impact_decay_time=0.1):
        self.sample_rate = sample_rate
        self.duration = duration
        self.impact_amplitude = impact_amplitude
        self.metal_crumple_amplitude = metal_crumple_amplitude
        self.glass_break_amplitude = glass_break_amplitude
        self.debris_scatter_amplitude = debris_scatter_amplitude
        self.tire_screech_amplitude = tire_screech_amplitude
        self.impact_duration = impact_duration
        self.metal_crumple_duration = metal_crumple_duration
        self.glass_break_duration = glass_break_duration
        self.debris_scatter_duration = debris_scatter_duration
        self.tire_screech_duration = tire_screech_duration
        self.low_freq_impact = low_freq_impact
        self.mid_freq_impact = mid_freq_impact
        self.high_freq_impact = high_freq_impact
        self.metal_crumple_freq_range = metal_crumple_freq_range
        self.glass_break_freq_range = glass_break_freq_range
        self.debris_count = debris_count
        self.min_debris_length = min_debris_length
        self.max_debris_length = max_debris_length
        self.screech_freq_start = screech_freq_start
        self.screech_freq_end = screech_freq_end
        self.secondary_impacts = secondary_impacts
        self.reverberation_time = reverberation_time
        self.impact_attack_time = impact_attack_time
        self.impact_decay_time = impact_decay_time

    def to_dict(self):
        return {
            'sample_rate': self.sample_rate,
            'duration': self.duration,
            'impact_amplitude': self.impact_amplitude,
            'metal_crumple_amplitude': self.metal_crumple_amplitude,
            'glass_break_amplitude': self.glass_break_amplitude,
            'debris_scatter_amplitude': self.debris_scatter_amplitude,
            'tire_screech_amplitude': self.tire_screech_amplitude,
            'impact_duration': self.impact_duration,
            'metal_crumple_duration': self.metal_crumple_duration,
            'glass_break_duration': self.glass_break_duration,
            'debris_scatter_duration': self.debris_scatter_duration,
            'tire_screech_duration': self.tire_screech_duration,
            'low_freq_impact': self.low_freq_impact,
            'mid_freq_impact': self.mid_freq_impact,
            'high_freq_impact': self.high_freq_impact,
            'metal_crumple_freq_range': self.metal_crumple_freq_range,
            'glass_break_freq_range': self.glass_break_freq_range,
            'debris_count': self.debris_count,
            'min_debris_length': self.min_debris_length,
            'max_debris_length': self.max_debris_length,
            'screech_freq_start': self.screech_freq_start,
            'screech_freq_end': self.screech_freq_end,
            'secondary_impacts': self.secondary_impacts,
            'reverberation_time': self.reverberation_time,
            'impact_attack_time': self.impact_attack_time,
            'impact_decay_time': self.impact_decay_time
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

class CrashSoundGenerator:
    def __init__(self, config=None):
        self.config = config or CrashSoundConfig()
        total_samples = int(self.config.sample_rate * self.config.duration)
        self.t = np.linspace(0, self.config.duration, total_samples, endpoint=False)

    def generate_crash_sound(self):
        impact_sound = self._generate_impact_sound()
        metal_crumple = self._generate_metal_crumple()
        glass_break = self._generate_glass_break()
        debris_scatter = self._generate_debris_scatter()
        tire_screech = self._generate_tire_screech()
        secondary_impacts = self._generate_secondary_impacts()
        
        combined = (impact_sound + metal_crumple + glass_break + 
                   debris_scatter + tire_screech + secondary_impacts)
        
        combined = self._apply_reverberation(combined)
        return self._normalize_audio(combined)

    def _generate_impact_sound(self):
        impact_samples = int(self.config.impact_duration * self.config.sample_rate)
        impact_t = np.linspace(0, self.config.impact_duration, impact_samples)
        
        low_freq = np.sin(2 * np.pi * self.config.low_freq_impact * impact_t)
        mid_freq = np.sin(2 * np.pi * self.config.mid_freq_impact * impact_t)
        high_freq = np.sin(2 * np.pi * self.config.high_freq_impact * impact_t)
        
        attack_samples = int(self.config.impact_attack_time * self.config.sample_rate)
        decay_samples = int(self.config.impact_decay_time * self.config.sample_rate)
        
        attack_env = np.linspace(0, 1, attack_samples)
        decay_env = np.exp(-5 * impact_t[:decay_samples])
        
        envelope = np.ones_like(impact_t)
        envelope[:attack_samples] = attack_env
        envelope[attack_samples:attack_samples+decay_samples] = decay_env[:len(envelope)-attack_samples]
        if len(envelope) > attack_samples + decay_samples:
            envelope[attack_samples+decay_samples:] = 0
        
        impact_sound = (0.6 * low_freq + 0.3 * mid_freq + 0.1 * high_freq) * envelope
        
        full_sound = np.zeros_like(self.t)
        full_sound[:len(impact_sound)] = impact_sound * self.config.impact_amplitude
        
        return full_sound

    def _generate_metal_crumple(self):
        metal_samples = int(self.config.metal_crumple_duration * self.config.sample_rate)
        metal_t = np.linspace(0, self.config.metal_crumple_duration, metal_samples)
        
        metal_sound = np.zeros_like(metal_t)
        for freq in np.linspace(self.config.metal_crumple_freq_range[0], self.config.metal_crumple_freq_range[1], 12):
            freq_variation = freq * (1 + 0.1 * np.sin(2 * np.pi * 8 * metal_t))
            metal_sound += np.sin(2 * np.pi * freq_variation * metal_t) * np.random.uniform(0.1, 0.25)
        
        noise = np.random.randn(metal_samples) * 0.3
        metal_sound += noise
        
        envelope = np.exp(-1.5 * metal_t)
        metal_sound *= envelope
        
        full_sound = np.zeros_like(self.t)
        start_pos = int(0.08 * self.config.sample_rate)
        end_pos = start_pos + len(metal_sound)
        if end_pos > len(full_sound):
            metal_sound = metal_sound[:len(full_sound) - start_pos]
        full_sound[start_pos:start_pos + len(metal_sound)] = metal_sound * self.config.metal_crumple_amplitude
        
        return full_sound

    def _generate_glass_break(self):
        glass_samples = int(self.config.glass_break_duration * self.config.sample_rate)
        glass_t = np.linspace(0, self.config.glass_break_duration, glass_samples)
        
        glass_sound = np.zeros_like(glass_t)
        for freq in np.linspace(self.config.glass_break_freq_range[0], self.config.glass_break_freq_range[1], 20):
            component = np.sin(2 * np.pi * freq * glass_t + np.random.uniform(0, 2*np.pi))
            decay_rate = np.random.uniform(3, 8)
            component *= np.exp(-decay_rate * glass_t)
            glass_sound += component * np.random.uniform(0.03, 0.12)
        
        glass_noise = np.random.randn(glass_samples) * 0.2
        glass_noise *= np.exp(-6 * glass_t)
        glass_sound += glass_noise
        
        full_sound = np.zeros_like(self.t)
        start_pos = int(0.1 * self.config.sample_rate)
        end_pos = start_pos + len(glass_sound)
        if end_pos > len(full_sound):
            glass_sound = glass_sound[:len(full_sound) - start_pos]
        full_sound[start_pos:start_pos + len(glass_sound)] = glass_sound * self.config.glass_break_amplitude
        
        return full_sound

    def _generate_debris_scatter(self):
        debris_sound = np.zeros_like(self.t)
        
        for _ in range(self.config.debris_count):
            burst_length = np.random.randint(self.config.min_debris_length, self.config.max_debris_length)
            start_point = np.random.randint(int(0.2 * self.config.sample_rate), 
                                          int(0.8 * len(debris_sound) - burst_length))
            
            burst = np.random.randn(burst_length) * 0.5
            burst *= np.hanning(burst_length)
            
            freq_mod = np.random.uniform(0.7, 1.5)
            t_burst = np.linspace(0, burst_length/self.config.sample_rate, burst_length)
            tone_component = np.sin(2 * np.pi * 250 * freq_mod * t_burst) * 0.4
            
            combined_burst = burst + tone_component
            envelope = np.exp(-4 * t_burst)
            combined_burst *= envelope
            
            debris_sound[start_point:start_point + burst_length] += combined_burst
        
        return debris_sound * self.config.debris_scatter_amplitude

    def _generate_tire_screech(self):
        screech_samples = int(self.config.tire_screech_duration * self.config.sample_rate)
        screech_t = np.linspace(0, self.config.tire_screech_duration, screech_samples)
        
        freq_sweep = np.linspace(self.config.screech_freq_start, self.config.screech_freq_end, screech_samples)
        phase_integral = np.cumsum(freq_sweep) / self.config.sample_rate
        screech_sound = np.sin(2 * np.pi * phase_integral)
        
        screech_noise = np.random.randn(screech_samples) * 0.4
        screech_sound += screech_noise
        
        envelope = np.ones_like(screech_t)
        fade_out = np.linspace(1, 0, int(0.3 * screech_samples))
        envelope[-len(fade_out):] = fade_out
        
        screech_sound *= envelope
        
        full_sound = np.zeros_like(self.t)
        start_pos = 0
        end_pos = start_pos + len(screech_sound)
        if end_pos > len(full_sound):
            screech_sound = screech_sound[:len(full_sound) - start_pos]
        full_sound[start_pos:start_pos + len(screech_sound)] = screech_sound * self.config.tire_screech_amplitude
        
        return full_sound

    def _generate_secondary_impacts(self):
        secondary_sound = np.zeros_like(self.t)
        
        for i in range(self.config.secondary_impacts):
            impact_time = 0.3 + i * 0.4
            impact_samples = int(0.1 * self.config.sample_rate)
            impact_t = np.linspace(0, 0.1, impact_samples)
            
            freq = np.random.uniform(100, 300)
            impact = np.sin(2 * np.pi * freq * impact_t)
            impact *= np.exp(-8 * impact_t)
            
            start_pos = int(impact_time * self.config.sample_rate)
            end_pos = start_pos + len(impact)
            if end_pos > len(secondary_sound):
                impact = impact[:len(secondary_sound) - start_pos]
            
            secondary_sound[start_pos:start_pos + len(impact)] += impact * 0.4
        
        return secondary_sound

    def _apply_reverberation(self, audio):
        reverb_samples = int(self.config.reverberation_time * self.config.sample_rate)
        impulse_response = np.exp(-5 * np.linspace(0, self.config.reverberation_time, reverb_samples))
        impulse_response *= np.random.uniform(0.5, 1.0, reverb_samples)
        
        reverberated = np.convolve(audio, impulse_response, mode='same')
        return audio + 0.3 * reverberated

    def _normalize_audio(self, audio):
        audio_max = np.max(np.abs(audio))
        return audio / audio_max if audio_max > 0 else audio

    def save_to_wav(self, audio, filename):
        wavfile.write(filename, self.config.sample_rate, np.int16(audio * 32767))

def create_default_crash_config(filename='crash.json'):
    config = CrashSoundConfig()
    config.save(filename)
    return f"Default crash configuration saved to {filename}"

def main():
    parser = argparse.ArgumentParser(description="Generate car crash sound")
    parser.add_argument("--output", "-o", default="car-crash.wav", help="Output WAV filename")
    parser.add_argument("--config", "-c", default="crash.json", help="Configuration JSON file")
    parser.add_argument("--create-config", action="store_true", help="Create a default configuration file and exit")
    args = parser.parse_args()

    if args.create_config:
        result = create_default_crash_config(args.config)
        print(result)
        return

    if os.path.exists(args.config):
        config = CrashSoundConfig.load(args.config)
    else:
        print(f"Config file {args.config} not found, using default parameters")
        config = CrashSoundConfig()

    generator = CrashSoundGenerator(config)
    crash_sound = generator.generate_crash_sound()
    generator.save_to_wav(crash_sound, args.output)
    print(f"Crash sound saved to {args.output}")

if __name__ == "__main__":
    main()