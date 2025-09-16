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

    updateVelocity(velocity: number): void {
        this.state.velocity = velocity;
    }

    updateLastVelocity(lastVelocity: number): void {
        this.state.lastVelocity = lastVelocity;
    }

    updateLastRotation(lastRotation: number): void {
        this.state.lastRotation = lastRotation;
    }

    updateInputEnabled(inputEnabled: boolean): void {
        this.state.inputEnabled = inputEnabled;
    }

    updateKeysEnabled(keysEnabled: boolean): void {
        this.state.keysEnabled = keysEnabled;
    }

    updateWasOnTrack(wasOnTrack: boolean): void {
        this.state.wasOnTrack = wasOnTrack;
    }

    updateIsEnginePlaying(isEnginePlaying: boolean): void {
        this.state.isEnginePlaying = isEnginePlaying;
    }

    updateIsSkidding(isSkidding: boolean): void {
        this.state.isSkidding = isSkidding;
    }

    get position(): { x: number; y: number } {
        return { ...this.state.position };
    }

    get rotation(): number {
        return this.state.rotation;
    }

    get velocity(): number {
        return this.state.velocity;
    }

    get lastVelocity(): number {
        return this.state.lastVelocity;
    }

    get lastRotation(): number {
        return this.state.lastRotation;
    }

    get inputEnabled(): boolean {
        return this.state.inputEnabled;
    }

    get keysEnabled(): boolean {
        return this.state.keysEnabled;
    }

    get wasOnTrack(): boolean {
        return this.state.wasOnTrack;
    }

    get isEnginePlaying(): boolean {
        return this.state.isEnginePlaying;
    }

    get isSkidding(): boolean {
        return this.state.isSkidding;
    }

    private getInitialState(): CarState {
        return {
            position: { x: 0, y: 0 },
            rotation: 0,
            velocity: 0,
            isEnginePlaying: false,
            isSkidding: false,
            lastVelocity: 0,
            wasOnTrack: true,
            lastRotation: 0,
            inputEnabled: true,
            keysEnabled: true,
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
        this.updateWasOnTrack(true);
    }

    handleTrackStateChange(isOnTrack: boolean): void {
        if (!this.wasOnTrack && isOnTrack) {
            this.updateWasOnTrack(true);
            this.updateKeysEnabled(true);
        } else if (this.wasOnTrack && !isOnTrack) {
            this.updateWasOnTrack(false);
            this.updateKeysEnabled(false);
        }
    }
}
