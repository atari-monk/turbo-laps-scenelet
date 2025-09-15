import type { InputSystem, Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import { TrackConfigService } from "../service/track-config.service";
import { DefaultTouchEventSystem } from "../virtual-joystick/DefaultTouchEventSystem";

interface MenuButton {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    isHovered: boolean;
    wasPressed: boolean;
    action?: () => void;
}

export class Menu implements Scene {
    name = "Menu";
    displayName = "Menu";

    private buttons: MenuButton[] = [];
    private lapButtons: MenuButton[] = [];
    private isActive = true;
    private readonly configService = TrackConfigService.getInstance();
    private wasMousePressed: boolean = false;
    private wasTouchPressed: boolean = false;
    private isTouchDevice: boolean = false;
    private touchEventSystem: DefaultTouchEventSystem;
    private touchPosition = { x: 0, y: 0 };

    constructor(private inputSystem: InputSystem) {
        this.touchEventSystem = new DefaultTouchEventSystem();
        this.initializeButtons();
        this.detectTouchDevice();
        this.setupTouchEvents();
    }

    private detectTouchDevice() {
        this.isTouchDevice =
            "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    private setupTouchEvents() {
        if (!this.isTouchDevice) return;

        this.touchEventSystem.onTouchStart((event) => {
            event.preventDefault();
            const canvas = event.target as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();

            this.touchPosition.x =
                (event.touches[0].clientX - rect.left) *
                (canvas.width / rect.width);
            this.touchPosition.y =
                (event.touches[0].clientY - rect.top) *
                (canvas.height / rect.height);
            this.wasTouchPressed = true;
        });

        this.touchEventSystem.onTouchMove((event) => {
            event.preventDefault();
            const canvas = event.target as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();

            this.touchPosition.x =
                (event.touches[0].clientX - rect.left) *
                (canvas.width / rect.width);
            this.touchPosition.y =
                (event.touches[0].clientY - rect.top) *
                (canvas.height / rect.height);
        });

        this.touchEventSystem.onTouchEnd(() => {
            this.wasTouchPressed = false;
        });
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
                wasPressed: false,
            },
        ];

        this.lapButtons = [
            {
                x: 0,
                y: 0,
                width: 40,
                height: 40,
                text: "-",
                isHovered: false,
                wasPressed: false,
                action: () => this.adjustLapCount(-1),
            },
            {
                x: 0,
                y: 0,
                width: 40,
                height: 40,
                text: "+",
                isHovered: false,
                wasPressed: false,
                action: () => this.adjustLapCount(1),
            },
        ];
    }

    private adjustLapCount(delta: number) {
        const currentLaps = this.configService.getLapConfig().maxLaps;
        const newLaps = Math.max(1, currentLaps + delta);
        this.configService.updateLapConfig({ maxLaps: newLaps });
    }

    getLapConfig() {
        return this.configService.getLapConfig();
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

    init() {
        if (this.isTouchDevice) {
            const canvas = document.querySelector("canvas");
            if (canvas) {
                this.touchEventSystem.registerElement(canvas);
            }
        }
    }

    update(context: FrameContext) {
        if (!this.isActive) return;

        const canvas = context.ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        this.buttons[0].x = centerX - this.buttons[0].width / 2;
        this.buttons[0].y = centerY + 80;

        const lapControlsWidth = 95;
        const lapControlsStartX = centerX - lapControlsWidth / 2;

        this.lapButtons[0].x = lapControlsStartX;
        this.lapButtons[0].y = centerY + 170;
        this.lapButtons[1].x = lapControlsStartX + 60;
        this.lapButtons[1].y = centerY + 170;

        let inputX = 0;
        let inputY = 0;
        let isPressed = false;
        let wasPressedThisFrame = false;

        if (this.isTouchDevice) {
            inputX = this.touchPosition.x;
            inputY = this.touchPosition.y;
            isPressed = this.wasTouchPressed;
            wasPressedThisFrame = this.wasTouchPressed;
        } else {
            const mousePos = this.inputSystem.mouse.getPosition();
            const displayWidth = canvas.clientWidth || canvas.width;
            const displayHeight = canvas.clientHeight || canvas.height;
            const scaleX = canvas.width / displayWidth;
            const scaleY = canvas.height / displayHeight;

            inputX = mousePos.x * scaleX;
            inputY = mousePos.y * scaleY;
            isPressed = this.inputSystem.mouse.isButtonDown(0);
            wasPressedThisFrame = isPressed && !this.wasMousePressed;
        }

        const allButtons = [...this.buttons, ...this.lapButtons];

        allButtons.forEach((button) => {
            button.isHovered =
                inputX >= button.x &&
                inputX <= button.x + button.width &&
                inputY >= button.y &&
                inputY <= button.y + button.height;

            if (button.isHovered && wasPressedThisFrame) {
                button.wasPressed = true;
            }

            if (button.isHovered && !isPressed && button.wasPressed) {
                if (button.action) {
                    button.action();
                }
                button.wasPressed = false;
            }

            if (!isPressed) {
                button.wasPressed = false;
            }
        });

        this.wasMousePressed = isPressed;
    }

    render(context: FrameContext) {
        if (!this.isActive) return;

        const { ctx } = context;
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const lapConfig = this.configService.getLapConfig();

        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ecf0f1";
        ctx.font = "bold 48px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("TURBO LAPS", centerX, centerY - 60);

        ctx.fillStyle = "#bdc3c7";
        ctx.font = "24px 'Arial'";
        ctx.fillText(
            `${lapConfig.maxLaps}-Lap Time Trial`,
            centerX,
            centerY - 20
        );

        ctx.fillStyle = "#95a5a6";
        ctx.font = "18px 'Arial'";
        ctx.fillText(
            `Complete ${lapConfig.maxLaps} laps around the track as fast as possible!`,
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

        this.lapButtons.forEach((button) => {
            ctx.fillStyle = button.isHovered ? "#3498db" : "#2980b9";
            ctx.fillRect(button.x, button.y, button.width, button.height);

            ctx.strokeStyle = "#ecf0f1";
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px 'Arial'";
            ctx.fillText(
                button.text,
                button.x + button.width / 2,
                button.y + button.height / 2 + 6
            );
        });
    }

    onEnter() {}

    onExit() {
        if (this.isTouchDevice) {
            const canvas = document.querySelector("canvas");
            if (canvas) {
                this.touchEventSystem.unregisterElement(canvas);
            }
        }
    }

    resize() {}
}
