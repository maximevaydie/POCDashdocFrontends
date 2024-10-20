import {createAction, createReducer} from "@reduxjs/toolkit";
import {FlowState} from "redux/reducers/flow";

export type RequestFilters = {
    site: number;
    start: string;
    end: string;
};

// Action Creators
// ---------------
export const updateFilters = createAction<RequestFilters>("dashdoc/flow/filter/update");

// Reducer
// -------
export type FilterState = {} | RequestFilters;

export const filterReducer = createReducer<FilterState>({}, (builder) => {
    builder.addCase(updateFilters, (_, action) => {
        return action.payload;
    });
});

export const selectFilters = (state: {flow: FlowState}) => state.flow.filter;
