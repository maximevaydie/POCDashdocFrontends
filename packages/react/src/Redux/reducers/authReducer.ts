import {createAction, createReducer} from "@reduxjs/toolkit";

import {PerishableToken} from "../../types/auth";

// Action Creators
// ---------------

export const setToken = createAction<PerishableToken>("dashdoc/auth/token/set");

// Reducer
// -------

export type Auth = {
    token: PerishableToken | null;
};
const initialState: Auth = {
    token: null,
};

export const authReducer = createReducer<Auth>(initialState, (builder) => {
    builder.addCase(setToken, (state, action) => {
        return {...state, token: action.payload};
    });
});
