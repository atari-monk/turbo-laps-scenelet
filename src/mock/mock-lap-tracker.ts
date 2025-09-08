import type { ILapTracker } from "../scene/lap-tracker";

export class MockLapTracker implements ILapTracker {
    private lapTimes: number[] = [];
    private currentLap = 0;
    private currentSector = 0;
    private sectorTimes: number[] = [];
    private totalTime = 0;
    private isTrackingFlag = false;
    private raceCompleteCallback?: () => void;

    setRaceCompleteCallback(callback: () => void): void {
        this.raceCompleteCallback = callback;
    }

    getLapTimes(): number[] {
        return [...this.lapTimes];
    }

    getCurrentLap(): number {
        return this.currentLap;
    }

    getCurrentSector(): number {
        return this.currentSector;
    }

    getSectorTimes(): number[] {
        return [...this.sectorTimes];
    }

    getTotalTime(): number {
        return this.totalTime;
    }

    isTracking(): boolean {
        return this.isTrackingFlag;
    }

    start(): void {
        this.isTrackingFlag = true;
    }

    stop(): void {
        this.isTrackingFlag = false;
    }

    reset(): void {
        this.lapTimes = [];
        this.currentLap = 0;
        this.currentSector = 0;
        this.sectorTimes = [];
        this.totalTime = 0;
        this.isTrackingFlag = false;
    }

    setMockLapTimes(times: number[]): void {
        this.lapTimes = [...times];
    }

    setMockCurrentLap(lap: number): void {
        this.currentLap = lap;
    }

    setMockCurrentSector(sector: number): void {
        this.currentSector = sector;
    }

    setMockSectorTimes(times: number[]): void {
        this.sectorTimes = [...times];
    }

    setMockTotalTime(time: number): void {
        this.totalTime = time;
    }

    setMockIsTracking(isTracking: boolean): void {
        this.isTrackingFlag = isTracking;
    }

    triggerRaceComplete(): void {
        this.raceCompleteCallback?.();
    }
}
