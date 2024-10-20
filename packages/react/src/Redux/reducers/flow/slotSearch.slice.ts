import {apiService} from "@dashdoc/web-common";
import {createAction, createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {FlowState} from "redux/reducers/flow";
import {persistSlots} from "redux/reducers/flow/slot.slice";
import {LoadingState, Slot} from "types";

type QueryResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: Slot[];
};

export type SearchPayload = {
    site: number;
    search: string;
    start: string;
};
// Action Creators
// ---------------

export const fetchSearch = createAsyncThunk(
    "dashdoc/flow/slot/search",
    async (searchPayload: SearchPayload, {dispatch}) => {
        const params = new URLSearchParams(searchPayload as any).toString();
        const data: QueryResponse = await apiService.get(`/flow/slots/?${params}`, {
            apiVersion: "web",
        });

        const slots: Slot[] = [];
        // TODO handle pagination (currently page limit is 100)
        slots.push(...data.results);
        if (slots.length > 0) {
            dispatch(persistSlots(slots));
        }

        return {data, searchPayload};
    }
);

export const clearSearch = createAction("dashdoc/flow/slot/search/clear");

// Reducer
// -------

export type SlotSearchState = {
    entities: {[id: number]: Slot};
    count: number;
    searchPayload: SearchPayload | null;
    loading: LoadingState;
};

const initialState: SlotSearchState = {
    entities: {},
    count: 0,
    searchPayload: null,
    loading: "idle",
};

export const slotSearchReducer = createReducer<SlotSearchState>(initialState, (builder) => {
    builder.addCase(clearSearch, () => {
        return initialState;
    });

    builder.addCase(fetchSearch.pending, (state) => {
        if (state.loading === "idle") {
            state.loading = "pending";
        } else {
            state.loading = "reloading";
        }
    });

    builder.addCase(fetchSearch.rejected, (state) => {
        state.loading = "failed";
    });

    builder.addCase(fetchSearch.fulfilled, (state, action) => {
        state.searchPayload = action.payload.searchPayload;
        state.entities = {};
        state.count = action.payload.data.count;
        const query = action.payload.data;
        query.results.forEach((item) => {
            state.entities[item.id] = item;
        });
        state.loading = "succeeded";
    });
});

const selectSelf = (state: {flow: FlowState}) => state;

export const selectSearchResult = createSelector(selectSelf, ({flow}) => ({
    slots: Object.values(flow.slotSearch.entities),
    count: flow.slotSearch.count,
    loading: flow.slotSearch.loading,
}));
