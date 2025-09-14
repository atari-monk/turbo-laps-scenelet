import { SceneId } from "../enum/scene-id";

export const SceneDescriptions: Record<SceneId, string> = {
    //Test
    [SceneId.ELIPSE_TRACK]: "Oval racing track with smooth curves",
    [SceneId.STEERABLE_RECT]: "bla",
    [SceneId.TEST_CAR]: "Player-controlled racing vehicle",
    [SceneId.SOUND_DEMO]: "Audio effects demonstration",
    [SceneId.VIRTUAL_JOYSTICK]: "Touch-based control interface (mobile)",
    //Tool
    [SceneId.MOUSE_CURSOR]: "Mouse pointer interaction system",
    //PC Game
    [SceneId.RECTANGLE_TRACK]: "Rectangular track with sharp corners",
    [SceneId.CAR]: "Player-controlled racing vehicle",
    [SceneId.TRACK_BOUNDARY]: "Boundary walls and collision detection",
    [SceneId.STARTING_GRID]: "Initial race positioning area",
    [SceneId.ROAD_MARKINGS]: "Track surface markings and guidelines",
    [SceneId.TRACK_GRASS]: "Off-track grassy areas",
    [SceneId.LAP_TRACKER]: "Lap counting and timing system",
    [SceneId.GAME_SCORE]: "Score display and performance metrics",
    [SceneId.MENU]: "Game menu interface and navigation",
    [SceneId.COUNTDOWN]: "Race start countdown sequence",
    [SceneId.CONTINUE]: "Game continuation prompts",
};
