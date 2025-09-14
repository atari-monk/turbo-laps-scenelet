import type { InputSystem } from "zippy-game-engine";
import { INPUT_MAPPING } from "./const/input-mapping";
import type { CarStateContext } from "./car-state-context";
import type { CarConfig } from "./type/car-config";
import type { JoystickInput } from "../type/joystick-input";

export class CarInputHandler {
    private usingJoystick: boolean;
    private joystickAcceleration: number;
    private joystickSteering: number;

    constructor(
        private readonly input: InputSystem,
        private readonly stateContext: CarStateContext,
        private readonly config: CarConfig
    ) {
        this.usingJoystick = false;
        this.joystickAcceleration = 0;
        this.joystickSteering = 0;
    }

    processInput(deltaTime: number): void {
        if (!this.stateContext.inputEnabled) return;

        if (this.usingJoystick) {
            this.handleJoystickAcceleration();
            this.handleJoystickSteering(deltaTime);
        } else {
            this.handleKeyboardAcceleration();
            this.handleKeyboardSteering(deltaTime);
        }
    }

    setSteeringInput(input: JoystickInput): void {
        this.usingJoystick = true;
        this.joystickSteering = input.direction.x * input.magnitude;
    }

    setAccelerationInput(input: JoystickInput): void {
        this.usingJoystick = true;
        this.joystickAcceleration = -input.direction.y * input.magnitude;
    }

    isKeyPressed(key: string): boolean {
        return (
            this.input.keyboard.isKeyDown(key) && this.stateContext.keysEnabled
        );
    }

    private handleKeyboardAcceleration(): void {
        if (this.isKeyPressed(INPUT_MAPPING.ACCELERATE)) {
            this.stateContext.updateVelocity(this.config.moveSpeed);
        } else if (this.isKeyPressed(INPUT_MAPPING.BRAKE)) {
            this.stateContext.updateVelocity(-this.config.moveSpeed * 0.3);
        } else if (this.isKeyPressed(INPUT_MAPPING.HANDBRAKE)) {
            this.stateContext.updateVelocity(this.stateContext.velocity * 0.95);
        } else if (this.stateContext.velocity !== 0) {
            this.stateContext.updateVelocity(this.stateContext.velocity * 0.98);
        }
    }

    private handleKeyboardSteering(deltaTime: number): void {
        const canTurn =
            this.config.allowStationaryTurning ||
            this.stateContext.velocity !== 0;

        if (!canTurn) return;

        if (this.isKeyPressed(INPUT_MAPPING.TURN_LEFT)) {
            this.stateContext.updateRotation(
                this.stateContext.rotation - this.config.turnSpeed * deltaTime
            );
        }
        if (this.isKeyPressed(INPUT_MAPPING.TURN_RIGHT)) {
            this.stateContext.updateRotation(
                this.stateContext.rotation + this.config.turnSpeed * deltaTime
            );
        }
    }

    private handleJoystickAcceleration(): void {
        if (this.joystickAcceleration > 0) {
            this.stateContext.updateVelocity(
                this.config.moveSpeed * this.joystickAcceleration
            );
        } else if (this.joystickAcceleration < 0) {
            this.stateContext.updateVelocity(
                this.config.moveSpeed * this.joystickAcceleration
            );
        } else if (this.stateContext.velocity !== 0) {
            this.stateContext.updateVelocity(this.stateContext.velocity * 0.98);
        }
    }

    private handleJoystickSteering(deltaTime: number): void {
        const canTurn =
            this.config.allowStationaryTurning ||
            this.stateContext.velocity !== 0;

        if (!canTurn) return;

        if (this.joystickSteering !== 0) {
            this.stateContext.updateRotation(
                this.stateContext.rotation +
                    this.joystickSteering * this.config.turnSpeed * deltaTime
            );
        }
    }
}
