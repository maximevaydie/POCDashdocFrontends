import {
    accountReducer,
    authReducer,
    realtimeReducer,
    RealtimeState,
    RESET_REDUX_STATE,
    SettingsViewState,
    Account,
    Auth,
} from "@dashdoc/web-common";
import {combineReducers} from "redux";

import {FlowManagerCompany} from "../../types/company";

import {flowReducer, FlowState} from "./flow";

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
        flow: flowReducer,
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
    account: Omit<Account, "companies"> & {companies: FlowManagerCompany[]};
    flow: FlowState;
    settingsViews: SettingsViewState;
    realtime: RealtimeState;
};
