import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { JoystickState } from "../type/joystick-state";
import type { SteeringControl } from "../type/steering-control";
import type { AccelerationControl } from "../type/acceleration-control";

export interface VirtualJoystickConfig {
    position?: { x: number; y: number };
    relativePosition?: { x: number; y: number };
    axisMode?: JoystickAxisMode;
    identifier?: string;
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
    private accelerationControl: AccelerationControl | null;
    private showJoystick: boolean;
    private readonly config: VirtualJoystickConfig;
    private axisMode: JoystickAxisMode;
    private readonly identifier: string;
    private centerX: number;
    private centerY: number;
    private isInitialized: boolean;
    private readonly touchStartHandler: (event: TouchEvent) => void;
    private readonly touchMoveHandler: (event: TouchEvent) => void;
    private readonly touchEndHandler: (event: TouchEvent) => void;

    name: string;
    displayName: string;

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
        this.accelerationControl = null;
        this.showJoystick = true;
        this.config = config;
        this.axisMode = config.axisMode || JoystickAxisMode.Both;
        this.identifier = config.identifier || "default";
        this.centerX = 0;
        this.centerY = 0;
        this.isInitialized = false;

        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchMoveHandler = this.handleTouchMove.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);

        this.name = `Virtual-Joystick-${this.identifier}`;
        this.displayName = `Virtual Joystick ${this.identifier}`;
    }

    setAxisMode(mode: JoystickAxisMode): void {
        this.axisMode = mode;
        this.resetJoystick();
    }

    setSteeringControl(control: SteeringControl): void {
        this.steeringControl = control;
    }

    setAccelerationControl(control: AccelerationControl): void {
        this.accelerationControl = control;
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
            this.touchStartHandler,
            passiveOptions
        );
        this.canvas.addEventListener(
            "touchmove",
            this.touchMoveHandler,
            passiveOptions
        );
        this.canvas.addEventListener(
            "touchend",
            this.touchEndHandler,
            passiveOptions
        );
        this.canvas.addEventListener(
            "touchcancel",
            this.touchEndHandler,
            passiveOptions
        );
    }

    private removeEventListeners(): void {
        this.canvas.removeEventListener("touchstart", this.touchStartHandler);
        this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
        this.canvas.removeEventListener("touchend", this.touchEndHandler);
        this.canvas.removeEventListener("touchcancel", this.touchEndHandler);
    }

    private handleTouchStart(event: TouchEvent): void {
        if (!this.showJoystick || this.touchId !== null) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const canvasX = (touch.clientX - rect.left) * scaleX;
            const canvasY = (touch.clientY - rect.top) * scaleY;

            const distanceToCenter = Math.sqrt(
                Math.pow(canvasX - this.centerX, 2) +
                    Math.pow(canvasY - this.centerY, 2)
            );

            if (distanceToCenter <= this.baseRadius * 2) {
                this.touchId = touch.identifier;
                this.state.isActive = true;
                this.updateStickPosition(canvasX, canvasY);
                event.preventDefault();
                break;
            }
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        if (this.touchId === null || !this.showJoystick) return;

        const touch = this.findTouchById(event.touches, this.touchId);
        if (!touch) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const canvasX = (touch.clientX - rect.left) * scaleX;
        const canvasY = (touch.clientY - rect.top) * scaleY;

        this.updateStickPosition(canvasX, canvasY);
        event.preventDefault();
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (this.touchId === null || !this.showJoystick) return;

        const touch = this.findTouchById(event.changedTouches, this.touchId);
        if (touch) {
            this.resetInputState();
        }
    }

    private findTouchById(touchList: TouchList, id: number): Touch | null {
        for (let i = 0; i < touchList.length; i++) {
            if (touchList[i].identifier === id) {
                return touchList[i];
            }
        }
        return null;
    }

    private updateStickPosition(touchX: number, touchY: number): void {
        const deltaX = touchX - this.centerX;
        const deltaY = touchY - this.centerY;

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
        this.state.stickX = this.centerX + Math.cos(angle) * distance;
        this.state.stickY = this.centerY + Math.sin(angle) * distance;

        const normalizedX = distance > 0 ? constrainedDeltaX / distance : 0;
        const normalizedY = distance > 0 ? constrainedDeltaY / distance : 0;
        const magnitude = distance / this.maxStickMovement;

        this.state.direction = {
            x: this.axisMode === JoystickAxisMode.YOnly ? 0 : normalizedX,
            y: this.axisMode === JoystickAxisMode.XOnly ? 0 : normalizedY,
        };
        this.state.magnitude = magnitude > this.deadZone ? magnitude : 0;

        this.dispatchInputEvents();
        this.updateControls();
    }

    private resetInputState(): void {
        this.touchId = null;
        this.state.isActive = false;
        this.state.direction = { x: 0, y: 0 };
        this.state.magnitude = 0;
        this.state.stickX = this.centerX;
        this.state.stickY = this.centerY;
        this.dispatchInputEvents();
        this.updateControls();
    }

    private resetJoystick(): void {
        this.touchId = null;
        this.state.isActive = false;
        this.state.direction = { x: 0, y: 0 };
        this.state.magnitude = 0;
        this.state.stickX = this.centerX;
        this.state.stickY = this.centerY;
        this.dispatchInputEvents();
        this.updateControls();
    }

    private dispatchInputEvents(): void {
        const event = new CustomEvent("virtualJoystickInput", {
            detail: {
                isActive: this.state.isActive,
                direction: { ...this.state.direction },
                magnitude: this.state.magnitude,
                axisMode: this.axisMode,
                identifier: this.identifier,
            },
        });
        window.dispatchEvent(event);
    }

    private updateControls(): void {
        const input = {
            isActive: this.state.isActive,
            direction: { ...this.state.direction },
            magnitude: this.state.magnitude,
            axisMode: this.axisMode,
            identifier: this.identifier,
        };

        if (this.steeringControl && this.identifier.includes("steering")) {
            this.steeringControl.updateSteering(input);
        } else if (
            this.accelerationControl &&
            this.identifier.includes("acceleration")
        ) {
            this.accelerationControl.updateAcceleration(input);
        }
    }

    init(): void {
        if (!this.isInitialized) {
            this.calculatePosition();
            this.resetInputState();
            this.setupEventListeners();
            this.enable();
            this.isInitialized = true;
        }
    }

    update(_context: FrameContext): void {}

    render(context: FrameContext): void {
        if (!this.showJoystick) return;

        const ctx = context.ctx;
        this.drawBaseCircle(ctx, this.centerX, this.centerY, this.baseRadius);
        this.drawStickCircle(
            ctx,
            this.state.stickX,
            this.state.stickY,
            this.stickRadius
        );
    }

    private drawBaseCircle(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number
    ): void {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = this.identifier.includes("acceleration")
            ? "#3498db"
            : "#2c3e50";
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
        ctx.fillStyle = this.identifier.includes("acceleration")
            ? "#2980b9"
            : "#e74c3c";
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
            this.centerX = this.config.position.x;
            this.centerY = this.config.position.y;
        } else if (this.config.relativePosition) {
            this.centerX = this.canvas.width * this.config.relativePosition.x;
            this.centerY = this.canvas.height * this.config.relativePosition.y;
        } else {
            if (this.identifier.includes("acceleration")) {
                this.centerX = this.canvas.width * 0.2;
                this.centerY = this.canvas.height * 0.8;
            } else {
                this.centerX = this.canvas.width * 0.8;
                this.centerY = this.canvas.height * 0.8;
            }
        }

        this.state.centerX = this.centerX;
        this.state.centerY = this.centerY;
        this.state.stickX = this.centerX;
        this.state.stickY = this.centerY;
    }

    onEnter(): void {
        if (!this.isInitialized) {
            this.setupEventListeners();
            this.calculatePosition();
            this.isInitialized = true;
        }
    }

    onExit(): void {
        this.removeEventListeners();
        this.resetJoystick();
    }

    resize(): void {
        this.calculatePosition();
        this.resetInputState();
    }

    getPosition(): { x: number; y: number } {
        return { x: this.centerX, y: this.centerY };
    }

    getIdentifier(): string {
        return this.identifier;
    }
}
