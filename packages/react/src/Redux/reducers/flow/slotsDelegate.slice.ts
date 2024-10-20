import {apiService} from "@dashdoc/web-common";
import {createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {persistSlots} from "redux/reducers/flow/slot.slice";
import {LoadingState, MutationState, RequestFilters} from "types";

export type SlotsDelegateState = {
    updating: MutationState;
    loading: LoadingState;
};

// Action Creators
// ---------------
export const fetchDelegateSlots = createAsyncThunk(
    "dashdoc/flow/delegateSlots/fetch",
    async (requestFilters: RequestFilters, {dispatch}) => {
        const {end: _, ...filters} = requestFilters;
        const params = new URLSearchParams(filters as any).toString();
        const data = await apiService.get(`/flow/slots/?${params}`, {
            apiVersion: "web",
        });
        dispatch(persistSlots(data.results));
        return {data};
    }
);

// Reducer
// -------

export type DelegateSlotsState = {
    loading: LoadingState;
};

const initialDelegateSlotsState: DelegateSlotsState = {
    loading: "idle",
};

export const slotsDelegateReducer = createReducer<DelegateSlotsState>(
    initialDelegateSlotsState,
    (builder) => {
        builder.addCase(fetchDelegateSlots.pending, (state) => {
            if (state.loading === "idle") {
                state.loading = "pending";
            } else {
                state.loading = "reloading";
            }
        });
        builder.addCase(fetchDelegateSlots.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addCase(fetchDelegateSlots.fulfilled, (state) => {
            state.loading = "succeeded";
        });
    }
);
