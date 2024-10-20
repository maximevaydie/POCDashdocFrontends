import {apiService} from "@dashdoc/web-common";
import {
    PayloadAction,
    createAsyncThunk,
    createReducer,
    createAction,
    createSelector,
} from "@reduxjs/toolkit";
import {stringifyQueryObject} from "dashdoc-utils";
import {CleanedWasteShipmentsQuery} from "features/filters/list.service";
import {RootState} from "redux/reducers";
import {LoadingState, WasteShipment} from "types";

export type WasteShipmentsListState = {
    entities: {[uid: string]: WasteShipment};
    results?: {
        items: string[];
        hasNextPage: boolean;
        count: number;
    };
    currentQuery: CleanedWasteShipmentsQuery;
    page: number;
    loading: LoadingState;
};

const initialState: WasteShipmentsListState = {
    entities: {},
    results: undefined,
    currentQuery: {},
    page: 1,
    loading: "idle",
};

type WasteShipmentsListResponse = {
    response: {
        results: WasteShipment[];
        next: string | null;
        count: number;
    };
    query: CleanedWasteShipmentsQuery;
    page: number;
} | null;

export const resetSearch = createAction("dashdoc/waste/wasteShipments/search/clear");

export const fetchWasteShipmentsList = createAsyncThunk<
    WasteShipmentsListResponse,
    {query: CleanedWasteShipmentsQuery; page: number}
>("dashdoc/waste/wasteShipments/list", async ({query, page}, {getState, dispatch}) => {
    const state = (getState() as RootState).waste.wasteShipmentsList;

    const previousQuery = state.currentQuery;
    if (JSON.stringify(previousQuery) !== JSON.stringify(query)) {
        dispatch(resetSearch());
        page = 1;
    } else if (page < state.page) {
        // we should not fetch the same page again
        return null;
    } else if (page === state.page && state.loading === "pending") {
        // this page is already being fetched
        return null;
    }

    const queryString = stringifyQueryObject(query, {
        skipEmptyString: true,
        skipNull: true,
        arrayFormat: "comma",
    });
    const response = await apiService.get(`/waste-shipments/?${queryString}&page=${page}`, {
        apiVersion: "web",
    });
    return {
        response: response,
        query: query,
        page: page,
    };
});

function handleWasteShipmentsList(
    state: WasteShipmentsListState,
    action: PayloadAction<WasteShipmentsListResponse>
) {
    if (action.payload === null) {
        return;
    }

    action.payload.response.results.forEach((shipment) => {
        state.entities[shipment.uid] = shipment;
    });

    state.currentQuery = action.payload.query;
    state.results = {
        hasNextPage: action.payload.response.next !== null,
        items: [
            ...(action.payload.page > 1 && state.results ? state.results.items : []),
            ...action.payload.response.results.map((object) => object.uid),
        ],
        count: action.payload.response.count,
    };

    state.loading = "succeeded";
    state.page = action.payload.page;
}

export const wasteShipmentsListReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(fetchWasteShipmentsList.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(fetchWasteShipmentsList.fulfilled, (state, action) => {
            handleWasteShipmentsList(state, action);
        })
        .addCase(fetchWasteShipmentsList.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(resetSearch, () => {
            return {
                ...initialState,
                loading: "pending",
            };
        });
});

export const selectWasteShipmentsList = createSelector(
    (state: RootState) => state.waste.wasteShipmentsList,
    (state) => (state.results ? state.results.items.map((uid) => state.entities[uid]) : [])
);

export const selectWasteShipmentsListStatus = createSelector(
    (state: RootState) => state.waste.wasteShipmentsList,
    (state) => {
        return {
            loading: state.loading,
            page: state.page,
            hasNextPage: state.results?.hasNextPage ?? false,
        };
    }
);
