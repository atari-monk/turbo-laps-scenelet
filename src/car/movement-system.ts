import type { InputSystem } from "zippy-game-engine";
import type { CarConfig } from "./type/car-config";
import { INPUT_MAPPING } from "./type/input-mapping";
import type { CarStateContext } from "./car-state-context";

export class MovementSystem {
    constructor(
        private readonly input: InputSystem,
        private readonly stateManager: CarStateContext,
        private config: CarConfig
    ) {}

    update(deltaTime: number): void {
        if (!this.stateManager.inputEnabled) return;

        this.savePreviousState();
        this.handleAcceleration();
        this.handleSteering(deltaTime);
        this.normalizeRotation();
        this.applyMovement(deltaTime);
    }

    private savePreviousState(): void {
        this.stateManager.updateLastVelocity(this.stateManager.velocity);
        this.stateManager.updateLastRotation(this.stateManager.rotation);
    }

    private handleAcceleration(): void {
        if (this.isKeyPressed(INPUT_MAPPING.ACCELERATE)) {
            this.stateManager.updateVelocity(this.config.moveSpeed);
        } else if (this.isKeyPressed(INPUT_MAPPING.BRAKE)) {
            this.stateManager.updateVelocity(-this.config.moveSpeed * 0.3);
        } else if (this.isKeyPressed(INPUT_MAPPING.HANDBRAKE)) {
            this.stateManager.updateVelocity(this.stateManager.velocity * 0.95);
        } else if (this.stateManager.velocity !== 0) {
            this.stateManager.updateVelocity(this.stateManager.velocity * 0.98);
        }
    }

    private handleSteering(deltaTime: number): void {
        const canTurn =
            this.config.allowStationaryTurning ||
            this.stateManager.velocity !== 0;

        if (!canTurn) return;

        if (this.isKeyPressed(INPUT_MAPPING.TURN_LEFT)) {
            this.stateManager.updateRotation(
                this.stateManager.rotation - this.config.turnSpeed * deltaTime
            );
        }
        if (this.isKeyPressed(INPUT_MAPPING.TURN_RIGHT)) {
            this.stateManager.updateRotation(
                this.stateManager.rotation + this.config.turnSpeed * deltaTime
            );
        }
    }

    private normalizeRotation(): void {
        this.stateManager.updateRotation(
            ((this.stateManager.rotation % 360) + 360) % 360
        );
    }

    private applyMovement(deltaTime: number): void {
        if (this.stateManager.velocity === 0) return;

        const radians = (this.stateManager.rotation * Math.PI) / 180;
        const newX =
            this.stateManager.position.x +
            Math.sin(radians) * this.stateManager.velocity * deltaTime;
        const newY =
            this.stateManager.position.y +
            -Math.cos(radians) * this.stateManager.velocity * deltaTime;

        this.stateManager.updatePosition({ x: newX, y: newY });
    }

    private isKeyPressed(key: string): boolean {
        return (
            this.input.keyboard.isKeyDown(key) && this.stateManager.keysEnabled
        );
    }
}
