import {apiService} from "@dashdoc/web-common";
import {createReducer, createSelector} from "@reduxjs/toolkit";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {Silently, FlowState} from "redux/reducers/flow";
import {LoadingState, ReportingFilters, ReportingData} from "types";

// Action Creators
// ---------------
export const fetchReporting = createAsyncThunk(
    "dashdoc/flow/reporting/iframe-url/fetch",
    async (filters: ReportingFilters & Silently) => {
        const params = new URLSearchParams(filters as any).toString();
        const data: ReportingData = await apiService.get(`/flow/reporting/iframe-url/?${params}`, {
            apiVersion: "web",
        });
        return {data};
    }
);

// Reducer
// -------
export type ReportingState = {
    data: ReportingData | null;
    loading: LoadingState;
};

const initialState: ReportingState = {
    data: null,
    loading: "idle",
};

export const reportingReducer = createReducer<ReportingState>(initialState, (builder) => {
    builder.addCase(fetchReporting.pending, (state, action) => {
        if (!action.meta.arg.silently) {
            if (state.loading === "idle") {
                state.loading = "pending";
            } else {
                state.loading = "reloading";
            }
        }
    });
    builder.addCase(fetchReporting.rejected, (state) => {
        state.loading = "failed";
    });
    builder.addCase(fetchReporting.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.data = action.payload.data;
    });
});

const selectSelf = (state: {flow: FlowState}) => state;

export const selectReporting = createSelector(selectSelf, ({flow}) => ({
    reportingData: flow.reporting.data,
    loading: flow.reporting.loading,
}));
