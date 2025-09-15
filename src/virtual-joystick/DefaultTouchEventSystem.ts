import type { TouchEventSystem } from "./TouchEventSystem";

export class DefaultTouchEventSystem implements TouchEventSystem {
    private touchStartCallbacks: Set<(event: TouchEvent) => void> = new Set();
    private touchMoveCallbacks: Set<(event: TouchEvent) => void> = new Set();
    private touchEndCallbacks: Set<(event: TouchEvent) => void> = new Set();
    private registeredElements: Set<HTMLElement> = new Set();

    registerElement(element: HTMLElement): void {
        if (this.registeredElements.has(element)) return;

        element.addEventListener(
            "touchstart",
            this.handleTouchStart.bind(this),
            { passive: false }
        );
        element.addEventListener("touchmove", this.handleTouchMove.bind(this), {
            passive: false,
        });
        element.addEventListener("touchend", this.handleTouchEnd.bind(this), {
            passive: false,
        });
        element.addEventListener(
            "touchcancel",
            this.handleTouchEnd.bind(this),
            { passive: false }
        );

        this.registeredElements.add(element);
    }

    unregisterElement(element: HTMLElement): void {
        if (!this.registeredElements.has(element)) return;

        element.removeEventListener(
            "touchstart",
            this.handleTouchStart.bind(this)
        );
        element.removeEventListener(
            "touchmove",
            this.handleTouchMove.bind(this)
        );
        element.removeEventListener("touchend", this.handleTouchEnd.bind(this));
        element.removeEventListener(
            "touchcancel",
            this.handleTouchEnd.bind(this)
        );

        this.registeredElements.delete(element);
    }

    onTouchStart(callback: (event: TouchEvent) => void): void {
        this.touchStartCallbacks.add(callback);
    }

    onTouchMove(callback: (event: TouchEvent) => void): void {
        this.touchMoveCallbacks.add(callback);
    }

    onTouchEnd(callback: (event: TouchEvent) => void): void {
        this.touchEndCallbacks.add(callback);
    }

    private handleTouchStart(event: TouchEvent): void {
        this.touchStartCallbacks.forEach((callback) => callback(event));
    }

    private handleTouchMove(event: TouchEvent): void {
        this.touchMoveCallbacks.forEach((callback) => callback(event));
    }

    private handleTouchEnd(event: TouchEvent): void {
        this.touchEndCallbacks.forEach((callback) => callback(event));
    }
}
