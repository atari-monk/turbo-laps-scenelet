import type { CarState } from "./type/car-state";

export class CarStateContext {
    private state: CarState;

    constructor() {
        this.state = this.createInitialState();
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

    private createInitialState(): CarState {
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
}
