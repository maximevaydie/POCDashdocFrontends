import {storeService} from "@dashdoc/web-common";
import {createAsyncThunk, createReducer} from "@reduxjs/toolkit";

import {fetchGetAbsenceManagerConnectors} from "app/services/misc/absence-manager.service";

import {RootState} from ".";

export const fetchRequestAbsenceManagerConnector = createAsyncThunk(
    "REQUEST_ABSENCE_MANAGER",
    async () => {
        const response = await fetchGetAbsenceManagerConnectors();
        return response;
    }
);

export function loadRequestAbsenceManagerConnector() {
    if (storeService.getState<RootState>().connectors.absenceManagerConnectorLoading) {
        return () => {
            // nothing to do, loading already in progress
        };
    }
    if (storeService.getState<RootState>().connectors.absenceManagerConnectorLoaded) {
        return () => {
            // nothing to do, already loaded
        };
    }
    return fetchRequestAbsenceManagerConnector();
}

export type Connectors = {
    absenceManagerConnector: {data_source: string} | null;
    absenceManagerConnectorLoading: boolean;
    absenceManagerConnectorLoaded: boolean;
};

const initialState: Connectors = {
    absenceManagerConnector: null,
    absenceManagerConnectorLoading: false,
    absenceManagerConnectorLoaded: false,
};

export const connectorsReducer = createReducer<Connectors>(initialState, (builder) => {
    builder.addCase(fetchRequestAbsenceManagerConnector.pending, (state) => {
        state.absenceManagerConnectorLoading = true;
    });

    builder.addCase(fetchRequestAbsenceManagerConnector.fulfilled, (state, action) => {
        state.absenceManagerConnectorLoading = false;
        state.absenceManagerConnectorLoaded = true;
        state.absenceManagerConnector = {data_source: action.payload[0].data_source};
    });

    builder.addCase(fetchRequestAbsenceManagerConnector.rejected, (state) => {
        state.absenceManagerConnectorLoading = false;
        state.absenceManagerConnectorLoaded = true;
    });
});
