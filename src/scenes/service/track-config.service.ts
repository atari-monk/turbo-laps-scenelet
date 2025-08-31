import type { TrackState } from "../types/track-state";
import type { TrackConfig } from "../types/track-config";

export class TrackConfigService {
    private static instance: TrackConfigService;
    private config: TrackConfig = {
        trackWidth: 1500,
        trackHeight: 700,
        roadWidth: 160,
        roadColor: "#555",
        backgroundColor: "#2a2a2a",
    };
    private state: TrackState = {
        centerX: 0,
        centerY: 0,
        radiusX: 0,
        radiusY: 0,
    };

    private constructor() {}

    static getInstance(): TrackConfigService {
        if (!TrackConfigService.instance) {
            TrackConfigService.instance = new TrackConfigService();
        }
        return TrackConfigService.instance;
    }

    getConfig(): TrackConfig {
        return this.config;
    }

    getState(): TrackState {
        return this.state;
    }

    updateConfig(updates: Partial<TrackConfig>): void {
        this.config = { ...this.config, ...updates };
    }

    calculateTrackState(canvas: HTMLCanvasElement): void {
        this.state = {
            centerX: canvas.width / 2,
            centerY: canvas.height / 2,
            radiusX: this.config.trackWidth / 2,
            radiusY: this.config.trackHeight / 2,
        };
    }
}
