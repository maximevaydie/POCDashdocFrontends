import createPersistedState from "use-persisted-state";

const PRESELECTED_TRANSPORT_SORTS_STORAGE_KEY = "transport.sort";
export const preselectedSortsState = createPersistedState(
    PRESELECTED_TRANSPORT_SORTS_STORAGE_KEY,
    sessionStorage
);
