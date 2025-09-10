import type { InputSystem } from "zippy-game-engine";
import type { CarConfig } from "./type/car-config";
import type { CarState } from "./type/car-state";
import { INPUT_MAPPING } from "./type/input-mapping";

export class MovementSystem {
    constructor(private readonly input: InputSystem) {}

    update(deltaTime: number): void {
        if (!this.state.inputEnabled) return;

        this.savePreviousState();
        this.handleAcceleration();
        this.handleSteering(deltaTime);
        this.normalizeRotation();
        this.applyMovement(deltaTime);
    }

    private savePreviousState(): void {
        this.state.lastVelocity = this.state.velocity;
        this.state.lastRotation = this.state.rotation;
    }

    private handleAcceleration(): void {
        if (this.isKeyPressed(INPUT_MAPPING.ACCELERATE)) {
            this.state.velocity = this.config.moveSpeed;
        } else if (this.isKeyPressed(INPUT_MAPPING.BRAKE)) {
            this.state.velocity = -this.config.moveSpeed * 0.3;
        } else if (this.isKeyPressed(INPUT_MAPPING.HANDBRAKE)) {
            this.state.velocity *= 0.95;
        } else if (this.state.velocity !== 0) {
            this.state.velocity *= 0.98;
        }
    }

    private handleSteering(deltaTime: number): void {
        const canTurn =
            this.config.allowStationaryTurning || this.state.velocity !== 0;

        if (!canTurn) return;

        if (this.isKeyPressed(INPUT_MAPPING.TURN_LEFT)) {
            this.state.rotation -= this.config.turnSpeed * deltaTime;
        }
        if (this.isKeyPressed(INPUT_MAPPING.TURN_RIGHT)) {
            this.state.rotation += this.config.turnSpeed * deltaTime;
        }
    }

    private normalizeRotation(): void {
        this.state.rotation = ((this.state.rotation % 360) + 360) % 360;
    }

    private applyMovement(deltaTime: number): void {
        if (this.state.velocity === 0) return;

        const radians = (this.state.rotation * Math.PI) / 180;
        this.state.position.x +=
            Math.sin(radians) * this.state.velocity * deltaTime;
        this.state.position.y +=
            -Math.cos(radians) * this.state.velocity * deltaTime;
    }

    private isKeyPressed(key: string): boolean {
        return this.input.keyboard.isKeyDown(key) && this.state.keysEnabled;
    }

    set carConfig(value: CarConfig) {
        this.config = value;
    }

    set carState(value: CarState) {
        this.state = value;
    }

    private config!: CarConfig;
    private state!: CarState;
}
