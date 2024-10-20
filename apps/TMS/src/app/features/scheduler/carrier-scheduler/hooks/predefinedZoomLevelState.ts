import createPersistedState from "use-persisted-state";

const PREDEFINED_ZOOM_LEVEL_STORAGE_KEY = "scheduler.predefinedZoomLevel";
export const predefinedZoomLevelState = createPersistedState(
    PREDEFINED_ZOOM_LEVEL_STORAGE_KEY,
    sessionStorage
);
