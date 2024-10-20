import {apiService} from "@dashdoc/web-common";
import {createAction, createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {RootState} from "redux/reducers";
import {FieldError, LoadingState, WasteLoad, WasteShipment} from "types";

export type WasteShipmentErrors = {
    [key: string]: FieldError;
};

export type WasteShipmentsDetailState = {
    entities: {[uid: string]: WasteShipment};
    errors: {[uid: string]: WasteShipmentErrors};
    loading: LoadingState;
};

type WasteShipmentUpdateData = Partial<{
    name: string;
    status: string;
    processor: number;
    producer: number;
    carrier: number;
    organizer: number;
    origin: number;
    destination: number;
    instructions: string;
    transport_date: string | null;
    trucker: number;
    organizer_signatory: number;
    producer_contact: number;
    processor_contact: number;
    processor_signatory: number;
}>;

type WasteShipmentLoadUpdateData = Partial<WasteLoad>;

const initialState: WasteShipmentsDetailState = {
    entities: {},
    errors: {},
    loading: "idle",
};

// Waste shipments actions
export const fetchWasteShipment = createAsyncThunk<WasteShipment, string>(
    "dashdoc/waste/wasteShipments/getByUid",
    async (uid) => {
        const response = await apiService.get(`/waste-shipments/${uid}/`, {apiVersion: "web"});
        return response;
    }
);

export const createWasteShipment = createAsyncThunk<WasteShipment, void>(
    "dashdoc/waste/wasteShipments/create",
    async (_, {getState}) => {
        const state = getState() as RootState;
        const response = await apiService.post(
            `/waste-shipments/`,
            {organizer: state.account.companyId},
            {apiVersion: "web"}
        );
        return response;
    }
);

export const duplicateWasteShipment = createAsyncThunk<WasteShipment, {uid: string}>(
    "dashdoc/waste/wasteShipments/duplicateByUid",
    async ({uid}) => {
        const response = await apiService.post(
            `/waste-shipments/${uid}/duplicate/`,
            {},
            {apiVersion: "web"}
        );
        return response;
    }
);

export const updateWasteShipment = createAsyncThunk<
    WasteShipment,
    {uid: string; data: WasteShipmentUpdateData}
>("dashdoc/waste/wasteShipments/updateByUid", async ({uid, data}, {rejectWithValue}) => {
    try {
        const response = await apiService.patch(`/waste-shipments/${uid}/`, data, {
            apiVersion: "web",
        });
        return response;
    } catch (errorResponse) {
        const body = await errorResponse.json();
        return rejectWithValue(body);
    }
});

// Loads actions
export const createWasteShipmentLoad = createAsyncThunk<
    WasteLoad,
    {wasteShipmentUid: string; data: WasteShipmentLoadUpdateData}
>(
    "dashdoc/waste/wasteShipments/createLoad",
    async ({wasteShipmentUid, data}, {rejectWithValue}) => {
        try {
            const response = await apiService.post(
                `/waste-loads/`,
                {...data, shipment: wasteShipmentUid},
                {apiVersion: "web"}
            );
            return response;
        } catch (errorResponse) {
            const body = await errorResponse.json();
            return rejectWithValue(body);
        }
    }
);

export const updateWasteShipmentLoad = createAsyncThunk<
    WasteLoad,
    {wasteShipmentUid: string; loadUid: string; data: WasteShipmentLoadUpdateData}
>(
    "dashdoc/waste/wasteShipments/updateLoadByUid",
    async ({wasteShipmentUid, loadUid, data}, {rejectWithValue}) => {
        try {
            const response = await apiService.patch(
                `/waste-loads/${loadUid}/`,
                {...data, shipment: wasteShipmentUid},
                {apiVersion: "web"}
            );
            return response;
        } catch (errorResponse) {
            const body = await errorResponse.json();
            return rejectWithValue(body);
        }
    }
);

export const deleteWasteShipmentLoad = createAsyncThunk<
    void,
    {wasteShipmentUid: string; loadUid: string}
>("dashdoc/waste/wasteShipments/deleteLoadByUid", async ({loadUid}) => {
    await apiService.delete(`/waste-loads/${loadUid}/`, {apiVersion: "web"});
});

// Status change actions
export const signWasteShipmentsAsOrganizer = createAsyncThunk<WasteShipment, {uids: string[]}>(
    "dashdoc/waste/wasteShipments/signAsOrganizer",
    async ({uids}, {rejectWithValue}) => {
        try {
            const response = await apiService.post(
                `/waste-shipments/sign-as-organizer/`,
                {uids},
                {apiVersion: "web"}
            );
            return response;
        } catch (errorResponse) {
            const body = await errorResponse.json();
            return rejectWithValue(body);
        }
    }
);

export const cancelWasteShipment = createAsyncThunk<void, {uid: string}>(
    "dashdoc/waste/wasteShipments/cancelByUid",
    async ({uid}) => {
        const response = await apiService.post(
            `/waste-shipments/${uid}/cancel/`,
            {},
            {apiVersion: "web"}
        );
        return response;
    }
);

export const discontinueWasteShipment = createAsyncThunk<
    void,
    {uid: string; discontinued_reason: string}
>("dashdoc/waste/wasteShipments/discontinueByUid", async ({uid, discontinued_reason}) => {
    const response = await apiService.post(
        `/waste-shipments/${uid}/discontinue/`,
        {discontinued_reason},
        {apiVersion: "web"}
    );
    return response;
});

// Transport creation
export const createTransportFromWasteShipment = createAsyncThunk<
    {transport_uid: string; transport_id: number},
    {uid: string}
>("dashdoc/waste/wasteShipments/createTransportByUid", async ({uid}) => {
    const response = await apiService.post(
        `/waste-shipments/${uid}/create-transport/`,
        {},
        {apiVersion: "web"}
    );
    return response;
});

// Realtime
export const updateWasteShipmentPdfFromRealtime = createAction<{
    uid: string;
    pdf_url: string;
    pdf_updated_date: string;
}>("dashdoc/waste/wasteShipments/updatePdfFromRealtime");

// Reducers
function removeError(state: WasteShipmentsDetailState, wasteShipmentUid: string, field: string) {
    if (typeof state.errors[wasteShipmentUid] === "object") {
        delete state.errors[wasteShipmentUid][field];
    }
}

export const wasteShipmentsDetailReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(fetchWasteShipment.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(fetchWasteShipment.fulfilled, (state, action) => {
            state.entities[action.meta.arg] = action.payload;
            state.loading = "succeeded";
        })
        .addCase(fetchWasteShipment.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(createWasteShipment.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(createWasteShipment.fulfilled, (state, action) => {
            state.entities[action.payload.uid] = action.payload;
            state.loading = "succeeded";
        })
        .addCase(createWasteShipment.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(duplicateWasteShipment.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(duplicateWasteShipment.fulfilled, (state, action) => {
            state.entities[action.payload.uid] = action.payload;
            state.loading = "succeeded";
        })
        .addCase(duplicateWasteShipment.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(updateWasteShipment.pending, (state, action) => {
            state.loading = "pending";
            for (const field of Object.keys(action.meta.arg.data)) {
                removeError(state, action.meta.arg.uid, field);
            }
        })
        .addCase(updateWasteShipment.fulfilled, (state, action) => {
            state.entities[action.meta.arg.uid] = action.payload;
            state.loading = "succeeded";
        })
        .addCase(updateWasteShipment.rejected, (state, action) => {
            state.loading = "failed";
            state.errors[action.meta.arg.uid] = action.payload as WasteShipmentErrors;
        })
        .addCase(createWasteShipmentLoad.pending, (state, action) => {
            state.loading = "pending";
            removeError(state, action.meta.arg.wasteShipmentUid, "loads");
        })
        .addCase(createWasteShipmentLoad.fulfilled, (state, action) => {
            const originalLoads = state.entities[action.meta.arg.wasteShipmentUid].loads;
            state.entities[action.meta.arg.wasteShipmentUid].loads = [
                ...originalLoads,
                action.payload,
            ];
            state.loading = "succeeded";
        })
        .addCase(createWasteShipmentLoad.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(updateWasteShipmentLoad.pending, (state, action) => {
            state.loading = "pending";
            removeError(state, action.meta.arg.wasteShipmentUid, "loads");
        })
        .addCase(updateWasteShipmentLoad.fulfilled, (state, action) => {
            const originalLoads = state.entities[action.meta.arg.wasteShipmentUid].loads;
            state.entities[action.meta.arg.wasteShipmentUid].loads = originalLoads.map((load) =>
                load.uid === action.meta.arg.loadUid ? action.payload : load
            );
            state.loading = "succeeded";
        })
        .addCase(updateWasteShipmentLoad.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(deleteWasteShipmentLoad.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(deleteWasteShipmentLoad.fulfilled, (state, action) => {
            const originalLoads = state.entities[action.meta.arg.wasteShipmentUid].loads;
            state.entities[action.meta.arg.wasteShipmentUid].loads = originalLoads.filter(
                (load) => load.uid !== action.meta.arg.loadUid
            );
            state.loading = "succeeded";
        })
        .addCase(deleteWasteShipmentLoad.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(signWasteShipmentsAsOrganizer.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(signWasteShipmentsAsOrganizer.fulfilled, (state, action) => {
            for (const uid of action.meta.arg.uids) {
                state.entities[uid].status = "signed";
                state.errors[uid] = {};
            }
            state.loading = "succeeded";
        })
        .addCase(signWasteShipmentsAsOrganizer.rejected, (state, action) => {
            state.loading = "failed";
            for (const uid of action.meta.arg.uids) {
                state.errors[uid] = action.payload as WasteShipmentErrors;
            }
        })
        .addCase(cancelWasteShipment.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(cancelWasteShipment.fulfilled, (state, action) => {
            state.entities[action.meta.arg.uid].status = "cancelled";
            state.loading = "succeeded";
        })
        .addCase(cancelWasteShipment.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(discontinueWasteShipment.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(discontinueWasteShipment.fulfilled, (state, action) => {
            state.entities[action.meta.arg.uid].status = "discontinued";
            state.entities[action.meta.arg.uid].discontinued_reason =
                action.meta.arg.discontinued_reason;
            state.loading = "succeeded";
        })
        .addCase(discontinueWasteShipment.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(createTransportFromWasteShipment.pending, (state) => {
            state.loading = "pending";
        })
        .addCase(createTransportFromWasteShipment.fulfilled, (state, action) => {
            state.entities[action.meta.arg.uid].transport_id = action.payload.transport_id;
            state.entities[action.meta.arg.uid].transport_uid = action.payload.transport_uid;
            state.loading = "succeeded";
        })
        .addCase(createTransportFromWasteShipment.rejected, (state) => {
            state.loading = "failed";
        })
        .addCase(updateWasteShipmentPdfFromRealtime, (state, action) => {
            state.entities[action.payload.uid] = {
                ...state.entities[action.payload.uid],
                ...action.payload,
            };
        });
});

// Selectors
export const selectWasteShipment = createSelector(
    (state: RootState) => state.waste.wasteShipmentsDetail,
    (_: any, uid: string) => uid,
    (wasteShipmentsDetail, uid) => wasteShipmentsDetail.entities[uid] ?? null
);

export const selectWasteShipmentLoading = createSelector(
    (state: RootState) => state.waste.wasteShipmentsDetail,
    (wasteShipmentsDetail) => wasteShipmentsDetail.loading // global loading for now
);

export const selectWasteShipmentErrors = createSelector(
    (state: RootState) => state.waste.wasteShipmentsDetail,
    (_: any, uid: string) => uid,
    (wasteShipmentsDetail, uid) => wasteShipmentsDetail.errors[uid] ?? {}
);
