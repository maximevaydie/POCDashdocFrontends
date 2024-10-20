import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {createAction, createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {FlowState, refreshFlow} from "redux/reducers/flow";
import {fetchSlotEvents} from "redux/reducers/flow/slotEvents.slice";
import {actionService} from "redux/services/action.service";
import cloneDeep from "rfdc/default";
import {MutationState, Slot, SlotCustomField} from "types";

export const persistSlots = createAction<Slot[]>("dashdoc/flow/slots/persist");

export const showSlotBooking = createAction("dashdoc/flow/slots/showSlotBooking");
export const showMultiSlotBooking = createAction("dashdoc/flow/slots/showMultiSlotBooking");

export const hideSlotBooking = createAction("dashdoc/flow/slots/hideSlotBooking");
export const hideMultiSlotBooking = createAction("dashdoc/flow/slots/hideMultiSlotBooking");

export const setMultiSlotBookingFeedback = createAction<null | {
    expected: SlotPayload[];
    created: Slot[];
    aborted: SlotPayload[];
}>("dashdoc/flow/slots/setMultiSlotBookingFeedback");

export const updateSingleSlot = createAction<Slot>("dashdoc/flow/slots/updateSingleSlot");
export const createSingleSlot = createAction<Slot>("dashdoc/flow/slots/createSingleSlot");
export const deleteSingleSlot = createAction<number>("dashdoc/flow/slots/deleteSingleSlot");

export type SlotPayload = {
    zone: number;
    start_time: string;
    company: number;
    accept_security_protocol?: boolean;
    references: string[];
    custom_fields: SlotCustomField[];
    note: string | null;
    owner: number;
};
export type IrregularSlotPayload = SlotPayload & {
    end_time: string;
};

export const createSlot = createAsyncThunk(
    "dashdoc/flow/slots/create",
    async (slot: SlotPayload | IrregularSlotPayload, {rejectWithValue}) => {
        try {
            const response: Slot = await apiService.post(`/flow/slots/`, slot, {
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

export const createSlots = createAsyncThunk(
    "dashdoc/flow/slots/create-multi",
    async (slots: SlotPayload[], {rejectWithValue, dispatch}) => {
        let result: {expected: SlotPayload[]; created: Slot[]; aborted: SlotPayload[]} = {
            expected: slots,
            created: [],
            aborted: [],
        };
        try {
            dispatch(setMultiSlotBookingFeedback(result));
            // We simulate a multi-slot creation by creating multiple slots atomically
            for (const slot of slots) {
                result = cloneDeep(result); // The object is locked by redux
                try {
                    const response: Slot = await apiService.post(
                        `/flow/slots/`,
                        {...slot, is_multiple_booking: true},
                        {
                            apiVersion: "web",
                        }
                    );
                    result.created.push(response);
                } catch (e) {
                    result.aborted.push(slot);
                }
                dispatch(setMultiSlotBookingFeedback(result));
            }
            return result;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

type SlotUpdatePayload =
    | Partial<Omit<Slot, "company" | "owner">>
    | (Partial<Omit<Slot, "company" | "owner">> & {
          company: number;
          owner: number;
      });

export const updateSlot = createAsyncThunk(
    "dashdoc/flow/slots/update",
    async (
        {id, payload}: {id: number; payload: SlotUpdatePayload},
        {rejectWithValue, dispatch}
    ) => {
        try {
            const response: Slot = await apiService.patch(`/flow/slots/${id}/`, payload, {
                apiVersion: "web",
            });
            dispatch(fetchSlotEvents({slot: id, force: true}));
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            if (
                "non_field_errors" in errorPayload &&
                errorPayload.non_field_errors.code[0] === "not_within_booking_window"
            ) {
                // if payload.non_field_errors.code[0] === "not_within_booking_window"
                // then slot redux state should be updated to within_booking_window=false
                // A refresh of the flow state will be triggered
                dispatch(refreshFlow());
            }
            return rejectWithValue(errorPayload);
        }
    }
);

export const rescheduleSlot = createAsyncThunk(
    "dashdoc/flow/slots/reschedule",
    async (
        args: {slotId: number; start_time: string; end_time: string},
        {rejectWithValue, dispatch}
    ) => {
        try {
            const {slotId, ...payload} = args;
            const response: Slot = await apiService.post(
                `/flow/slots/${slotId}/reschedule/`,
                {...payload},
                {
                    apiVersion: "web",
                }
            );
            dispatch(fetchSlotEvents({slot: slotId, force: true}));
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

export const deleteSlot = createAsyncThunk("dashdoc/flow/slots/delete", async (id: number) => {
    const response: Slot = await apiService.delete(`/flow/slots/${id}/`, {apiVersion: "web"});
    return response;
});

export const confirmSlotArrival = createAsyncThunk(
    "dashdoc/flow/slots/confirmArrival",
    async ({id, timestamp}: {id: number; timestamp?: string}, {dispatch}) => {
        const response: Slot = await apiService.post(
            `/flow/slots/${id}/confirm-arrival/`,
            timestamp ? {timestamp} : undefined,
            {
                apiVersion: "web",
            }
        );
        dispatch(fetchSlotEvents({slot: id, force: true}));
        return response;
    }
);
export const cancelSlot = createAsyncThunk(
    "dashdoc/flow/slots/cancelSlot",
    async ({id, reason}: {id: number; reason: string}, {rejectWithValue, dispatch}) => {
        try {
            const response: Slot = await apiService.post(
                `/flow/slots/${id}/cancel/`,
                {reason},
                {
                    apiVersion: "web",
                }
            );
            dispatch(fetchSlotEvents({slot: id, force: true}));
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

export const cancelSlotArrival = createAsyncThunk(
    "dashdoc/flow/slots/cancelArrival",
    async (id: number, {dispatch}) => {
        const response: Slot = await apiService.post(
            `/flow/slots/${id}/cancel-arrival/`,
            undefined,
            {
                apiVersion: "web",
            }
        );
        dispatch(fetchSlotEvents({slot: id, force: true}));
        return response;
    }
);

export const confirmSlotHandling = createAsyncThunk(
    "dashdoc/flow/slots/confirmSlotHandling",
    async ({id, timestamp}: {id: number; timestamp?: string}, {dispatch, rejectWithValue}) => {
        try {
            const response: Slot = await apiService.post(
                `/flow/slots/${id}/confirm-handling/`,
                timestamp ? {timestamp} : undefined,
                {
                    apiVersion: "web",
                }
            );
            dispatch(fetchSlotEvents({slot: id, force: true}));
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

export const cancelSlotHandling = createAsyncThunk(
    "dashdoc/flow/slots/cancelSlotHandling",
    async (id: number, {dispatch}) => {
        const response: Slot = await apiService.post(
            `/flow/slots/${id}/cancel-handling/`,
            undefined,
            {
                apiVersion: "web",
            }
        );
        dispatch(fetchSlotEvents({slot: id, force: true}));
        return response;
    }
);

export const completeSlot = createAsyncThunk(
    "dashdoc/flow/slots/complete",
    async ({id, timestamp}: {id: number; timestamp?: string}, {dispatch, rejectWithValue}) => {
        try {
            const response: Slot = await apiService.post(
                `/flow/slots/${id}/complete/`,
                timestamp ? {timestamp} : undefined,
                {
                    apiVersion: "web",
                }
            );
            dispatch(fetchSlotEvents({slot: id, force: true}));
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

export const cancelSlotCompletion = createAsyncThunk(
    "dashdoc/flow/slots/cancelCompletion",
    async (id: number, {dispatch}) => {
        const response: Slot = await apiService.post(
            `/flow/slots/${id}/cancel-completion/`,
            undefined,
            {
                apiVersion: "web",
            }
        );
        dispatch(fetchSlotEvents({slot: id, force: true}));
        return response;
    }
);

export const leaveSlot = createAsyncThunk(
    "dashdoc/flow/slots/leave",
    async (id: number, {dispatch}) => {
        const response: Slot = await apiService.post(`/flow/slots/${id}/leave/`, undefined, {
            apiVersion: "web",
        });
        dispatch(fetchSlotEvents({slot: id, force: true}));
        return response;
    }
);

export const cancelSlotDeparture = createAsyncThunk(
    "dashdoc/flow/slots/cancelDeparture",
    async (id: number, {dispatch}) => {
        const response: Slot = await apiService.post(
            `/flow/slots/${id}/cancel-departure/`,
            undefined,
            {
                apiVersion: "web",
            }
        );
        dispatch(fetchSlotEvents({slot: id, force: true}));
        return response;
    }
);

type SlotExport = {
    file_url: string;
};

type SlotExportPayload = {
    site_id: number;
    export_type: "csv" | "excel";
    period_start: string;
    period_end: string;
};
export const exportSlots = createAsyncThunk(
    "dashdoc/flow/slot-export",
    async (
        {site_id, export_type, period_start, period_end}: SlotExportPayload,
        {rejectWithValue}
    ) => {
        try {
            const response: SlotExport = await apiService.post(
                `/flow/slot-export/`,
                {
                    site_id,
                    export_type,
                    period_start,
                    period_end,
                },
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

export const selectSlot = createAction<number>("dashdoc/flow/slots/select");

export const unselectSlot = createAction("dashdoc/flow/slots/unselect");

export type SlotState = {
    selectedId: number | null;
    entities: {[id: number]: Slot};
    updating: MutationState;
    slotBooking: boolean;
    multiSlotBooking: boolean;
    multiSlotFeedback: null | {expected: SlotPayload[]; created: Slot[]; aborted: SlotPayload[]};
};

const initialState: SlotState = {
    selectedId: null,
    entities: {},
    updating: "idle",
    slotBooking: false,
    multiSlotBooking: false,
    multiSlotFeedback: null,
};

export const slotReducer = createReducer<SlotState>(initialState, (builder) => {
    builder.addCase(persistSlots, (state, action) => {
        action.payload.forEach((slot) => {
            state.entities[slot.id] = slot;
        });
    });

    builder.addCase(selectSlot, (state, action) => {
        state.selectedId = action.payload;
    });
    builder.addCase(unselectSlot, (state) => {
        state.selectedId = null;
    });

    builder.addCase(showSlotBooking, (state) => {
        state.slotBooking = true;
    });

    builder.addCase(hideSlotBooking, (state) => {
        state.slotBooking = false;
    });

    builder.addCase(showMultiSlotBooking, (state) => {
        state.multiSlotBooking = true;
    });

    builder.addCase(hideMultiSlotBooking, (state) => {
        state.multiSlotBooking = false;
    });

    builder.addCase(updateSingleSlot, (state, action) => {
        const slot = action.payload;
        state.entities[slot.id] = slot;
    });
    builder.addCase(createSingleSlot, (state, action) => {
        const slot = action.payload;
        state.entities[slot.id] = slot;
    });
    builder.addCase(deleteSingleSlot, (state, action) => {
        const slotId = action.payload;
        delete state.entities[slotId];
    });

    const asyncThunks = [
        createSlot,
        updateSlot,
        rescheduleSlot,
        deleteSlot,
        confirmSlotArrival,
        cancelSlot,
        cancelSlotArrival,
        confirmSlotHandling,
        cancelSlotHandling,
        completeSlot,
        cancelSlotCompletion,
        leaveSlot,
        cancelSlotDeparture,
    ];

    asyncThunks.forEach((asyncThunk) => {
        builder.addCase(asyncThunk.pending, (state) => {
            state.updating = "pending";
        });
        builder.addCase(asyncThunk.rejected, (state) => {
            state.updating = "failed";
        });
        builder.addCase(asyncThunk.fulfilled, (state, action) => {
            state.updating = "succeeded";
            if (asyncThunk.fulfilled === createSlot.fulfilled) {
                toast.success(t("common.booking.added"));
            }
            if (asyncThunk.fulfilled === deleteSlot.fulfilled) {
                delete state.entities[action.payload.id];
            } else {
                state.entities[action.payload.id] = action.payload;
            }
        });
    });
    builder.addCase(createSlots.pending, (state) => {
        state.updating = "pending";
    });
    builder.addCase(createSlots.rejected, (state) => {
        state.updating = "failed";
    });
    builder.addCase(createSlots.fulfilled, (state, action) => {
        state.updating = "succeeded";
        action.payload.created.forEach((slot) => {
            state.entities[slot.id] = slot;
        });
    });
    builder.addCase(setMultiSlotBookingFeedback, (state, action) => {
        state.multiSlotFeedback = action.payload;
    });
});

const selectSelf = (state: {flow: FlowState}) => state;

export const isUpdating = createSelector(selectSelf, ({flow}) => flow.slot.updating === "pending");

export const slotBookingInProgress = createSelector(selectSelf, ({flow}) => flow.slot.slotBooking);

export const multiSlotBookingInProgress = createSelector(
    selectSelf,
    ({flow}) => flow.slot.multiSlotBooking
);

export const selectSlots = createSelector(selectSelf, ({flow}) =>
    Object.values(flow.slot.entities)
);

export const selectMultiSlotBookingFeedback = createSelector(
    selectSelf,
    ({flow}) => flow.slot.multiSlotFeedback
);
