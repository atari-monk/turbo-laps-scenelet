import type { FrameContext } from "zippy-shared-lib";
import type { Scene } from "zippy-game-engine";

export class Countdown implements Scene {
    name = "Countdown";
    displayName = "Countdown";
    private onInputEnable?: () => void;

    private countdownState: "waiting" | "counting" | "go" | "complete" =
        "waiting";
    private countdownValue = 3;
    private countdownTimer = 0;
    private totalTime = 0;
    private onComplete?: () => void;
    private blockInputCallback?: (block: boolean) => void;

    constructor(
        private readonly onCountdownComplete: () => void,
        private readonly inputBlockCallback?: (block: boolean) => void,
        onInputEnable?: () => void
    ) {
        this.onComplete = this.onCountdownComplete;
        this.blockInputCallback = this.inputBlockCallback;
        this.onInputEnable = onInputEnable;
    }

    init(): void {
        // Block input at the start
        if (this.blockInputCallback) {
            this.blockInputCallback(true);
        }
    }

    onEnter(): void {
        this.reset();
        // Start with a 0.5s delay before countdown begins
        this.countdownState = "waiting";
        this.countdownTimer = 0.5; // 0.5 seconds delay
    }

    onExit(): void {
        // Ensure input is unblocked when exiting
        if (this.blockInputCallback) {
            this.blockInputCallback(false);
        }
    }

    update(context: FrameContext): void {
        this.totalTime += context.deltaTime;

        switch (this.countdownState) {
            case "waiting":
                this.countdownTimer -= context.deltaTime;
                if (this.countdownTimer <= 0) {
                    this.countdownState = "counting";
                    this.countdownValue = 3;
                    this.countdownTimer = 1; // 1 second per count
                }
                break;

            case "counting":
                this.countdownTimer -= context.deltaTime;
                if (this.countdownTimer <= 0) {
                    this.countdownValue--;
                    if (this.countdownValue <= 0) {
                        this.countdownState = "go";
                        this.countdownTimer = 1.5; // Show "GO" for 1.5 seconds
                    } else {
                        this.countdownTimer = 1; // Reset timer for next number
                    }
                }
                break;

            case "go":
                this.countdownTimer -= context.deltaTime;
                if (this.countdownTimer <= 0) {
                    this.countdownState = "complete";
                    // Unblock input when countdown completes
                    if (this.blockInputCallback) {
                        this.blockInputCallback(false);
                    }
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

        // Only draw semi-transparent overlay during waiting and counting states
        if (
            this.countdownState === "waiting" ||
            this.countdownState === "counting"
        ) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Set text properties
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        switch (this.countdownState) {
            case "waiting":
                // Optional: You could show something here during the initial wait
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
        // Draw with a nice, large, attractive font
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 8;

        // Main text with outline
        ctx.font = "bold 200px Arial";
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        // Add a glow effect
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
        // Draw "GO" with an exciting style
        ctx.fillStyle = "#00ff00";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 10;

        // Main text with outline
        ctx.font = "bold 180px Impact";
        ctx.strokeText("GO!", x, y);
        ctx.fillText("GO!", x, y);

        // Add excitement with additional effects
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 25;
        ctx.fillText("GO!", x, y);
        ctx.shadowBlur = 0;

        // Add some smaller excitement text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.fillText("START YOUR ENGINES!", x, y + 120);
    }

    resize(): void {
        // No specific resize logic needed
    }

    private reset(): void {
        this.countdownState = "waiting";
        this.countdownValue = 3;
        this.countdownTimer = 0.5;
        this.totalTime = 0;
        if (this.onInputEnable) {
            this.onInputEnable();
        }
    }

    // Public method to check if countdown is complete
    isComplete(): boolean {
        return this.countdownState === "complete";
    }
}
