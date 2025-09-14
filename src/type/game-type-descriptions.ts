import { GameId } from "../tester/enum/game-id";

export const GameTypeDescriptions: Record<GameId, string> = {
    [GameId.TURBO_LAPS_PC]:
        "Complete Turbo Laps game for PC with keyboard controls",
    [GameId.TURBO_LAPS_MOBILE]:
        "Complete Turbo Laps game for mobile with touch controls",
};
