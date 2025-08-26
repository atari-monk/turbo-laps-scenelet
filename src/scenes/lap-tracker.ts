import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { RectangleTrack } from "./rectangle-track";
import type { ArrowPlayer } from "./arrow-player";

export class LapTracker implements Scene {
    name: string = "Lap Tracker";
    displayName?: string = "Lap Tracker";

    private track: RectangleTrack;
    private sectors: number;
    private currentSector: number;
    private lapCount: number;
    private sectorTimes: number[];
    private lastSectorTime: number;
    private startTime: number;
    private lastLapStart: number;
    private lapTimes: number[];
    private maxLaps: number;
    private onRaceComplete: (() => void) | null;
    private isRunning: boolean;

    constructor(
        track: RectangleTrack,
        private readonly player: ArrowPlayer,
        sectors: number = 4
    ) {
        this.track = track;
        this.sectors = sectors;
        this.currentSector = 0;
        this.lapCount = 0;
        this.sectorTimes = new Array(sectors).fill(0);
        this.lastSectorTime = 0;
        this.startTime = 0;
        this.lastLapStart = 0;
        this.lapTimes = [];
        this.maxLaps = 5;
        this.onRaceComplete = null;
        this.isRunning = false; // Not running by default
    }

    init(): void {}

    onEnter(): void {
        // Don't automatically start tracking
        this.reset();
    }

    onExit(): void {}

    update(_context: FrameContext): void {
        // Only update if the tracker is running
        if (!this.isRunning) return;

        const relX = this.player.position.x - this.track.state.centerX;
        const relY = this.player.position.y - this.track.state.centerY;
        const angle = Math.atan2(relY, relX) + Math.PI;
        const sectorSize = (2 * Math.PI) / this.sectors;
        const newSector = Math.floor(angle / sectorSize);

        if (newSector !== this.currentSector) {
            if (newSector === (this.currentSector + 1) % this.sectors) {
                const now = performance.now();
                this.sectorTimes[this.currentSector] =
                    now - this.lastSectorTime;
                this.lastSectorTime = now;

                if (newSector === 0) {
                    // Record lap time when crossing start/finish line
                    const lapTime = now - this.lastLapStart;
                    this.lapTimes.push(lapTime);
                    this.lastLapStart = now;
                    this.lapCount++;
                    this.sectorTimes.fill(0);

                    // Check if race is complete
                    if (this.lapCount >= this.maxLaps && this.onRaceComplete) {
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

        // Show status
        ctx.fillText(`Status: ${this.isRunning ? "Running" : "Stopped"}`, 20, 30);
        
        // Current lap info
        ctx.fillText(`Lap: ${this.lapCount}/${this.maxLaps}`, 20, 50);
        ctx.fillText(`Sector: ${this.currentSector + 1}`, 20, 70);

        // Sector times
        for (let i = 0; i < this.sectorTimes.length; i++) {
            ctx.fillText(
                `Sector ${i + 1}: ${(this.sectorTimes[i] / 1000).toFixed(2)}s`,
                20,
                90 + i * 20
            );
        }

        // Current lap time (only show if running)
        if (this.isRunning) {
            ctx.fillText(
                `Current Lap: ${(
                    (performance.now() - this.lastLapStart) /
                    1000
                ).toFixed(2)}s`,
                20,
                90 + this.sectorTimes.length * 20
            );

            // Total time
            ctx.fillText(
                `Total: ${((performance.now() - this.startTime) / 1000).toFixed(
                    2
                )}s`,
                20,
                110 + this.sectorTimes.length * 20
            );
        }

        // Show race complete message if applicable
        if (this.lapCount >= this.maxLaps) {
            ctx.fillStyle = "gold";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                "RACE COMPLETE!",
                ctx.canvas.width / 2,
                ctx.canvas.height / 2
            );
        }

        ctx.restore();
    }

    resize(): void {
        // No specific resize logic needed for lap tracker
    }

    // Start the lap tracking
    start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const now = performance.now();
        
        // Initialize timing if this is the first start
        if (this.lapCount === 0 && this.lapTimes.length === 0) {
            this.startTime = now;
            this.lastLapStart = now;
            this.lastSectorTime = now;
        }
    }

    // Stop the lap tracking
    stop(): void {
        this.isRunning = false;
    }

    // Reset the tracker completely
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

    // Get all recorded lap times (in milliseconds)
    getLapTimes(): number[] {
        return [...this.lapTimes];
    }

    // Set the race complete callback
    setRaceCompleteCallback(callback: () => void): void {
        this.onRaceComplete = callback;
    }

    // Getter methods
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

    // Check if tracker is running
    isTracking(): boolean {
        return this.isRunning;
    }
}