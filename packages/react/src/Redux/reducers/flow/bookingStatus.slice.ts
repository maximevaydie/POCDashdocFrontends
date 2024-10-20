import {apiService, createDeepEqualSelector} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {RootState} from "redux/reducers";
import {Silently} from "redux/reducers/flow";
import {RequestFilters} from "redux/reducers/flow/filter.slice";
import {
    createSingleSlot,
    deleteSingleSlot,
    persistSlots,
    updateSingleSlot,
} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {AvailabilityStatus, BookingStatus, LoadingState, Slot, Unavailability, Zone} from "types";

// Action Creators
// ---------------
export const fetchBookingStatus = createAsyncThunk(
    "dashdoc/flow/booking-status/fetch",
    async (filters: RequestFilters & Silently, {dispatch}) => {
        const params = new URLSearchParams(filters as any).toString();
        const result: (BookingStatus & Zone)[] = await apiService.get(
            `/flow/booking-status/?${params}`,
            {
                apiVersion: "web",
            }
        );

        const slots: Slot[] = [];
        const data: BookingStatus[] = [];

        result.forEach((item) => {
            const {availability_status, unavailabilities, scheduled_slots, ...zone} = item;
            slots.push(...scheduled_slots);

            const bookingStatus: BookingStatus = {
                id: zone.id,
                availability_status,
                scheduled_slots,
                unavailabilities,
            };
            data.push(bookingStatus);
        });
        dispatch(persistSlots(slots));

        return {data};
    }
);

export type UpdateUnavailabilitiesPayload = {
    zone: number;
    start: string; // Start time to create/replace unavailabilities
    end: string; //  End time to create/replace unavailabilities
    /**
     * Delete all unavailabilities -> ```[]```
     * Partially unavailable -> ```[{start_time: "2023-11-08T23:00:00Z", end_time: "2023-11-09T00:00:00Z", slot_count: 1}]```
     * Totally unavailable -> ```[{start_time:start, end_time:end, slot_count:zone.concurrent_slots}]```
     */
    unavailabilities: Pick<Unavailability, "start_time" | "end_time" | "slot_count">[];
};

type UpdateUnavailabilitiesSuccessPayload = {
    unavailabilities: Unavailability[];
    availability_status: AvailabilityStatus[];
};

export const updateUnavailabilities = createAsyncThunk(
    "dashdoc/flow/unavailabilities/update",
    async (payload: UpdateUnavailabilitiesPayload, {rejectWithValue}) => {
        try {
            const response: UpdateUnavailabilitiesSuccessPayload = await apiService.post(
                `/flow/unavailabilities/`,
                payload,
                {
                    apiVersion: "web",
                }
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
export type BookingStatusState = {
    entities: {[id: number]: BookingStatus};
    loading: LoadingState;
};

function getInitialState(): BookingStatusState {
    return {
        entities: {},
        loading: "idle",
    };
}

export const bookingStatusReducer = createReducer<BookingStatusState>(
    getInitialState(),
    (builder) => {
        builder.addCase(fetchBookingStatus.pending, (state, action) => {
            if (!action.meta.arg.silently) {
                if (state.loading === "idle") {
                    state.loading = "pending";
                } else {
                    state.loading = "reloading";
                }
            }
        });
        builder.addCase(fetchBookingStatus.rejected, (state) => {
            state.loading = "failed";
        });
        builder.addCase(fetchBookingStatus.fulfilled, (state, action) => {
            action.payload.data.forEach((bookingStatus) => {
                state.entities[bookingStatus.id] = bookingStatus;
            });
            state.loading = "succeeded";
        });
        builder.addCase(updateUnavailabilities.fulfilled, (state, action) => {
            const zoneId = action.meta.arg.zone;
            state.entities[zoneId].unavailabilities = action.payload.unavailabilities;
            state.entities[zoneId].availability_status = action.payload.availability_status;
        });
        builder.addCase(updateSingleSlot, (state, action) => {
            const slot = action.payload;
            if (state.entities[slot.zone]) {
                const scheduledSlots = [] as Slot[];
                let found = false;
                state.entities[slot.zone].scheduled_slots.forEach((s) => {
                    if (s.id == slot.id) {
                        scheduledSlots.push(slot);
                        found = true;
                    } else {
                        scheduledSlots.push(s);
                    }
                });
                state.entities[slot.zone].scheduled_slots = scheduledSlots;
                if (!found) {
                    state.entities[slot.zone].scheduled_slots.push(slot);
                }
            }
        });
        builder.addCase(createSingleSlot, (state, action) => {
            const slot = action.payload;
            if (state.entities[slot.zone]) {
                state.entities[slot.zone].scheduled_slots.push(slot);
            }
        });
        builder.addCase(deleteSingleSlot, (state, action) => {
            const slotId = action.payload;
            let zoneId = null;
            for (let bs of Object.values(state.entities)) {
                if (bs.scheduled_slots.find((s) => s.id === slotId)) {
                    zoneId = bs.id;
                    break;
                }
            }
            if (zoneId) {
                state.entities[zoneId].scheduled_slots = state.entities[
                    zoneId
                ].scheduled_slots.filter((s) => s.id !== slotId);
            }
        });
    }
);

export const selectBookingStatus = createSelector(
    (state: RootState) => state.flow.bookingStatus.entities,
    (entities) => Object.values(entities)
);

export const selectBookingStatusByZoneId = createDeepEqualSelector(
    selectBookingStatus,
    // Second input selector: pass siteId through
    (_: any, zoneId: number) => zoneId,
    // Result function: the expected zone or null
    (bookingStatus, zoneId: number) => {
        const status = bookingStatus.find((status) => zoneId === status.id);
        if (!status) {
            // In any case, we should never have a zone without a BookingStatus
            return {
                id: zoneId,
                availability_status: [],
                unavailabilities: [],
                scheduled_slots: [],
            };
        }
        return status;
    }
);
