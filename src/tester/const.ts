export enum SceneId {
    // Prototype
    ELIPSE_TRACK = "Elipse-Track",
    // Joystick
    VIRTUAL_JOYSTICK = "Virtual-Joystick",
    STEERABLE_RECT = "Steerable-Rect",
    TEST_CAR = "Test-Car",
    // Mouse
    DRAW_A_POINT = "Draw-a-Point",
    // Sound
    SOUND_DEMO = "Sound-Demo",
    // PCGame
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
    // Joystick
    JOYSTICK_FOR_TEST_CAR = "Joystick-Test",
    XY_JOYSTICK = "XY-Joystick-Test",
    JOYSTICK_FOR_GAME_CAR = "Joystick-For-Car",
    // Tool
    TRACK_CURSOR = "Track-Cursor",
    // PCGame
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
    // Prototype
    [SceneId.ELIPSE_TRACK]: "Oval racing track with smooth curves",
    // Joystick
    [SceneId.VIRTUAL_JOYSTICK]: "Touch-based control interface",
    [SceneId.STEERABLE_RECT]: "Player-controlled xy rect",
    [SceneId.TEST_CAR]: "Player-controlled test vehicle",
    [SceneId.SOUND_DEMO]: "Audio effects demonstration",
    // Mouse
    [SceneId.DRAW_A_POINT]: "Click a mouse to draw a point",
    // PCGame
    [SceneId.RECTANGLE_TRACK]: "Rectangular track with sharp corners",
    [SceneId.CAR]: "Player-controlled game vehicle",
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
    // Joystick
    [MultiSceneId.XY_JOYSTICK]: "XY Joystick controlling steerable rect",
    [MultiSceneId.JOYSTICK_FOR_TEST_CAR]: "Joystick controlling test car",
    [MultiSceneId.JOYSTICK_FOR_GAME_CAR]: "Joystick controlling game car",
    // Tool
    [MultiSceneId.TRACK_CURSOR]: "Track selection and cursor interaction",
    // PCGame
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
