import type { Scene } from "zippy-game-engine";
import type { FrameContext } from "zippy-shared-lib";
import type { JoystickState } from "../type/joystick-state";
import type { SteeringControl } from "../type/steering-control";
import type { AccelerationControl } from "../type/acceleration-control";
import type { TouchEventSystem } from "./TouchEventSystem";
import type { JoystickInput } from "./JoystickInput";
import type { JoystickRenderer } from "./JoystickRenderer";
import type { PositionCalculator } from "./PositionCalculator";
import { JoystickAxisMode } from "./JoystickAxisMode";
import type { VirtualJoystickConfig } from "./VirtualJoystickConfig";
import { DefaultTouchEventSystem } from "./DefaultTouchEventSystem";
import { DefaultJoystickRenderer } from "./DefaultJoystickRenderer";
import { DefaultPositionCalculator } from "./DefaultPositionCalculator";

export class VirtualJoystick implements Scene {
    private readonly state: JoystickState;
    private readonly maxStickMovement = 60;
    private readonly deadZone = 0.1;
    private readonly baseRadius = 60;
    private readonly stickRadius = 30;
    private touchId: number | null = null;
    private steeringControl: SteeringControl | null = null;
    private accelerationControl: AccelerationControl | null = null;
    private showJoystick = true;
    private axisMode: JoystickAxisMode;
    private centerX = 0;
    private centerY = 0;
    private isInitialized = false;

    readonly name: string;
    readonly displayName: string;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly config: VirtualJoystickConfig = {},
        private readonly touchSystem: TouchEventSystem = new DefaultTouchEventSystem(),
        private readonly renderer: JoystickRenderer = new DefaultJoystickRenderer(),
        private readonly positionCalculator: PositionCalculator = new DefaultPositionCalculator()
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

        this.axisMode = config.axisMode || JoystickAxisMode.Both;
        const identifier = config.identifier || "default";
        this.name = `Virtual-Joystick-${identifier}`;
        this.displayName = `Virtual Joystick ${identifier}`;
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

    private handleTouchStart(event: TouchEvent): void {
        if (!this.showJoystick || this.touchId !== null) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        for (const touch of Array.from(event.touches)) {
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

        const touch = Array.from(event.touches).find(
            (t) => t.identifier === this.touchId
        );
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

        const touch = Array.from(event.changedTouches).find(
            (t) => t.identifier === this.touchId
        );
        if (touch) {
            this.resetInputState();
        }
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
        this.resetInputState();
    }

    private dispatchInputEvents(): void {
        const event = new CustomEvent("virtualJoystickInput", {
            detail: this.createInputObject(),
        });
        window.dispatchEvent(event);
    }

    private updateControls(): void {
        const input = this.createInputObject();

        if (this.steeringControl) {
            this.steeringControl.updateSteering(input);
        } else if (this.accelerationControl) {
            this.accelerationControl.updateAcceleration(input);
        }
    }

    private createInputObject(): JoystickInput {
        return {
            isActive: this.state.isActive,
            direction: { ...this.state.direction },
            magnitude: this.state.magnitude,
            axisMode: this.axisMode,
            identifier: this.config.identifier || "default",
        };
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

    private setupEventListeners(): void {
        this.touchSystem.registerElement(this.canvas);
        this.touchSystem.onTouchStart(this.handleTouchStart.bind(this));
        this.touchSystem.onTouchMove(this.handleTouchMove.bind(this));
        this.touchSystem.onTouchEnd(this.handleTouchEnd.bind(this));
    }

    private removeEventListeners(): void {
        this.touchSystem.unregisterElement(this.canvas);
    }

    update(): void {}

    render(context: FrameContext): void {
        if (!this.showJoystick) return;

        this.renderer.renderBase(
            context.ctx,
            this.centerX,
            this.centerY,
            this.baseRadius,
            this.config.identifier || "default"
        );
        this.renderer.renderStick(
            context.ctx,
            this.state.stickX,
            this.state.stickY,
            this.stickRadius,
            this.config.identifier || "default"
        );
    }

    private calculatePosition(): void {
        const position = this.positionCalculator.calculatePosition(
            this.canvas,
            this.config,
            this.config.identifier || "default"
        );
        this.centerX = position.x;
        this.centerY = position.y;
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
        return this.config.identifier || "default";
    }
}
