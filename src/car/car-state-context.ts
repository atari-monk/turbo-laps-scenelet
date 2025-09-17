import type { CarState } from "./type/car-state";

export class CarStateContext {
    private state: CarState;

    constructor() {
        this.state = this.getInitialState();
    }

    getState(): CarState {
        return { ...this.state };
    }

    updatePosition(position: { x: number; y: number }): void {
        this.state.position = { ...position };
    }

    updateRotation(rotation: number): void {
        this.state.rotation = rotation;
    }

    updateLastRotation(lastRotation: number): void {
        this.state.lastRotation = lastRotation;
    }

    updateRotationVelocity(rotationVelocity: number): void {
        this.state.rotationVelocity = rotationVelocity;
    }

    updateVelocity(velocity: number): void {
        this.state.velocity = velocity;
    }

    updateLastVelocity(lastVelocity: number): void {
        this.state.lastVelocity = lastVelocity;
    }

    updateInputEnabled(inputEnabled: boolean): void {
        this.state.inputEnabled = inputEnabled;
    }

    updateKeysEnabled(keysEnabled: boolean): void {
        this.state.keysEnabled = keysEnabled;
    }

    updateIsOnTrack(isOnTrack: boolean): void {
        this.state.isOnTrack = isOnTrack;
    }

    get position(): { x: number; y: number } {
        return { ...this.state.position };
    }

    get rotation(): number {
        return this.state.rotation;
    }

    get lastRotation(): number {
        return this.state.lastRotation;
    }

    get rotationVelocity(): number {
        return this.state.rotationVelocity;
    }

    get velocity(): number {
        return this.state.velocity;
    }

    get lastVelocity(): number {
        return this.state.lastVelocity;
    }

    get inputEnabled(): boolean {
        return this.state.inputEnabled;
    }

    get keysEnabled(): boolean {
        return this.state.keysEnabled;
    }

    get isOnTrack(): boolean {
        return this.state.isOnTrack;
    }

    private getInitialState(): CarState {
        return {
            position: { x: 0, y: 0 },
            rotation: 0,
            lastRotation: 0,
            rotationVelocity: 0,
            velocity: 0,
            lastVelocity: 0,
            inputEnabled: true,
            keysEnabled: true,
            isOnTrack: true,
        };
    }

    setOnEnterState(width: number, height: number): void {
        this.state = this.getInitialState();
        this.updatePosition({
            x: width / 2,
            y: height / 2,
        });
    }

    setStartingPosition(position: {
        x: number;
        y: number;
        angle: number;
    }): void {
        this.updatePosition({ x: position.x, y: position.y });
        this.updateRotation(position.angle * (180 / Math.PI));
        this.updateLastRotation(this.rotation);
        this.updateVelocity(0);
        this.updateRotationVelocity(0);
        this.updateIsOnTrack(true);
    }

    handleTrackStateChange(isOnTrack: boolean): void {
        this.updateIsOnTrack(isOnTrack);
        this.updateKeysEnabled(isOnTrack);
    }
}
