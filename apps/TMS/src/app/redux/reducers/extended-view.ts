import {createAction, createReducer} from "@reduxjs/toolkit";
// Action Creators
// ---------------

export const setExtendedView = createAction<boolean>("dashdoc/extendedView/set");

// Reducer
// -------
const initialValue = false;

export const extendedViewReducer = createReducer(initialValue, (builder) => {
    builder.addCase(setExtendedView, (_state, action) => {
        return action.payload;
    });
});
