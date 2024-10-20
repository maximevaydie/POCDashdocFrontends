export * from "../hooks";

import {
    ManagerCompany,
    RESET_REDUX_STATE,
    RealtimeState,
    SettingsViewState,
    Account,
    Auth,
    CommonEntities,
    accountReducer,
    authReducer,
    entitiesReducer,
    realtimeReducer,
    selectionsReducer,
    settingsViewsReducer,
} from "@dashdoc/web-common";
import {combineReducers} from "redux";
import {wamAccountReducer, WamAccountState} from "redux/reducers/wamAccount.slice";

import {WasteState, wasteReducer} from "./waste";

// @guidedtour[epic=redux, seq=5] Reducers
// This is where we define two things:
// - the shape of the state
// - the reducers that will update the state based on actions
// Since we have a single state object with the whole state of the app, we have a lot of reducers.
// So we use the combineReducers function to combine several small reducers into a single one.
export const createRootReducer = () => {
    const appReducer = combineReducers({
        auth: authReducer,
        account: accountReducer,
        wamAccount: wamAccountReducer,
        entities: entitiesReducer(),
        selections: selectionsReducer,
        waste: wasteReducer,
        settingsViews: settingsViewsReducer,
        realtime: realtimeReducer,
    });
    const rootReducer = (state: any, action: any) => {
        if (action?.type === RESET_REDUX_STATE) {
            state = undefined;
        }

        return appReducer(state, action);
    };
    return rootReducer;
};

export type RootState = {
    auth: Auth;
    account: Omit<Account, "companies"> & {companies: ManagerCompany[]};
    wamAccount: WamAccountState;
    entities: CommonEntities;
    waste: WasteState;
    settingsViews: SettingsViewState;
    realtime: RealtimeState;
};
