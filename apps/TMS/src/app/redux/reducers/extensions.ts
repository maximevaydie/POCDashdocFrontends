import {ApiModels, webApi} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {toast} from "react-toastify";

import {RootState} from "app/redux/reducers";

// Action Creators
// ---------------

export const fetchTriggerTripSendToNetwork = createAsyncThunk(
    "dashdoc/extensions/triggerTripSendToNetwork",
    async ({
        extension,
        tripUid,
        parameters,
    }: {
        extension: ApiModels.Extensions.ShortExtension;
        tripUid: string;
        parameters: ApiModels.Extensions.TripSendToNetworkTriggerRequest["parameters"];
    }): Promise<void> => {
        try {
            await webApi.fetchTriggerTripSendToNetwork(
                {
                    uid: extension.uid,
                },
                {
                    trip_uid: tripUid,
                    parameters,
                }
            );
        } catch (error) {
            Logger.error(error);
            const text = await error.json();
            toast.error(t("common.error") + ": " + text.non_field_errors.detail[0]);
            throw error;
        }
    }
);

// Reducer
// -------

export type ExtensionsState = {
    trip_send_to_network_button: {
        trips_in_progress: Record<string, ApiModels.Extensions.ShortExtension>;
    };
};

const initialState: ExtensionsState = {
    trip_send_to_network_button: {
        trips_in_progress: {},
    },
};

export const extensionsReducer = createReducer<ExtensionsState>(initialState, (builder) => {
    builder.addCase(fetchTriggerTripSendToNetwork.pending, (state, action) => {
        state.trip_send_to_network_button.trips_in_progress[action.meta.arg.tripUid] =
            action.meta.arg.extension;
    });
    builder.addCase(fetchTriggerTripSendToNetwork.fulfilled, (state, action) => {
        delete state.trip_send_to_network_button.trips_in_progress[action.meta.arg.tripUid];
    });
    builder.addCase(fetchTriggerTripSendToNetwork.rejected, (state, action) => {
        delete state.trip_send_to_network_button.trips_in_progress[action.meta.arg.tripUid];
    });
});

// Selectors
// ---------

export const selectExtensionsState = (state: RootState) => state.extensions;

export const selectTripsSentToNetworkInProgress = createSelector(
    selectExtensionsState,
    (state) => state.trip_send_to_network_button.trips_in_progress
);

export const selectExtensionTripIsSentToNetworkInProgress = createSelector(
    [selectTripsSentToNetworkInProgress, (_state, tripUid: string) => tripUid],
    (tripsInProgress, tripUid) => tripsInProgress[tripUid]
);
