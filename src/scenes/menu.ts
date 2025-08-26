import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";

export class MenuScene implements Scene {
    name = "menu";
    displayName = "Turbo Laps";

    private startButton = {
        x: 0,
        y: 0,
        width: 200,
        height: 60,
        text: "START",
        isHovered: false,
    };

    constructor(private inputSystem: InputSystem) {
        // InputSystem is now injected via constructor
    }

    init() {
        // Initialization logic can go here
    }

    update(_context: FrameContext) {
        // Get mouse position from the injected input system
        const mousePos = this.inputSystem.mouse.getPosition();
        const mouseX = mousePos.x;
        const mouseY = mousePos.y;

        // Get mouse button state (left button = 0)
        const isMousePressed = this.inputSystem.mouse.isButtonDown(0);

        // Update button hover state
        this.startButton.isHovered =
            mouseX >= this.startButton.x &&
            mouseX <= this.startButton.x + this.startButton.width &&
            mouseY >= this.startButton.y &&
            mouseY <= this.startButton.y + this.startButton.height;

        // Handle button click
        if (this.startButton.isHovered && isMousePressed) {
            // Transition to game scene
            // This would typically be handled by a scene manager
            //console.log("Starting game...");
        }
    }

    render(context: FrameContext) {
        const { ctx } = context;
        const canvas = ctx.canvas;
        // Center the content
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Update button position to be centered
        this.startButton.x = centerX - this.startButton.width / 2;
        this.startButton.y = centerY + 80;

        // Clear canvas
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw title
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 48px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("TURBO LAPS", centerX, centerY - 60);

        // Draw subtitle
        ctx.fillStyle = "#bdc3c7";
        ctx.font = "24px 'Arial'";
        ctx.fillText("5-Lap Time Trial", centerX, centerY - 20);

        // Draw description
        ctx.fillStyle = "#95a5a6";
        ctx.font = "18px 'Arial'";
        ctx.fillText(
            "Complete 5 laps around the track as fast as possible!",
            centerX,
            centerY + 20
        );
        ctx.fillText(
            "Avoid obstacles and beat your best time to win!",
            centerX,
            centerY + 50
        );

        // Draw start button
        ctx.fillStyle = this.startButton.isHovered ? "#27ae60" : "#2ecc71";
        ctx.fillRect(
            this.startButton.x,
            this.startButton.y,
            this.startButton.width,
            this.startButton.height
        );

        // Draw button border
        ctx.strokeStyle = "#ecf0f1";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.startButton.x,
            this.startButton.y,
            this.startButton.width,
            this.startButton.height
        );

        // Draw button text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px 'Arial'";
        ctx.fillText(
            this.startButton.text,
            this.startButton.x + this.startButton.width / 2,
            this.startButton.y + this.startButton.height / 2 + 8
        );
    }

    onEnter() {
        //console.log("Entering menu scene");
    }

    onExit() {
        //console.log("Exiting menu scene");
    }

    resize() {
        // Handle resize if needed
    }
}
