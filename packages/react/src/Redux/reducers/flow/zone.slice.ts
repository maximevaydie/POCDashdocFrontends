import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {RootState} from "redux/reducers";
import {Silently, FlowState, selectProfile} from "redux/reducers/flow";
import {actionService} from "redux/services/action.service";
import {LoadingState, Zone} from "types";

// Action Creators
// ---------------
type FetchZonesPayload = {
    siteId: number;
} & Silently;

export const fetchZones = createAsyncThunk(
    "dashdoc/flow/zone/fetch",
    async ({siteId}: FetchZonesPayload) => {
        const response = await apiService.get(`/flow/zones/?site=${siteId}`, {
            apiVersion: "web",
        });
        return response;
    }
);

type CreateZonePayload = Omit<Zone, "id">;

export const createZone = createAsyncThunk(
    "dashdoc/flow/zone/create",
    async ({zone}: {zone: CreateZonePayload}, {rejectWithValue}) => {
        try {
            const response: Zone = await apiService.post(`/flow/zones/`, zone, {
                apiVersion: "web",
            });
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

type UpdateZonePayload = Partial<Omit<Zone, "opening_hours">>;

export const updateZone = createAsyncThunk(
    "dashdoc/flow/zone/update",
    async ({zone}: {zone: UpdateZonePayload}, {rejectWithValue}) => {
        try {
            const response: Zone = await apiService.patch(`/flow/zones/${zone.id}/`, zone, {
                apiVersion: "web",
            });
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

type UpdateOpeningHoursPayload = Zone["opening_hours"];

export const updateZoneOpeningHours = createAsyncThunk(
    "dashdoc/flow/zone/updateOpeningHours",
    async (
        {id, openingHours}: {id: number; openingHours: UpdateOpeningHoursPayload},
        {rejectWithValue}
    ) => {
        try {
            const response: Zone = await apiService.post(
                `/flow/zones/${id}/update-opening-hours/`,
                {opening_hours: openingHours},
                {apiVersion: "web"}
            );
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

// Reducer
// -------

export type ZoneState = {
    entities: {[id: number]: Zone};
    loading: LoadingState;
};

const initialState: ZoneState = {
    entities: {},
    loading: "idle",
};

export const zoneReducer = createReducer<ZoneState>(initialState, (builder) => {
    builder.addCase(fetchZones.pending, (state, action) => {
        if (!action.meta.arg.silently) {
            if (state.loading === "idle") {
                state.loading = "pending";
            } else {
                state.loading = "reloading";
            }
        }
    });
    builder.addCase(fetchZones.rejected, (state) => {
        state.loading = "failed";
    });
    builder.addCase(fetchZones.fulfilled, (state, action) => {
        action.payload.forEach((zone: Zone) => {
            state.entities[zone.id] = zone;
        });
        state.loading = "succeeded";
    });

    builder.addCase(createZone.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
    });
    builder.addCase(updateZone.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
    });
    builder.addCase(updateZoneOpeningHours.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload;
    });
});

export const selectZones = createSelector(
    (state: RootState) => state.flow.zone.entities,
    (state: RootState) => selectProfile(state),
    (entities, profile) => {
        const zones = Object.values(entities);
        if (profile === "siteManager") {
            return zones;
        }
        // keep only delegable zones ! Others don't need to be displayed
        return zones.filter((zone) => zone.delegable);
    }
);

export const selectZoneById = createSelector(
    // First input selector: get zones
    (state: {flow: FlowState}) => state.flow.zone.entities,
    // Second input selector: pass siteId through
    (_: any, zoneId: number) => zoneId,
    // Result function: the expected zone or null
    (entities, zoneId: number) => {
        let result: Zone | null = null;
        if (entities[zoneId]) {
            result = entities[zoneId];
        }
        return result;
    }
);
