import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";

interface MenuButton {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    isHovered: boolean;
    action?: () => void;
}

export class Menu implements Scene {
    name = "Menu";
    displayName = "Menu";

    private buttons: MenuButton[] = [];
    private isActive = true;

    constructor(private inputSystem: InputSystem) {
        this.initializeButtons();
    }

    private initializeButtons() {
        this.buttons = [
            {
                x: 0,
                y: 0,
                width: 200,
                height: 60,
                text: "START",
                isHovered: false,
            },
        ];
    }

    setOnStartGame(callback: () => void) {
        this.buttons[0].action = callback;
    }

    toggle() {
        this.isActive = !this.isActive;
    }

    show() {
        this.isActive = true;
    }

    hide() {
        this.isActive = false;
    }

    init() {}

    update(context: FrameContext) {
        if (!this.isActive) return;

        const canvas = context.ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        this.buttons[0].x = centerX - this.buttons[0].width / 2;
        this.buttons[0].y = centerY + 80;

        const mousePos = this.inputSystem.mouse.getPosition();
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;
        const scaleX = canvas.width / displayWidth;
        const scaleY = canvas.height / displayHeight;

        const mouseX = mousePos.x * scaleX;
        const mouseY = mousePos.y * scaleY;
        const isMousePressed = this.inputSystem.mouse.isButtonDown(0);

        this.buttons.forEach((button) => {
            button.isHovered =
                mouseX >= button.x &&
                mouseX <= button.x + button.width &&
                mouseY >= button.y &&
                mouseY <= button.y + button.height;

            if (button.isHovered && isMousePressed && button.action) {
                button.action();
            }
        });
    }

    render(context: FrameContext) {
        if (!this.isActive) return;

        const { ctx } = context;
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 48px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("TURBO LAPS", centerX, centerY - 60);

        ctx.fillStyle = "#bdc3c7";
        ctx.font = "24px 'Arial'";
        ctx.fillText("5-Lap Time Trial", centerX, centerY - 20);

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

        this.buttons.forEach((button) => {
            ctx.fillStyle = button.isHovered ? "#27ae60" : "#2ecc71";
            ctx.fillRect(button.x, button.y, button.width, button.height);

            ctx.strokeStyle = "#ecf0f1";
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 24px 'Arial'";
            ctx.fillText(
                button.text,
                button.x + button.width / 2,
                button.y + button.height / 2 + 8
            );
        });
    }

    onEnter() {}

    onExit() {}

    resize() {}
}
