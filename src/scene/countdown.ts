import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";

export interface ICountdown extends Scene {
    startAgain(): void;
}

export class Countdown implements ICountdown {
    name = "Countdown";
    displayName = "Countdown";
    showOverlay = false;

    private countdownState: "waiting" | "counting" | "go" | "complete" =
        "waiting";
    private countdownValue = 3;
    private countdownTimer = 0;
    private totalTime = 0;
    private onComplete?: () => void;
    private onGO?: () => void;

    constructor(
        private readonly onCountdownGO: () => void,
        private readonly onCountdownComplete: () => void
    ) {
        this.onGO = this.onCountdownGO;
        this.onComplete = this.onCountdownComplete;
    }

    init(): void {}

    onEnter(): void {
        this.reset();
        this.countdownState = "waiting";
        this.countdownTimer = 0.5;
    }

    onExit(): void {}

    update(context: FrameContext): void {
        this.totalTime += context.deltaTime;

        switch (this.countdownState) {
            case "waiting":
                this.countdownTimer -= context.deltaTime;
                if (this.countdownTimer <= 0) {
                    this.countdownState = "counting";
                    this.countdownValue = 3;
                    this.countdownTimer = 1;
                }
                break;

            case "counting":
                this.countdownTimer -= context.deltaTime;
                if (this.countdownTimer <= 0) {
                    this.countdownValue--;
                    if (this.countdownValue <= 0) {
                        this.countdownState = "go";
                        this.countdownTimer = 1.2;
                        if (this.onGO) {
                            this.onGO();
                        }
                    } else {
                        this.countdownTimer = 1;
                    }
                }
                break;

            case "go":
                this.countdownTimer -= context.deltaTime;
                if (this.countdownTimer <= 0) {
                    this.countdownState = "complete";
                    if (this.onComplete) {
                        this.onComplete();
                    }
                }
                break;
        }
    }

    render(context: FrameContext): void {
        const { ctx } = context;
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();

        if (
            this.showOverlay &&
            (this.countdownState === "waiting" ||
                this.countdownState === "counting")
        ) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        switch (this.countdownState) {
            case "waiting":
                break;

            case "counting":
                this.drawCountdownText(
                    ctx,
                    centerX,
                    centerY,
                    this.countdownValue.toString()
                );
                break;

            case "go":
                this.drawGoText(ctx, centerX, centerY);
                break;
        }

        ctx.restore();
    }

    private drawCountdownText(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        text: string
    ): void {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 8;

        ctx.font = "bold 200px Arial";
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 20;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;
    }

    private drawGoText(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number
    ): void {
        ctx.fillStyle = "#00ff00";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 10;

        ctx.font = "bold 180px Impact";
        ctx.strokeText("GO!", x, y);
        ctx.fillText("GO!", x, y);

        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 25;
        ctx.fillText("GO!", x, y);
        ctx.shadowBlur = 0;
    }

    resize(): void {}

    private reset(): void {
        this.countdownState = "waiting";
        this.countdownValue = 3;
        this.countdownTimer = 0.5;
        this.totalTime = 0;
    }

    isComplete(): boolean {
        return this.countdownState === "complete";
    }

    startAgain(): void {
        this.reset();
        this.countdownState = "waiting";
        this.countdownTimer = 0.5;
    }
}
