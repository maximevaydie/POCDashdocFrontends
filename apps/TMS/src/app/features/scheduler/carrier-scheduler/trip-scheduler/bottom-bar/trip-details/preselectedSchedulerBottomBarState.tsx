import createPersistedState from "use-persisted-state";
export const preselectedSchedulerBottomBarState = createPersistedState(
    "scheduler.bottomBar",
    sessionStorage
);
