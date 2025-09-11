import type { InputSystem } from "zippy-game-engine";
import { INPUT_MAPPING } from "./type/input-mapping";
import type { CarStateContext } from "./car-state-context";
import type { CarConfig } from "./type/car-config";

export class CarInputHandler {
    constructor(
        private readonly input: InputSystem,
        private readonly stateContext: CarStateContext,
        private readonly config: CarConfig
    ) {}

    processInput(deltaTime: number): void {
        if (!this.stateContext.inputEnabled) return;

        this.handleAcceleration();
        this.handleSteering(deltaTime);
    }

    isKeyPressed(key: string): boolean {
        return (
            this.input.keyboard.isKeyDown(key) && this.stateContext.keysEnabled
        );
    }

    private handleAcceleration(): void {
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

    private handleSteering(deltaTime: number): void {
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
}
