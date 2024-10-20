import {createSelector} from "@dashdoc/web-common";
import intersection from "lodash.intersection";

import {RootState} from "../reducers";

import {
    getFleetItemsQueryResultsForCurrentQuery,
    getLogisticPointsQueryResultsForCurrentQuery,
    getPartnersQueryResultsForCurrentQuery,
    getCompaniesQueryResultsForCurrentQuery,
    getRequestedVehiclesQueryResultsForCurrentQuery,
    getTagsQueryResultsForCurrentQuery,
    getTrailersQueryResultsForCurrentQuery,
    getTransportsQueryResultsForCurrentQuery,
    getTruckersQueryResultsForCurrentQuery,
    getVehiclesQueryResultsForCurrentQuery,
} from "./searches";

// Selector creators
const makeGetSelectionSelector =
    (entityName: keyof RootState["selections"]) =>
    ({selections: {[entityName]: selection}}: RootState) =>
        selection;

// Transports
const getTransportsSelectionSelector = makeGetSelectionSelector("transports");

export const getTransportsSelectionForCurrentQuery = createSelector(
    getTransportsSelectionSelector,
    getTransportsQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// Addresses
const getAddressesSelectionSelector = makeGetSelectionSelector("addresses");

export const getLogisticPointsSelectionForCurrentQuery = createSelector(
    getAddressesSelectionSelector,
    getLogisticPointsQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// Companies
const getCompaniesSelectionSelector = makeGetSelectionSelector("companies");

export const getCompaniesSelectionForCurrentQuery = createSelector(
    getCompaniesSelectionSelector,
    getCompaniesQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// Partners
const getPartnersSelectionSelector = makeGetSelectionSelector("partnersList");

export const getPartnersSelectionForCurrentQuery = createSelector(
    getPartnersSelectionSelector,
    getPartnersQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// Truckers
const getTruckersSelectionSelector = makeGetSelectionSelector("truckers");

export const getTruckersSelectionForCurrentQuery = createSelector(
    getTruckersSelectionSelector,
    getTruckersQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// Vehicle
const getVehiclesSelectionSelector = makeGetSelectionSelector("vehicles");

export const getVehiclesSelectionForCurrentQuery = createSelector(
    getVehiclesSelectionSelector,
    getVehiclesQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// Trailers
const getTrailersSelectionSelector = makeGetSelectionSelector("trailers");

export const getTrailersSelectionForCurrentQuery = createSelector(
    getTrailersSelectionSelector,
    getTrailersQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }

        return [];
    }
);

// FleetItems
const getFleetItemsSelectionSelector = makeGetSelectionSelector("fleet-items");

export const getFleetItemsSelectionForCurrentQuery = createSelector(
    getFleetItemsSelectionSelector,
    getFleetItemsQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }
        return [];
    }
);

// RequestedVehicles
const getRequestedVehiclesSelectionSelector = makeGetSelectionSelector("requested-vehicles");

export const getRequestedVehiclesSelectionForCurrentQuery = createSelector(
    getRequestedVehiclesSelectionSelector,
    getRequestedVehiclesQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }
        return [];
    }
);

// Tags
const getTagsSelectionSelector = makeGetSelectionSelector("tags");

export const getTagsSelectionForCurrentQuery = createSelector(
    getTagsSelectionSelector,
    getTagsQueryResultsForCurrentQuery,
    (selection, queryResults) => {
        if (queryResults) {
            return intersection(selection, queryResults.items);
        }
        return [];
    }
);
