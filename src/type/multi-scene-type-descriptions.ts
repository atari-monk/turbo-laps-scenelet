import { MultiSceneType } from "./multi-scene-type";

export const MultiSceneTypeDescriptions: Record<MultiSceneType, string> = {
    [MultiSceneType.TRACK_CURSOR]: "Track selection and cursor interaction",
    [MultiSceneType.START_RACE]: "Race initialization and start sequence",
    [MultiSceneType.CAR_OUT_OF_TRACK]: "Off-track detection and handling",
    [MultiSceneType.LAP_MEASUREMENT]: "Lap timing and progress tracking",
    [MultiSceneType.RACE_RESTART]: "Race reset and replay functionality",
    [MultiSceneType.JOYSTICK_TEST]: "Test of joystick controlling car",
    [MultiSceneType.XY_JOYSTICK_TEST]: "bla",
    [MultiSceneType.JOYSTICK_FOR_CAR]: "bla",
};
