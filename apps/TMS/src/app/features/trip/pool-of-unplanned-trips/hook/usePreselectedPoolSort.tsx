import createPersistedState from "use-persisted-state";

const PRESELECTED_POOL_SORTS_STORAGE_KEY = "poolOfUnplanned.sort";
export const preselectedPoolSortState = createPersistedState(
    PRESELECTED_POOL_SORTS_STORAGE_KEY,
    sessionStorage
);
