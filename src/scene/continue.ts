import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";

export interface IContinue extends Scene {
    show(): void;
    hide(): void;
    setOnRestartRace(callback: () => void): void;
}

export class Continue implements IContinue {
    name = "Continue";
    displayName = "Continue";

    private restartButton = {
        x: 0,
        y: 0,
        width: 250,
        height: 70,
        text: "RESTART RACE",
        isHovered: false,
        isVisible: false,
    };

    private onRestartRace?: () => void;

    constructor(private inputSystem: InputSystem) {
        // InputSystem is injected via constructor
    }

    setOnRestartRace(callback: () => void) {
        this.onRestartRace = callback;
    }

    show() {
        this.restartButton.isVisible = true;
    }

    hide() {
        this.restartButton.isVisible = false;
    }

    toggleButton() {
        this.restartButton.isVisible = !this.restartButton.isVisible;
    }

    init() {
        // Initialization logic
    }

    update(context: FrameContext) {
        if (!this.restartButton.isVisible) return;

        const canvas = context.ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Update button position
        this.restartButton.x = centerX - this.restartButton.width / 2;
        this.restartButton.y = centerY - this.restartButton.height / 2;

        // Get mouse position from the injected input system
        const mousePos = this.inputSystem.mouse.getPosition();

        // Scale mouse coordinates to match canvas resolution
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;
        const scaleX = canvas.width / displayWidth;
        const scaleY = canvas.height / displayHeight;

        const mouseX = mousePos.x * scaleX;
        const mouseY = mousePos.y * scaleY;

        // Get mouse button state (left button = 0)
        const isMousePressed = this.inputSystem.mouse.isButtonDown(0);

        // Update button hover state
        this.restartButton.isHovered =
            mouseX >= this.restartButton.x &&
            mouseX <= this.restartButton.x + this.restartButton.width &&
            mouseY >= this.restartButton.y &&
            mouseY <= this.restartButton.y + this.restartButton.height;

        if (
            this.restartButton.isHovered &&
            isMousePressed &&
            this.onRestartRace
        ) {
            this.onRestartRace();
        }
    }

    render(context: FrameContext) {
        if (!this.restartButton.isVisible) return;

        const { ctx } = context;
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw completion message
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 36px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("RACE COMPLETED!", centerX, centerY - 100);

        // Draw restart button with fancy styling
        const button = this.restartButton;

        // Button background with gradient
        const gradient = ctx.createLinearGradient(
            button.x,
            button.y,
            button.x,
            button.y + button.height
        );

        if (button.isHovered) {
            gradient.addColorStop(0, "#27ae60");
            gradient.addColorStop(1, "#219a52");
        } else {
            gradient.addColorStop(0, "#2ecc71");
            gradient.addColorStop(1, "#27ae60");
        }

        ctx.fillStyle = gradient;

        // Rounded rectangle for button
        const borderRadius = 12;
        ctx.beginPath();
        ctx.moveTo(button.x + borderRadius, button.y);
        ctx.lineTo(button.x + button.width - borderRadius, button.y);
        ctx.quadraticCurveTo(
            button.x + button.width,
            button.y,
            button.x + button.width,
            button.y + borderRadius
        );
        ctx.lineTo(
            button.x + button.width,
            button.y + button.height - borderRadius
        );
        ctx.quadraticCurveTo(
            button.x + button.width,
            button.y + button.height,
            button.x + button.width - borderRadius,
            button.y + button.height
        );
        ctx.lineTo(button.x + borderRadius, button.y + button.height);
        ctx.quadraticCurveTo(
            button.x,
            button.y + button.height,
            button.x,
            button.y + button.height - borderRadius
        );
        ctx.lineTo(button.x, button.y + borderRadius);
        ctx.quadraticCurveTo(
            button.x,
            button.y,
            button.x + borderRadius,
            button.y
        );
        ctx.closePath();
        ctx.fill();

        // Button border
        ctx.strokeStyle = button.isHovered ? "#1e8449" : "#27ae60";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Button shadow effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Draw button text with shadow
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px 'Arial'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Text shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillText(
            button.text,
            button.x + button.width / 2,
            button.y + button.height / 2
        );

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw instruction text
        ctx.fillStyle = "#bdc3c7";
        ctx.font = "18px 'Arial'";
        ctx.fillText(
            "Click to race again",
            centerX,
            button.y + button.height + 40
        );
    }

    onEnter() {
        console.log("Entering continue scene");
    }

    onExit() {
        console.log("Exiting continue scene");
        this.hide();
    }

    resize() {
        // Handle resize if needed
    }
}
