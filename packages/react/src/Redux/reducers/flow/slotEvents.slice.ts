import {apiService} from "@dashdoc/web-common";
import {createAsyncThunk, createReducer} from "@reduxjs/toolkit";
import {FlowState} from "redux/reducers/flow";
import {SlotEvent} from "types";

type QueryResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: SlotEvent[];
};

type FetchSlotEventPayload = {
    slot: number;
    force?: boolean; // force fetch even if already fetched
};

export const fetchSlotEvents = createAsyncThunk(
    "dashdoc/flow/slot-events/fetch",
    async (payload: FetchSlotEventPayload, {getState}) => {
        const state = getState() as {flow: FlowState};
        if (payload.force || state.flow.slotEvents.entities[payload.slot] === undefined) {
            const params = new URLSearchParams(payload as any).toString();
            const data: QueryResponse = await apiService.get(`/flow/slot-events/?${params}`, {
                apiVersion: "web",
            });
            return data;
        } // else already fetched
        return;
    }
);

export type SlotEventsState = {
    entities: {[slotId: number]: SlotEvent[]};
};

const initialState: SlotEventsState = {
    entities: {},
};

/**
 * Reducer to fetch slot events based on a given slot id.
 */
export const slotEventsReducer = createReducer<SlotEventsState>(initialState, (builder) => {
    builder.addCase(fetchSlotEvents.fulfilled, (state, action) => {
        const slotId = action.meta.arg.slot;
        if (action.payload) {
            state.entities[slotId] = action.payload.results;
        } // else already fetched
    });
});

export const selectSlotEvents = (state: {flow: FlowState}, slotId: number) => {
    const slotEvents = state.flow.slotEvents.entities[slotId];
    return slotEvents ?? null;
};
