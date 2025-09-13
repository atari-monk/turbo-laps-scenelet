import { GameType } from "./game-type";

export const GameTypeDescriptions: Record<GameType, string> = {
    [GameType.TURBO_LAPS_PC]:
        "Complete Turbo Laps game for PC with keyboard controls",
    [GameType.TURBO_LAPS_MOBILE]:
        "Complete Turbo Laps game for mobile with touch controls",
};
