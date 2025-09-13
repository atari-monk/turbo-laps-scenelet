import { SceneType } from "./scene-type";

export const SceneTypeDescriptions: Record<SceneType, string> = {
    [SceneType.ELIPSE_TRACK]: "Oval racing track with smooth curves",
    [SceneType.RECTANGLE_TRACK]: "Rectangular track with sharp corners",
    [SceneType.CAR]: "Player-controlled racing vehicle",
    [SceneType.TEST_CAR]: "Player-controlled racing vehicle",
    [SceneType.TRACK_BOUNDARY]: "Boundary walls and collision detection",
    [SceneType.STARTING_GRID]: "Initial race positioning area",
    [SceneType.ROAD_MARKINGS]: "Track surface markings and guidelines",
    [SceneType.TRACK_GRASS]: "Off-track grassy areas",
    [SceneType.LAP_TRACKER]: "Lap counting and timing system",
    [SceneType.GAME_SCORE]: "Score display and performance metrics",
    [SceneType.MENU]: "Game menu interface and navigation",
    [SceneType.COUNTDOWN]: "Race start countdown sequence",
    [SceneType.CONTINUE]: "Game continuation prompts",
    [SceneType.MOUSE_CURSOR]: "Mouse pointer interaction system",
    [SceneType.SOUND_DEMO]: "Audio effects demonstration",
    [SceneType.VIRTUAL_JOYSTICK]: "Touch-based control interface (mobile)",
    [SceneType.STEERABLE_RECT]: "bla",
};
