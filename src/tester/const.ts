export enum SceneId {
    //Test
    ELIPSE_TRACK = "Elipse-Track",
    STEERABLE_RECT = "Steerable-Rect",
    TEST_CAR = "Test-Car",
    SOUND_DEMO = "Sound-Demo",
    VIRTUAL_JOYSTICK = "Virtual-Joystick",
    //Tool
    MOUSE_CURSOR = "Mouse-Cursor",
    //PC Game
    RECTANGLE_TRACK = "Rectangle-Track",
    CAR = "Car",
    TRACK_BOUNDARY = "Track-Boundary",
    STARTING_GRID = "Starting-Grid",
    ROAD_MARKINGS = "Road-Markings",
    TRACK_GRASS = "Track-Grass",
    LAP_TRACKER = "Lap-Tracker",
    GAME_SCORE = "Game-Score",
    MENU = "Menu",
    COUNTDOWN = "Countdown",
    CONTINUE = "Continue",
}

export enum MultiSceneId {
    //Test
    JOYSTICK_TEST = "Joystick-Test",
    XY_JOYSTICK_TEST = "XY-Joystick-Test",
    JOYSTICK_FOR_CAR = "Joystick-For-Car",
    //Tool
    TRACK_CURSOR = "Track-Cursor",
    //PC Game Test
    START_RACE = "Start-Race",
    CAR_OUT_OF_TRACK = "Car-Out-Of-Track",
    LAP_MEASUREMENT = "Lap-Measurement",
    RACE_RESTART = "Race-Restart",
}

export enum GameId {
    TURBO_LAPS_PC = "TurboLaps-Pc",
    TURBO_LAPS_MOBILE = "TurboLaps-Mobile",
}

export const SceneDescription: Record<SceneId, string> = {
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

export const MultiSceneDescription: Record<MultiSceneId, string> = {
    //Test
    [MultiSceneId.JOYSTICK_TEST]: "Test of joystick controlling car",
    [MultiSceneId.XY_JOYSTICK_TEST]: "bla",
    [MultiSceneId.JOYSTICK_FOR_CAR]: "bla",
    //Tool
    [MultiSceneId.TRACK_CURSOR]: "Track selection and cursor interaction",
    //PC Game Test
    [MultiSceneId.START_RACE]: "Race initialization and start sequence",
    [MultiSceneId.CAR_OUT_OF_TRACK]: "Off-track detection and handling",
    [MultiSceneId.LAP_MEASUREMENT]: "Lap timing and progress tracking",
    [MultiSceneId.RACE_RESTART]: "Race reset and replay functionality",
};

export const GameDescription: Record<GameId, string> = {
    [GameId.TURBO_LAPS_PC]:
        "Complete Turbo Laps game for PC with keyboard controls",
    [GameId.TURBO_LAPS_MOBILE]:
        "Complete Turbo Laps game for mobile with touch controls",
};
