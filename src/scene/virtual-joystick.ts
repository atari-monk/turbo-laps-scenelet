import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { JoystickState } from "../type/joystick-state";
import type { SteeringControl } from "../type/steering-control";

export interface VirtualJoystickConfig {
    position?: { x: number; y: number };
    relativePosition?: { x: number; y: number };
    axisMode?: JoystickAxisMode;
}

export enum JoystickAxisMode {
    Both = "both",
    XOnly = "x-only",
    YOnly = "y-only",
}

export class VirtualJoystick implements Scene {
    private readonly state: JoystickState;
    private readonly maxStickMovement: number;
    private readonly deadZone: number;
    private readonly baseRadius: number;
    private readonly stickRadius: number;
    private touchId: number | null;
    private steeringControl: SteeringControl | null;
    private showJoystick: boolean;
    private readonly config: VirtualJoystickConfig;
    private axisMode: JoystickAxisMode;

    name = "Virtual-Joystick";
    displayName = "Virtual Joystick";

    constructor(
        private readonly canvas: HTMLCanvasElement,
        config: VirtualJoystickConfig = {}
    ) {
        this.state = {
            isActive: false,
            direction: { x: 0, y: 0 },
            magnitude: 0,
            centerX: 0,
            centerY: 0,
            stickX: 0,
            stickY: 0,
        };
        this.maxStickMovement = 60;
        this.deadZone = 0.1;
        this.baseRadius = 60;
        this.stickRadius = 30;
        this.touchId = null;
        this.steeringControl = null;
        this.showJoystick = true;
        this.config = config;
        this.axisMode = config.axisMode || JoystickAxisMode.Both;
    }

    setAxisMode(mode: JoystickAxisMode): void {
        this.axisMode = mode;
        this.resetJoystick();
    }

    setSteeringControl(control: SteeringControl): void {
        this.steeringControl = control;
    }

    enable(): void {
        this.showJoystick = true;
    }

    disable(): void {
        this.showJoystick = false;
        this.resetJoystick();
    }

    private setupEventListeners(): void {
        const passiveOptions = { passive: false };
        this.canvas.addEventListener(
            "touchstart",
            this.handleTouchStart,
            passiveOptions
        );
        this.canvas.addEventListener(
            "touchmove",
            this.handleTouchMove,
            passiveOptions
        );
        this.canvas.addEventListener(
            "touchend",
            this.handleTouchEnd,
            passiveOptions
        );
        this.canvas.addEventListener(
            "touchcancel",
            this.handleTouchEnd,
            passiveOptions
        );
    }

    private removeEventListeners(): void {
        this.canvas.removeEventListener("touchstart", this.handleTouchStart);
        this.canvas.removeEventListener("touchmove", this.handleTouchMove);
        this.canvas.removeEventListener("touchend", this.handleTouchEnd);
        this.canvas.removeEventListener("touchcancel", this.handleTouchEnd);
    }

    private handleTouchStart = (event: TouchEvent): void => {
        if (
            event.touches.length === 0 ||
            this.touchId !== null ||
            !this.showJoystick
        )
            return;

        const touch = event.touches[0];
        this.touchId = touch.identifier;

        const rect = this.canvas!.getBoundingClientRect();
        const scaleX = this.canvas!.width / rect.width;
        const scaleY = this.canvas!.height / rect.height;

        const canvasX = (touch.clientX - rect.left) * scaleX;
        const canvasY = (touch.clientY - rect.top) * scaleY;

        const distanceToCenter = Math.sqrt(
            Math.pow(canvasX - this.state.centerX, 2) +
                Math.pow(canvasY - this.state.centerY, 2)
        );

        if (distanceToCenter <= this.baseRadius * 2) {
            this.state.isActive = true;
            this.updateStickPosition(canvasX, canvasY);
            event.preventDefault();
        }
    };

    private handleTouchMove = (event: TouchEvent): void => {
        if (this.touchId === null || !this.canvas || !this.showJoystick) return;

        const touch = this.findTouchById(event.changedTouches, this.touchId);
        if (!touch) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const canvasX = (touch.clientX - rect.left) * scaleX;
        const canvasY = (touch.clientY - rect.top) * scaleY;

        this.updateStickPosition(canvasX, canvasY);
        event.preventDefault();
    };

    private handleTouchEnd = (event: TouchEvent): void => {
        if (this.touchId === null || !this.showJoystick) return;

        const touch = this.findTouchById(event.changedTouches, this.touchId);
        if (touch) {
            this.resetInputState();
        }
    };

