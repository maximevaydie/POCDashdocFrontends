import {Store} from "redux";

import {CommonRootState} from "../redux/types";

import {authService} from "./auth.service";
import {LOCAL_STORAGE_TOKEN_KEY, tokenService} from "./token.service";

let storeSingleton: Store<CommonRootState> | null = null;

// @guidedtour[epic=redux, seq=1] Store creation and basics
// This is where it all begins.
// The basics of redux are: you have a store, you have a reducer, you have actions.
// An action is a simple object that describes an event that happened.
// A reducer is a function that takes the current state and an action and returns the new state.
// The store is the single source of truth for the whole application. It holds the current state.
// Here we create the store and add middleware.
// Middleware are functions that can intercept actions and do something with them before they are handled by the reducer.
export function setStore<StoreState extends CommonRootState>(store: Store<StoreState>) {
    storeSingleton = store;
    /**
     * @guidedtour[epic=auth] Init
     * Init the redux store state.
     */
    const token = tokenService.getPersistedToken();
    if (token) {
        authService.setAuthToken(token);
    }

    window.addEventListener("storage", (e) => {
        if (
            (e.key === LOCAL_STORAGE_TOKEN_KEY &&
                e.url.startsWith(import.meta.env.VITE_API_HOST)) ||
            e.url.startsWith(window.location.origin)
        ) {
            authService.localStorageSync();
        }
    });
}

// To access the store singleton we use this function.
function getState<StoreState extends CommonRootState>() {
    if (storeSingleton === null) {
        throw Error("store not configured, please configure the store before the first getState");
    }
    return storeSingleton.getState() as StoreState;
}

// To access the store singleton we use this function.
function getDispatch() {
    if (storeSingleton === null) {
        throw Error("store not configured, please configure the store before the first getState");
    }
    return storeSingleton.dispatch;
}

export const storeService = {
    setStore,
    getState,
    getDispatch,
};
