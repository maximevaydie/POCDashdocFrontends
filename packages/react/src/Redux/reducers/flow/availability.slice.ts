import {apiService} from "@dashdoc/web-common";
import {createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {FlowState} from "redux/reducers/flow";
import {AvailabilityFilters, AvailabilityStatus, LoadingState} from "types";

// Action Creators
// ---------------
/**
 * @deprecated We will use fetchVirtualAvailabilities instead of fetchAvailabilities
 */
export const fetchAvailabilities = createAsyncThunk(
    "dashdoc/flow/availability/fetch",
    async (filters: AvailabilityFilters) => {
        const {zone, ...dateFilters} = filters;
        const params = new URLSearchParams(dateFilters as any).toString();
        const data: AvailabilityStatus[] = await apiService.get(
            `/flow/zones/${zone}/availabilities/?${params}`,
            {
                apiVersion: "web",
            }
        );
        return {data, filters};
    }
);

type VirtualAvailabilitiesPayload = {
    slots_in_cart: {
        start_time: string;
        end_time: string;
    }[];
};

type VirtualAvailabilitiesResult = {
    unavailable_slots_in_cart: {start_time: string; end_time: string}[];
    calendar_slots: AvailabilityStatus[];
};

export const fetchVirtualAvailabilities = createAsyncThunk(
    "dashdoc/flow/virtual-availability/fetch",
    async (
        filters: AvailabilityFilters & {
            slots_in_cart: {
                start_time: string;
                end_time: string;
            }[];
        }
    ) => {
        const {zone, slots_in_cart, ...dateFilters} = filters;
        const params = new URLSearchParams(dateFilters as any).toString();
        const payload: VirtualAvailabilitiesPayload = {
            slots_in_cart: [],
        };
        if (slots_in_cart.length > 0) {
            payload.slots_in_cart = slots_in_cart;
        }
        const result: VirtualAvailabilitiesResult = await apiService.post(
            `/flow/zones/${zone}/virtual-availabilities/?${params}`,
            payload,
            {
                apiVersion: "web",
            }
        );
        return {data: result.calendar_slots, filters};
    }
);

// Reducer
// -------
export type AvailabilityState = {
    entities: AvailabilityStatus[];
    filters: AvailabilityFilters | null;
    loading: LoadingState;
};

const initialState: AvailabilityState = {
    entities: [],
    filters: null,
    loading: "idle",
};

export const availabilityReducer = createReducer<AvailabilityState>(initialState, (builder) => {
    builder.addCase(fetchAvailabilities.pending, (state) => {
        if (state.loading === "idle") {
            state.loading = "pending";
        } else {
            state.loading = "reloading";
        }
    });
    builder.addCase(fetchAvailabilities.rejected, (state) => {
        state.loading = "failed";
    });
    builder.addCase(fetchAvailabilities.fulfilled, (state, action) => {
        state.entities = action.payload.data;
        state.loading = "succeeded";
    });

    builder.addCase(fetchVirtualAvailabilities.pending, (state) => {
        if (state.loading === "idle") {
            state.loading = "pending";
        } else {
            state.loading = "reloading";
        }
    });
    builder.addCase(fetchVirtualAvailabilities.rejected, (state) => {
        state.loading = "failed";
    });
    builder.addCase(fetchVirtualAvailabilities.fulfilled, (state, action) => {
        state.entities = action.payload.data;
        state.loading = "succeeded";
    });
});

const selectSelf = (state: {flow: FlowState}) => state;

export const selectAvailabilities = createSelector(
    selectSelf,
    ({flow}) => flow.availability.entities
);

export const selectAvailabilitiesLoading = createSelector(
    selectSelf,
    ({flow}) => flow.availability.loading
);
