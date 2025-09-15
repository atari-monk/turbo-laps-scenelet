export interface TouchEventSystem {
    registerElement(element: HTMLElement): void;
    unregisterElement(element: HTMLElement): void;
    onTouchStart(callback: (event: TouchEvent) => void): void;
    onTouchMove(callback: (event: TouchEvent) => void): void;
    onTouchEnd(callback: (event: TouchEvent) => void): void;
}
