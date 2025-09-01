import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { ArrowPlayer } from "./arrow-player";
import { TrackConfigService } from "./service/track-config.service";

export class LapTracker implements Scene {
    name: string = "Lap-Tracker";
    displayName?: string = "Lap Tracker";

    private sectors: number;
    private currentSector: number;
    private lapCount: number;
    private sectorTimes: number[];
    private lastSectorTime: number;
    private startTime: number;
    private lastLapStart: number;
    private lapTimes: number[];
    private maxLaps: number;
    private onRaceComplete?: () => void;
    private isRunning: boolean;
    private readonly configService = TrackConfigService.getInstance();

    constructor(private readonly player: ArrowPlayer, sectors: number = 4) {
        this.sectors = sectors;
        this.currentSector = 0;
        this.lapCount = 0;
        this.sectorTimes = new Array(sectors).fill(0);
        this.lastSectorTime = 0;
        this.startTime = 0;
        this.lastLapStart = 0;
        this.lapTimes = [];
        this.maxLaps = 1;
        this.isRunning = false;
    }

    init(): void {}

    onEnter(): void {
        this.reset();
    }

    onExit(): void {}

    update(_context: FrameContext): void {
        if (!this.isRunning) return;

        const trackState = this.configService.getState();
        const relX = this.player.position.x - trackState.centerX;
        const relY = this.player.position.y - trackState.centerY;
        const angle = Math.atan2(relY, relX) + Math.PI / 2;
        const sectorSize = (2 * Math.PI) / this.sectors;

        let normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
        const newSector = Math.floor(normalizedAngle / sectorSize);

        if (newSector !== this.currentSector) {
            const now = performance.now();

            const expectedNextSector = (this.currentSector + 1) % this.sectors;
            const isMovingForward = newSector === expectedNextSector;
            const isCompletingLap =
                this.currentSector === this.sectors - 1 && newSector === 0;

            if (isMovingForward || isCompletingLap) {
                this.sectorTimes[this.currentSector] =
                    now - this.lastSectorTime;
                this.lastSectorTime = now;

                if (newSector === 0) {
                    const lapTime = now - this.lastLapStart;
                    this.lapTimes.push(lapTime);
                    this.lastLapStart = now;
                    this.lapCount++;
                    this.sectorTimes.fill(0);

                    if (this.lapCount >= this.maxLaps && this.onRaceComplete) {
                        this.stop();
                        this.onRaceComplete();
                    }
                }
            }
            this.currentSector = newSector;
        }
    }

    render(context: FrameContext): void {
        const ctx = context.ctx;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";

        ctx.fillText(
            `Status: ${this.isRunning ? "Running" : "Stopped"}`,
            20,
            30
        );
        ctx.fillText(`Lap: ${this.lapCount}/${this.maxLaps}`, 20, 50);
        ctx.fillText(`Sector: ${this.currentSector + 1}`, 20, 70);

        for (let i = 0; i < this.sectorTimes.length; i++) {
            ctx.fillText(
                `Sector ${i + 1}: ${(this.sectorTimes[i] / 1000).toFixed(2)}s`,
                20,
                90 + i * 20
            );
        }

        if (this.isRunning) {
            ctx.fillText(
                `Current Lap: ${(
                    (performance.now() - this.lastLapStart) /
                    1000
                ).toFixed(2)}s`,
                20,
                90 + this.sectorTimes.length * 20
            );
            ctx.fillText(
                `Total: ${((performance.now() - this.startTime) / 1000).toFixed(
                    2
                )}s`,
                20,
                110 + this.sectorTimes.length * 20
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
        this.lapTimes = [];
        this.lastSectorTime = 0;
        this.startTime = 0;
        this.lastLapStart = 0;
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
