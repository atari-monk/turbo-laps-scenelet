import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";
import type { RectangleTrack } from "./rectangle-track";
import type { ArrowPlayer } from "./arrow-player";
import type { StartingGrid } from "./starting-grid";

export class LapTracker implements Scene {
    name: string = "Lap Tracker";
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
    private onRaceComplete: () => void;
    private isRunning: boolean;

    constructor(
        private readonly track: RectangleTrack,
        private readonly player: ArrowPlayer,
        private readonly startingGrid: StartingGrid,
        onRaceComplete: () => void = () => {},
        sectors: number = 4
    ) {
        this.sectors = sectors;
        this.currentSector = 0;
        this.lapCount = 0;
        this.sectorTimes = new Array(sectors).fill(0);
        this.lastSectorTime = 0;
        this.startTime = 0;
        this.lastLapStart = 0;
        this.lapTimes = [];
        this.maxLaps = 1;
        this.onRaceComplete = onRaceComplete;
        this.isRunning = false;
    }

    init(): void {}

    onEnter(): void {
        // Don't automatically start tracking
        this.reset();
    }

    onExit(): void {}

    update(_context: FrameContext): void {
        if (!this.isRunning) return;

        const relX = this.player.position.x - this.track.state.centerX;
        const relY = this.player.position.y - this.track.state.centerY;
        const angle = Math.atan2(relY, relX) + Math.PI / 2; // Remove + Math.PI to get proper quadrant alignment
        const sectorSize = (2 * Math.PI) / this.sectors;

        // Normalize angle to 0-2π range and calculate sector
        let normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
        const newSector = Math.floor(normalizedAngle / sectorSize);

        if (newSector !== this.currentSector) {
            const now = performance.now();

            // Check for valid sector progression (forward movement)
            const expectedNextSector = (this.currentSector + 1) % this.sectors;
            const isMovingForward = newSector === expectedNextSector;

            // Allow wrapping from last sector to first (completing lap)
            const isCompletingLap =
                this.currentSector === this.sectors - 1 && newSector === 0;

            if (isMovingForward || isCompletingLap) {
                this.sectorTimes[this.currentSector] =
                    now - this.lastSectorTime;
                this.lastSectorTime = now;

                if (newSector === 0) {
                    // Record lap time when crossing start/finish line
                    const lapTime = now - this.lastLapStart;
                    this.lapTimes.push(lapTime);
                    this.lastLapStart = now;
                    this.lapCount++;
                    this.sectorTimes.fill(0); // Reset sector times for new lap

                    // Check if race is complete
                    if (this.lapCount >= this.maxLaps && this.onRaceComplete) {
                        this.stop();
                        this.onRaceComplete();
                        this.player.setInputEnabled(false);
                        this.player.setStartingPosition(
                            this.startingGrid.getStartingPosition()
                        );
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
        ctx.fillText(
            `Status: ${this.isRunning ? "Running" : "Stopped"}`,
            20,
            30
        );

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
        // if (this.lapCount >= this.maxLaps) {
        //     ctx.fillStyle = "gold";
        //     ctx.font = "24px Arial";
        //     ctx.textAlign = "center";
        //     ctx.fillText(
        //         "RACE COMPLETE!",
        //         ctx.canvas.width / 2,
        //         ctx.canvas.height / 2
        //     );
        // }

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
