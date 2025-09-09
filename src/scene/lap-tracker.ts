import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { PositionProvider } from "../type/position-provider";
import { TrackConfigService } from "../service/track-config.service";

export interface ILapTracker extends Scene {
    setRaceCompleteCallback(callback: () => void): void;
    getLapTimes(): number[];
    getCurrentLap(): number;
    getCurrentSector(): number;
    getSectorTimes(): number[];
    getTotalTime(): number;
    isTracking(): boolean;
    start(): void;
    stop(): void;
    reset(): void;
}

interface LapTrackerConfig {
    sectors?: number;
    turnOn?: boolean;
}

export class LapTracker implements ILapTracker {
    name = "Lap-Tracker";
    displayName = "Lap Tracker";

    private sectors: number;
    private currentSector: number;
    private lapCount: number;
    private sectorTimes: number[];
    private completedSectorTimes: number[][];
    private lastSectorTime: number;
    private startTime: number;
    private lastLapStart: number;
    private lapTimes: number[];
    private onRaceComplete?: () => void;
    private isRunning: boolean;
    private readonly configService = TrackConfigService.getInstance();
    private completedSectors: boolean[];

    constructor(
        private readonly positionProvider: PositionProvider,
        private readonly turnOn = false,
        config: LapTrackerConfig = {}
    ) {
        this.sectors = config.sectors || 4;
        this.currentSector = 0;
        this.lapCount = 0;
        this.sectorTimes = new Array(this.sectors).fill(0);
        this.completedSectorTimes = [];
        this.lastSectorTime = 0;
        this.startTime = 0;
        this.lastLapStart = 0;
        this.lapTimes = [];
        this.isRunning = false;
        this.completedSectors = new Array(this.sectors).fill(false);
    }

    init(): void {}

    onEnter(): void {
        this.reset();
        if (this.turnOn) this.start();
    }

    onExit(): void {}

    update(_context: FrameContext): void {
        if (!this.isRunning) return;

        const trackState = this.configService.getState();
        const relX = this.positionProvider.position.x - trackState.centerX;
        const relY = this.positionProvider.position.y - trackState.centerY;
        const angle = Math.atan2(relY, relX) + Math.PI / 2;
        const sectorSize = (2 * Math.PI) / this.sectors;

        const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
        const newSector = Math.floor(normalizedAngle / sectorSize);

        if (newSector !== this.currentSector) {
            const now = performance.now();
            const sectorDifference =
                (newSector - this.currentSector + this.sectors) % this.sectors;
            const isMovingForward =
                sectorDifference === 1 ||
                (this.currentSector === this.sectors - 1 && newSector === 0);
            const isMovingBackward =
                sectorDifference === this.sectors - 1 ||
                (this.currentSector === 0 && newSector === this.sectors - 1);

            if (isMovingForward) {
                this.handleForwardMovement(newSector, now);
            } else if (isMovingBackward) {
                this.handleBackwardMovement(newSector);
            }

            this.currentSector = newSector;
        }
    }

    private handleForwardMovement(newSector: number, timestamp: number): void {
        this.sectorTimes[this.currentSector] = timestamp - this.lastSectorTime;
        this.lastSectorTime = timestamp;
        this.completedSectors[this.currentSector] = true;

        if (newSector === 0 && this.isLapComplete()) {
            const lapTime = timestamp - this.lastLapStart;
            this.lapTimes.push(lapTime);
            this.completedSectorTimes.push([...this.sectorTimes]);
            this.lastLapStart = timestamp;
            this.lapCount++;
            this.sectorTimes.fill(0);
            this.completedSectors.fill(false);

            const maxLaps = this.configService.getLapConfig().maxLaps;
            if (this.lapCount >= maxLaps && this.onRaceComplete) {
                this.stop();
                this.onRaceComplete();
            }
        }
    }

    private handleBackwardMovement(newSector: number): void {
        this.completedSectors[this.currentSector] = false;

        if (newSector === 0) {
            this.completedSectors.fill(false);
        }
    }

    private isLapComplete(): boolean {
        return this.completedSectors.every((completed) => completed);
    }

    render(context: FrameContext): void {
        const ctx = context.ctx;
        const maxLaps = this.configService.getLapConfig().maxLaps;

        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            `Status: ${this.isRunning ? "Running" : "Stopped"}`,
            20,
            30
        );
        ctx.fillText(`Lap: ${this.lapCount}/${maxLaps}`, 20, 50);
        ctx.fillText(`Sector: ${this.currentSector + 1}`, 20, 70);

        let yOffset = 90;

        if (this.completedSectorTimes.length > 0) {
            const lastLapSectors =
                this.completedSectorTimes[this.completedSectorTimes.length - 1];
            for (let i = 0; i < lastLapSectors.length; i++) {
                ctx.fillText(
                    `Sector ${i + 1}: ${(lastLapSectors[i] / 1000).toFixed(
                        2
                    )}s`,
                    20,
                    yOffset + i * 20
                );
            }
            yOffset += lastLapSectors.length * 20 + 20;
        }

        for (let i = 0; i < this.sectorTimes.length; i++) {
            if (this.sectorTimes[i] > 0) {
                ctx.fillText(
                    `Current S${i + 1}: ${(this.sectorTimes[i] / 1000).toFixed(
                        2
                    )}s`,
                    20,
                    yOffset + i * 20
                );
            }
        }
        yOffset += this.sectorTimes.length * 20;

        if (this.isRunning) {
            ctx.fillText(
                `Current Lap: ${(
                    (performance.now() - this.lastLapStart) /
                    1000
                ).toFixed(2)}s`,
                20,
                yOffset
            );
            ctx.fillText(
                `Total: ${((performance.now() - this.startTime) / 1000).toFixed(
                    2
                )}s`,
                20,
                yOffset + 20
            );
        }

        ctx.restore();
    }

    resize(): void {}

    start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        const now = performance.now();

        if (this.lapCount === 0 && this.lapTimes.length === 0) {
            this.startTime = now;
            this.lastLapStart = now;
            this.lastSectorTime = now;
            this.completedSectors.fill(false);
        }
    }

    stop(): void {
        this.isRunning = false;
    }

    reset(): void {
        this.isRunning = false;
        this.lapCount = 0;
        this.currentSector = 0;
        this.sectorTimes.fill(0);
        this.completedSectorTimes = [];
        this.lapTimes = [];
        this.lastSectorTime = 0;
        this.startTime = 0;
        this.lastLapStart = 0;
        this.completedSectors.fill(false);
    }

    getLapTimes(): number[] {
        return [...this.lapTimes];
    }

    setRaceCompleteCallback(callback: () => void): void {
        this.onRaceComplete = callback;
    }

    getCurrentLap(): number {
        return this.lapCount;
    }

    getCurrentSector(): number {
        return this.currentSector;
    }

    getSectorTimes(): number[] {
        return [...this.sectorTimes];
    }

    getTotalTime(): number {
        return this.isRunning ? (performance.now() - this.startTime) / 1000 : 0;
    }

    isTracking(): boolean {
        return this.isRunning;
    }
}
