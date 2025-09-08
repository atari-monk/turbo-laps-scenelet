# Engine Sound Generator Configuration Guide

## Overview

This document describes all configuration parameters available for the Formula 1 engine sound generator. Each parameter controls specific aspects of the synthesized engine sound.

## Configuration Parameters

### Core Audio Settings

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sample_rate` | integer | 44100 | The sample rate for the audio output in Hz. Higher values provide better quality but larger file sizes. |
| `duration` | float | 10.0 | The length of the generated sound in seconds. |

### Engine Base Sound

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_freq` | float | 120.0 | The fundamental frequency of the engine sound in Hz. Higher values create a higher-pitched engine sound. |
| `main_amplitude` | float | 0.6 | The volume level of the main engine oscillator (0.0 to 1.0). |
| `harmonic_amplitude` | float | 0.4 | The volume level of the harmonic overtones (0.0 to 1.0). |

### Wobble/Modulation Effects

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rpm_variation` | float | 0.5 | The amount of random RPM variation (0.0 to 1.0). Higher values create more dramatic pitch changes. |
| `rpm_modulation_freq` | float | 0.5 | The frequency of the RPM modulation in Hz. Higher values create faster wobbling. |
| `rpm_modulation_depth` | float | 0.3 | The intensity of the wobble effect (0.0 to 1.0). Set to 0 for a steady engine sound. |

### Exhaust Sound

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `exhaust_notes` | integer | 3 | The number of distinct exhaust notes to generate. |
| `exhaust_amplitude` | float | 0.7 | The volume level of the exhaust sound (0.0 to 1.0). Set to 0 to disable exhaust noise completely. |
| `burst_count` | integer | 2000 | The number of random exhaust bursts to generate throughout the sound. |
| `min_burst_length` | integer | 50 | The minimum length of each exhaust burst in samples. |
| `max_burst_length` | integer | 200 | The maximum length of each exhaust burst in samples. |

### Harmonic Content

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `harmonic_weights` | array | [0.35, 0.233, 0.175, 0.14] | Relative amplitudes of harmonic overtones (2nd, 3rd, 4th, 5th harmonics). |

### Looping

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `seamless_loop` | boolean | true | When enabled, ensures the sound can loop without audible seams or clicks. |

## Recommended Values for Different Effects

### Steady Engine Sound
```json
{
  "rpm_variation": 0,
  "rpm_modulation_depth": 0,
  "exhaust_amplitude": 0.1
}
```

### Moderate Wobble
```json
{
  "rpm_variation": 0.3,
  "rpm_modulation_depth": 0.2,
  "rpm_modulation_freq": 0.5,
  "exhaust_amplitude": 0.3
}
```

### Aggressive F1 Sound
```json
{
  "rpm_variation": 0.6,
  "rpm_modulation_depth": 0.4,
  "rpm_modulation_freq": 1.2,
  "exhaust_amplitude": 0.7,
  "base_freq": 180
}
```

### Subtle Exhaust
```json
{
  "exhaust_amplitude": 0.05,
  "burst_count": 1000,
  "min_burst_length": 30,
  "max_burst_length": 100
}
```

## Usage Tips

1. Start with the default values and adjust one parameter at a time
2. For game looping, always set `seamless_loop` to `true`
3. Higher `base_freq` values work well for Formula 1 sounds
4. Use very low `exhaust_amplitude` values (0.01-0.05) for subtle background noise
5. Adjust `rpm_modulation_freq` to match the desired engine rev rhythm

## Example Configuration

```json
{
  "sample_rate": 44100,
  "duration": 5,
  "base_freq": 150,
  "rpm_variation": 0.4,
  "exhaust_notes": 4,
  "main_amplitude": 0.6,
  "harmonic_amplitude": 0.4,
  "exhaust_amplitude": 0.1,
  "rpm_modulation_freq": 0.8,
  "rpm_modulation_depth": 0.3,
  "harmonic_weights": [0.4, 0.3, 0.2, 0.1],
  "burst_count": 1500,
  "min_burst_length": 40,
  "max_burst_length": 150,
  "seamless_loop": true
}
```

# Update for seamless looping capabilities

## Overview

The engine sound configuration file (`engine_config.json`) controls the parameters for generating Formula 1 engine sounds with seamless looping capabilities.

## Configuration Parameters

### Audio Properties
- **`sample_rate`** (integer): Audio sample rate in Hz (typically 44100)
- **`duration`** (float): Total duration of generated sound in seconds
- **`loop_length`** (float): Length of the seamless loop segment in seconds (recommended: 4.0+)

### Engine Sound Characteristics
- **`base_freq`** (float): Fundamental frequency of the engine sound in Hz
- **`rpm_variation`** (float): Amount of RPM variation (0.0 to 1.0)
- **`main_amplitude`** (float): Volume level of the main engine oscillator (0.0 to 1.0)
- **`harmonic_amplitude`** (float): Volume level of harmonic frequencies (0.0 to 1.0)
- **`harmonic_weights`** (array): Relative amplitudes for harmonic frequencies

### Modulation Parameters
- **`rpm_modulation_freq`** (float): Frequency of RPM modulation in Hz
- **`rpm_modulation_depth`** (float): Depth of RPM modulation (0.0 to 1.0)

### Exhaust Sound Properties
- **`exhaust_notes`** (integer): Number of exhaust note layers
- **`exhaust_amplitude`** (float): Volume level of exhaust sounds (0.0 to 1.0)
- **`burst_count`** (integer): Number of random exhaust bursts
- **`min_burst_length`** (integer): Minimum length of exhaust bursts in samples
- **`max_burst_length`** (integer): Maximum length of exhaust bursts in samples

### Loop Settings
- **`seamless_loop`** (boolean): Enable/disable seamless looping (true/false)

## Recommended Values for Seamless Looping

For optimal seamless looping:
- Set `loop_length` to 4.0 seconds or longer
- Use `sample_rate` of 44100
- Enable `seamless_loop`: true
- Keep `rpm_modulation_freq` as a multiple of 1/loop_length
- Set `duration` longer than `loop_length` for testing

## Example Configuration

```json
{
    "sample_rate": 44100,
    "duration": 10,
    "base_freq": 120,
    "rpm_variation": 0.2,
    "exhaust_notes": 3,
    "main_amplitude": 0.6,
    "harmonic_amplitude": 0.4,
    "exhaust_amplitude": 0.01,
    "rpm_modulation_freq": 0.5,
    "rpm_modulation_depth": 0.3,
    "harmonic_weights": [0.35, 0.233, 0.175, 0.14],
    "burst_count": 2000,
    "min_burst_length": 50,
    "max_burst_length": 200,
    "seamless_loop": true,
    "loop_length": 4.0
}
```