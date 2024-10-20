import {apiService} from "@dashdoc/web-common";
import {createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {Silently, FlowState} from "redux/reducers/flow";
import {LoadingState, RequestFilters, SlotStatistics} from "types";

// Action Creators
// ---------------
export const fetchStatistics = createAsyncThunk(
    "dashdoc/flow/statistic/fetch",
    async (filters: RequestFilters & Silently) => {
        const params = new URLSearchParams(filters as any).toString();
        const data: SlotStatistics = await apiService.get(`/flow/slot-statistics/?${params}`, {
            apiVersion: "web",
        });
        return {data};
    }
);

// Reducer
// -------
export type StatisticState = {
    slots: SlotStatistics;
    loading: LoadingState;
};

const initialState: StatisticState = {
    slots: {
        onsite: 0,
        to_come: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
    },
    loading: "idle",
};

export const statisticReducer = createReducer<StatisticState>(initialState, (builder) => {
    builder.addCase(fetchStatistics.pending, (state, action) => {
        if (!action.meta.arg.silently) {
            if (state.loading === "idle") {
                state.loading = "pending";
            } else {
                state.loading = "reloading";
            }
        }
    });
    builder.addCase(fetchStatistics.rejected, (state) => {
        state.loading = "failed";
    });
    builder.addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.slots = action.payload.data;
    });
});

const selectSelf = (state: {flow: FlowState}) => state;

export const selectStatistics = createSelector(selectSelf, ({flow}) => flow.statistic.slots);

export const selectStatisticsLoading = createSelector(
    selectSelf,
    ({flow}) => flow.statistic.loading
);
