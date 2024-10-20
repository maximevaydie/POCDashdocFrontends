import {createAction, createReducer, createSelector} from "@reduxjs/toolkit";
import {Export} from "dashdoc-utils";

import type {CommonRootState} from "../types";

export type ExportEvent = {
    entities: "exports";
    data: {success: true; export: Export; task?: {id: string; status: string}};
};

type BasePusherEvent<Es extends {entities: string}[]> = {
    data: {};
    timestamp: number;
} & Es[number]; // Union of all possible entities

export type PusherEvent = BasePusherEvent<[ExportEvent]>;

export type RealtimeState = {
    export_by_task_id: {[task_id: string]: {export: Export}};
};

const initialState: RealtimeState = {
    export_by_task_id: {},
};

export const addPusherEvent = createAction<PusherEvent>("dashdoc/realtime/addPusherEvent");

export const realtimeReducer = createReducer(initialState, (builder) => {
    builder.addCase(addPusherEvent, (state, action): RealtimeState => {
        if (action.payload.entities === "exports" && action.payload.data.task) {
            state.export_by_task_id[action.payload.data.task.id] = {
                export: action.payload.data.export,
            };
        }
        return state;
    });
});

export const getExportByTaskId = createSelector(
    (
        state: CommonRootState,
        task_id: string
    ): RealtimeState["export_by_task_id"][number] | undefined => {
        return state.realtime.export_by_task_id[task_id];
    },
    (export_data): Export | null => (export_data ? export_data.export : null)
);
