import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { LapTracker } from "./lap-tracker";

interface GameScoreConfig {
    maxRecords?: number;
    positionX?: number;
    positionY?: number;
    textColor?: string;
    bestTimeColor?: string;
    fontSize?: number;
    fontFamily?: string;
    title?: string;
}

interface GameScoreState {
    bestRaceTimes: number[];
}

export class GameScore implements Scene {
    name: string = "Game-Score";
    displayName?: string = "Game Score";

    private lapTracker: LapTracker;
    private config: Required<GameScoreConfig>;
    private state: GameScoreState;

    constructor(lapTracker: LapTracker, config: GameScoreConfig = {}) {
        this.lapTracker = lapTracker;
        this.config = {
            maxRecords: 5,
            positionX: 20,
            positionY: 100,
            textColor: "white",
            bestTimeColor: "gold",
            fontSize: 16,
            fontFamily: "Arial",
            title: "Best Race Times (5 laps):",
            ...config,
        };

        this.state = {
            bestRaceTimes: [],
        };

        // Set up race complete callback
        this.lapTracker.setRaceCompleteCallback(() => this.onRaceComplete());
    }

    init(): void {
        // Initialization logic if needed
    }

    onEnter(): void {
        // Entry logic if needed
    }

    onExit(): void {
        // Exit logic if needed
    }

    update(_context: FrameContext): void {
        // Update logic if needed
    }

    resize(): void {
        // Resize logic if needed
    }

    private onRaceComplete(): void {
        const lapTimes = this.lapTracker.getLapTimes();
        if (lapTimes.length === 5) {
            const totalTime = lapTimes.reduce((sum, time) => sum + time, 0);
            this.addRaceTime(totalTime);
        }
    }

    private addRaceTime(time: number): void {
        this.state.bestRaceTimes = [...this.state.bestRaceTimes, time]
            .sort((a, b) => a - b)
            .slice(0, this.config.maxRecords);
    }

    render(context: FrameContext): void {
        if (this.state.bestRaceTimes.length === 0) return;

        const ctx = context.ctx;
        ctx.save();
        ctx.fillStyle = this.config.textColor;
        ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        ctx.textAlign = "left";

        // Draw title
        ctx.fillText(
            this.config.title,
            this.config.positionX,
            this.config.positionY
        );

        // Draw each time record
        for (let i = 0; i < this.state.bestRaceTimes.length; i++) {
            const time = this.state.bestRaceTimes[i];
            const yPos =
                this.config.positionY + (i + 1) * (this.config.fontSize + 5);

            // Highlight the best time
            ctx.fillStyle =
                i === 0 ? this.config.bestTimeColor : this.config.textColor;

            ctx.fillText(
                `${i + 1}. ${(time / 1000).toFixed(2)}s`,
                this.config.positionX,
                yPos
            );
        }

        ctx.restore();
    }

    reset(): void {
        this.state.bestRaceTimes = [];
    }

    getBestTimes(): number[] {
        return [...this.state.bestRaceTimes];
    }
}