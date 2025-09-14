import { MultiSceneId } from "../enum/multi-scene-id";

export const MultiSceneDescriptions: Record<MultiSceneId, string> = {
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
