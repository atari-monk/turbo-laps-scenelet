export interface JoystickRenderer {
    renderBase(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        identifier: string
    ): void;
    renderStick(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        identifier: string
    ): void;
}
