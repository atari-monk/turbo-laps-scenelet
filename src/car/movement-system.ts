import type { CarStateContext } from "./car-state-context";

export class MovementSystem {
    constructor(private readonly stateContext: CarStateContext) {}

    update(deltaTime: number): void {
        this.savePreviousState();
        this.normalizeRotation();
        this.applyMovement(deltaTime);
    }

    private savePreviousState(): void {
        this.stateContext.updateLastVelocity(this.stateContext.velocity);
        this.stateContext.updateLastRotation(this.stateContext.rotation);
    }

    private normalizeRotation(): void {
        this.stateContext.updateRotation(
            ((this.stateContext.rotation % 360) + 360) % 360
        );
    }

    private applyMovement(deltaTime: number): void {
        if (this.stateContext.velocity === 0) return;

        const radians = (this.stateContext.rotation * Math.PI) / 180;
        const newX =
            this.stateContext.position.x +
            Math.sin(radians) * this.stateContext.velocity * deltaTime;
        const newY =
            this.stateContext.position.y +
            -Math.cos(radians) * this.stateContext.velocity * deltaTime;

        this.stateContext.updatePosition({ x: newX, y: newY });
    }
}