    private findTouchById(touchList: TouchList, id: number): Touch | null {
        for (let i = 0; i < touchList.length; i++) {
            if (touchList[i].identifier === id) {
                return touchList[i];
            }
        }
        return null;
    }

    private updateStickPosition(touchX: number, touchY: number): void {
        const deltaX = touchX - this.state.centerX;
        const deltaY = touchY - this.state.centerY;

        let constrainedDeltaX = deltaX;
        let constrainedDeltaY = deltaY;

        if (this.axisMode === JoystickAxisMode.XOnly) {
            constrainedDeltaY = 0;
        } else if (this.axisMode === JoystickAxisMode.YOnly) {
            constrainedDeltaX = 0;
        }

        const distance = Math.min(
            Math.sqrt(
                constrainedDeltaX * constrainedDeltaX +
                    constrainedDeltaY * constrainedDeltaY
            ),
            this.maxStickMovement
        );

        const angle = Math.atan2(constrainedDeltaY, constrainedDeltaX);
        this.state.stickX = this.state.centerX + Math.cos(angle) * distance;
        this.state.stickY = this.state.centerY + Math.sin(angle) * distance;

        const normalizedX = distance > 0 ? constrainedDeltaX / distance : 0;
        const normalizedY = distance > 0 ? constrainedDeltaY / distance : 0;
        const magnitude = distance / this.maxStickMovement;

        this.state.direction = {
            x: this.axisMode === JoystickAxisMode.YOnly ? 0 : normalizedX,
            y: this.axisMode === JoystickAxisMode.XOnly ? 0 : normalizedY,
        };
        this.state.magnitude = magnitude > this.deadZone ? magnitude : 0;

        this.dispatchInputEvents();
        this.updateSteeringControl();
    }

    private resetInputState(): void {
        this.touchId = null;
        this.state.direction = { x: 0, y: 0 };
        this.state.magnitude = 0;
        this.state.stickX = this.state.centerX;
        this.state.stickY = this.state.centerY;
        this.dispatchInputEvents();
        this.updateSteeringControl();
    }

    private resetJoystick(): void {
        this.touchId = null;
        this.state.isActive = false;
        this.state.direction = { x: 0, y: 0 };
        this.state.magnitude = 0;
        this.state.stickX = this.state.centerX;
        this.state.stickY = this.state.centerY;
        this.dispatchInputEvents();
        this.updateSteeringControl();
    }

    private dispatchInputEvents(): void {
        const event = new CustomEvent("virtualJoystickInput", {
            detail: {
                isActive: this.state.isActive,
                direction: { ...this.state.direction },
                magnitude: this.state.magnitude,
                axisMode: this.axisMode,
            },
        });
        window.dispatchEvent(event);
    }

    private updateSteeringControl(): void {
        if (this.steeringControl) {
            this.steeringControl.updateSteering({
                isActive: this.state.isActive,
                direction: { ...this.state.direction },
                magnitude: this.state.magnitude,
                axisMode: this.axisMode,
            });
        }
    }

    init(): void {
        this.calculatePosition();
        this.resetInputState();
        this.setupEventListeners();
        this.enable();
    }

    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        const ctx = context.ctx;

        if (this.showJoystick) {
            this.drawBaseCircle(
                ctx,
                this.state.centerX,
                this.state.centerY,
                this.baseRadius
            );
            this.drawStickCircle(
                ctx,
                this.state.stickX,
                this.state.stickY,
                this.stickRadius
            );
        }
    }

    private drawBaseCircle(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number
    ): void {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#2c3e50";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = "#ecf0f1";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    private drawStickCircle(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number
    ): void {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    private calculatePosition(): void {
        if (this.config.position) {
            this.state.centerX = this.config.position.x;
            this.state.centerY = this.config.position.y;
        } else if (this.config.relativePosition) {
            this.state.centerX =
                this.canvas.width * this.config.relativePosition.x;
            this.state.centerY =
                this.canvas.height * this.config.relativePosition.y;
        } else {
            this.state.centerX = this.canvas.width * 0.2;
            this.state.centerY = this.canvas.height * 0.8;
        }

        this.state.stickX = this.state.centerX;
        this.state.stickY = this.state.centerY;
    }

    onEnter(): void {
        this.setupEventListeners();
        this.calculatePosition();
    }

    onExit(): void {
        this.removeEventListeners();
        this.resetJoystick();
    }

    resize(): void {
        this.calculatePosition();
        this.resetInputState();
    }
}
