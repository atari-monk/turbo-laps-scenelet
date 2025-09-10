import { ConfigService } from "../service/config-service";
import { DEFAULT_CAR_CONFIG } from "./default-car-config";
import { DEFAULT_SOUND_CONFIG } from "./default-sound-config";
import type { CarConfig } from "./type/car-config";
import type { CarSoundConfig } from "./type/car-sound-config";

export async function loadCarConfigurations(): Promise<{
    carConfig: CarConfig;
    soundConfig: CarSoundConfig;
}> {
    try {
        const [carConfig, soundConfig] = await Promise.all([
            ConfigService.loadConfig(
                "/config/car-config.json",
                DEFAULT_CAR_CONFIG
            ),
            ConfigService.loadConfig(
                "/config/car-sound-config.json",
                DEFAULT_SOUND_CONFIG
            ),
        ]);

        return { carConfig, soundConfig };
    } catch (error) {
        console.warn(
            "Failed to load car configurations, using defaults. Error:",
            error
        );
        return {
            carConfig: { ...DEFAULT_CAR_CONFIG },
            soundConfig: { ...DEFAULT_SOUND_CONFIG },
        };
    }
}
