export interface PlayOptions {
    volume?: number;
    loop?: boolean;
    onEnd?: () => void;
    interrupt?: boolean;
}
