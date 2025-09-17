import type { CarStateContext } from "./car-state-context";

export class MovementSystem {
    private rotationMeasurementTime = 0;
    private lastRotationMeasurement = 0;
    private rotationSampleInterval = 0.2;

    constructor(private readonly stateContext: CarStateContext) {}

    update(deltaTime: number): void {
        this.savePreviousState();
        this.normalizeRotation();
        this.updateRotationMeasurement(deltaTime);
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

    private updateRotationMeasurement(deltaTime: number): void {
        this.rotationMeasurementTime += deltaTime;

        if (this.rotationMeasurementTime >= this.rotationSampleInterval) {
            const currentRotation = this.stateContext.rotation;
            const rotationDelta = this.calculateWrappedRotationDelta(
                currentRotation,
                this.lastRotationMeasurement
            );
            const rotationVelocity =
                rotationDelta / this.rotationMeasurementTime;

            this.stateContext.updateRotationVelocity(rotationVelocity);
            this.lastRotationMeasurement = currentRotation;
            this.rotationMeasurementTime = 0;
        }
    }

    private calculateWrappedRotationDelta(
        current: number,
        previous: number
    ): number {
        let delta = current - previous;

        if (delta > 180) {
            delta -= 360;
        } else if (delta < -180) {
            delta += 360;
        }

        return delta;
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
