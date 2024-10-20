import {createDeepEqualSelector, createSelector} from "@dashdoc/web-common";
import {queryService} from "@dashdoc/web-core";
import {Trailer, Vehicle} from "dashdoc-utils";
import uniq from "lodash.uniq";

import {getCompactActivities} from "app/features/trip/trip.service";
import {CompactTrip} from "app/features/trip/trip.types";
import {Results} from "app/redux/reducers/searches";
import {
    LOGISTIC_POINT_QUERY_NAME,
    PARTNER_QUERY_NAME,
    SCHEDULER_PLANNED_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME,
    SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME,
} from "app/types/constants";

import {
    geRequestedVehiclesList,
    getCreditNotesList,
    getFleetItemsList,
    getLogisticPointList,
    getPartnersList,
    getTagsList,
    RootState,
} from "../reducers";

import {
    getCompaniesList,
    getContactsList,
    getEntities,
    getExportsList,
    getInvoicesList,
    getManagersList,
    getSiteSchedulerSharedActivitiesList,
    getTrailersList,
    getTransportsList,
    getTripsList,
    getTruckersList,
    getUnplannedSegmentsList,
    getVehiclesList,
} from "./entities";

// Selector creators
const makeGetCurrentQuerySelector =
    (entityName: keyof RootState["searches"]) =>
    ({
        searches: {
            [entityName]: {currentQuery},
        },
    }: RootState) =>
        currentQuery;

const makeGetCurrentQueryLoadingStatusSelector =
    (entityName: keyof RootState["searches"]) =>
    ({
        searches: {
            [entityName]: {loading},
        },
    }: RootState) =>
        loading;

const makeGetResultsSelector =
    <ItemType = string>(entityName: keyof RootState["searches"]) =>
    ({
        searches: {
            [entityName]: {results},
        },
    }: RootState) =>
        results as Record<string, Results<ItemType>>;

// Transports selectors
const getTransportsCurrentQuerySelector = makeGetCurrentQuerySelector("transports");
const getTransportsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("transports");
const getTransportsResultsSelector = makeGetResultsSelector("transports");

export const getTransportsCurrentQuery = createDeepEqualSelector(
    getTransportsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getTransportsCurrentQueryLoadingStatus = createSelector(
    getTransportsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getTransportsQueryResultsForCurrentQuery = createSelector(
    getTransportsCurrentQuery,
    getTransportsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getTransportsForCurrentQuery = createSelector(
    getTransportsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                transports: getTransportsList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }

        return {};
    }
);

// Unplanned Segments selectors
const getUnplannedSegmentsCurrentQuerySelector = makeGetCurrentQuerySelector(
    SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME
);
const getUnplannedSegmentsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector(SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME);
const getUnplannedSegmentsResultsSelector = makeGetResultsSelector(
    SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME
);
export const getUnplannedSegmentsCurrentQuery = createDeepEqualSelector(
    getUnplannedSegmentsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getUnplannedSegmentsCurrentQueryLoadingStatus = createSelector(
    getUnplannedSegmentsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getUnplannedSegmentsQueryResultsForCurrentQuery = createSelector(
    getUnplannedSegmentsCurrentQuery,
    getUnplannedSegmentsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getUnplannedSegmentsForCurrentQuery = createSelector(
    getUnplannedSegmentsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                segments: getUnplannedSegmentsList({entities}, uniq(queryResults.items)), // TO FIX synchro issue
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }

        return {};
    }
);

// Unplanned trips selectors
// BASIC TRIPS
const getUnplannedBasicTripsCurrentQuerySelector = makeGetCurrentQuerySelector(
    SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME
);
const getUnplannedBasicTripsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector(SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME);
const getUnplannedBasicTripsResultsSelector = makeGetResultsSelector(
    SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME
);
const getUnplannedBasicTripsCurrentQuery = createDeepEqualSelector(
    getUnplannedBasicTripsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getUnplannedBasicTripsCurrentQueryLoadingStatus = createSelector(
    getUnplannedBasicTripsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
const getUnplannedBasicTripsQueryResultsForCurrentQuery = createSelector(
    getUnplannedBasicTripsCurrentQuery,
    getUnplannedBasicTripsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getUnplannedBasicTripsForCurrentQuery = createSelector(
    getUnplannedBasicTripsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                trips: getTripsList({entities}, uniq(queryResults.items)).map((trip) => {
                    return {
                        ...trip,
                        activities: getCompactActivities(trip.activities),
                    };
                }), // use uniq TO FIX synchro issue
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }

        return {};
    }
);
// PREPARED TRIPS
const getUnplannedPreparedTripsCurrentQuerySelector = makeGetCurrentQuerySelector(
    SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME
);
const getUnplannedPreparedTripsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector(SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME);
const getUnplannedPreparedTripsResultsSelector = makeGetResultsSelector(
    SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME
);
const getUnplannedPreparedTripsCurrentQuery = createDeepEqualSelector(
    getUnplannedPreparedTripsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getUnplannedPreparedTripsCurrentQueryLoadingStatus = createSelector(
    getUnplannedPreparedTripsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
const getUnplannedPreparedTripsQueryResultsForCurrentQuery = createSelector(
    getUnplannedPreparedTripsCurrentQuery,
    getUnplannedPreparedTripsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getUnplannedPreparedTripsForCurrentQuery = createSelector(
    getUnplannedPreparedTripsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                trips: getTripsList({entities}, uniq(queryResults.items)).map((trip) => {
                    return {
                        ...trip,
                        activities: getCompactActivities(trip.activities),
                    };
                }), // use uniq TO FIX synchro issue
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }

        return {};
    }
);

// PLANNED TRIPS
const getPlannedTripsCurrentQuerySelector = makeGetCurrentQuerySelector(
    SCHEDULER_PLANNED_TRIPS_QUERY_NAME
);
const getPlannedTripsCurrentQueryLoadingStatusSelector = makeGetCurrentQueryLoadingStatusSelector(
    SCHEDULER_PLANNED_TRIPS_QUERY_NAME
);
const getPlannedTripsResultsSelector = makeGetResultsSelector(SCHEDULER_PLANNED_TRIPS_QUERY_NAME);
const getPlannedTripsCurrentQuery = createDeepEqualSelector(
    getPlannedTripsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getPlannedTripsCurrentQueryLoadingStatus = createSelector(
    getPlannedTripsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
const getPlannedTripsQueryResultsForCurrentQuery = createSelector(
    getPlannedTripsCurrentQuery,
    getPlannedTripsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);

export const getPlannedTripUids = createSelector(
    getPlannedTripsQueryResultsForCurrentQuery,
    (queryResults) => {
        const result: string[] = queryResults ? uniq(queryResults.items) : [];
        return result;
    }
);

export const getPlannedTripsForCurrentQuery = createSelector(
    getPlannedTripUids,
    getEntities,
    (uids, entities) => {
        return getTripsList({entities}, uids).map((trip) => {
            return {
                ...trip,
                activities: getCompactActivities(trip.activities),
            } as CompactTrip;
        });
    }
);

export const getPlannedTripUidsForSpecificQuery = createSelector(
    (_state, query) => query as {[key: string]: any},
    getPlannedTripsResultsSelector,
    (query: {[key: string]: any}, results: Record<string, Results<string>>) => {
        const queryString = queryService.toQueryString(query);
        const queryResults = results[queryString];
        const result: string[] = queryResults ? uniq(queryResults.items) : [];
        return result;
    }
);
export const getPlannedTripsForSpecificQuery = createSelector(
    getPlannedTripUidsForSpecificQuery,
    getEntities,
    (uids, entities) => {
        return getTripsList({entities}, uids).map((trip) => {
            return {
                ...trip,
                activities: getCompactActivities(trip.activities),
            } as CompactTrip;
        });
    }
);

// Contacts selectors
const getContactsCurrentQuerySelector = makeGetCurrentQuerySelector("contacts-list");
const getContactsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("contacts-list");
const getContactsResultsSelector = makeGetResultsSelector("contacts-list");

export const getContactsCurrentQuery = createDeepEqualSelector(
    getContactsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getContactsCurrentQueryLoadingStatus = createSelector(
    getContactsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getContactsQueryResultsForCurrentQuery = createSelector(
    getContactsCurrentQuery,
    getContactsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getContactsForCurrentQuery = createSelector(
    getContactsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                contacts: getContactsList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Truckers selectors
const getTruckersCurrentQuerySelector = makeGetCurrentQuerySelector("truckers");
const getTruckersCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("truckers");
const getTruckersResultsSelector = makeGetResultsSelector("truckers");

export const getTruckersCurrentQuery = createDeepEqualSelector(
    getTruckersCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getTruckersCurrentQueryLoadingStatus = createSelector(
    getTruckersCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getTruckersQueryResultsForCurrentQuery = createSelector(
    getTruckersCurrentQuery,
    getTruckersResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getTruckersForCurrentQuery = createSelector(
    getTruckersQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                truckers: getTruckersList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Truckers stats selectors
const getTruckerStatsCurrentQuerySelector = makeGetCurrentQuerySelector("trucker-stats");
export const getTruckerStatsCurrentQuery = createDeepEqualSelector(
    getTruckerStatsCurrentQuerySelector,
    (currentQuery) => currentQuery
);

// Managers selectors
const getManagersCurrentQuerySelector = makeGetCurrentQuerySelector("managers");
const getManagersCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("managers");
const getManagersResultsSelector = makeGetResultsSelector("managers");

export const getManagersCurrentQuery = createDeepEqualSelector(
    getManagersCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getManagersCurrentQueryLoadingStatus = createSelector(
    getManagersCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getManagersQueryResultsForCurrentQuery = createSelector(
    getManagersCurrentQuery,
    getManagersResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getManagersForCurrentQuery = createSelector(
    getManagersQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                managers: getManagersList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Logistic points selectors
const getLogisticPointsCurrentQuerySelector = makeGetCurrentQuerySelector(
    LOGISTIC_POINT_QUERY_NAME
);
const getLogisticPointsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector(LOGISTIC_POINT_QUERY_NAME);
const getLogisticPointsResultsSelector = makeGetResultsSelector<number>(LOGISTIC_POINT_QUERY_NAME);

export const getLogisticPointsCurrentQuery = createDeepEqualSelector(
    getLogisticPointsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getLogisticPointsCurrentQueryLoadingStatus = createSelector(
    getLogisticPointsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getLogisticPointsQueryResultsForCurrentQuery = createSelector(
    getLogisticPointsCurrentQuery,
    getLogisticPointsResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getLogisticPointsForCurrentQuery = createSelector(
    getLogisticPointsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                addresses: getLogisticPointList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Partners selectors

const getPartnersCurrentQuerySelector = makeGetCurrentQuerySelector(PARTNER_QUERY_NAME);

const getPartnersCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector(PARTNER_QUERY_NAME);

const getPartnersResultsSelector = makeGetResultsSelector(PARTNER_QUERY_NAME);

export const getPartnersCurrentQuery = createDeepEqualSelector(
    getPartnersCurrentQuerySelector,
    (currentQuery) => currentQuery
);

export const getPartnersCurrentQueryLoadingStatus = createSelector(
    getPartnersCurrentQueryLoadingStatusSelector,
    (loading) => loading
);

// Partners and Companies actually share the same query name
export const getCompaniesCurrentQueryLoadingStatus = getPartnersCurrentQueryLoadingStatus;

export const getPartnersQueryResultsForCurrentQuery = createSelector(
    getPartnersCurrentQuery,
    getPartnersResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);

// Partners and Companies actually share the same query name
export const getCompaniesQueryResultsForCurrentQuery = getPartnersQueryResultsForCurrentQuery;

export const getCompaniesForCurrentQuery = createSelector(
    getCompaniesQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                companies: getCompaniesList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

export const getPartnersForCurrentQuery = createSelector(
    getPartnersQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                partners: getPartnersList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Exports selectors
const getExportsCurrentQuerySelector = makeGetCurrentQuerySelector("exports");
const getExportsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("exports");
const getExportsResultsSelector = makeGetResultsSelector("exports");

export const getExportsCurrentQuery = createDeepEqualSelector(
    getExportsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getExportsCurrentQueryLoadingStatus = createSelector(
    getExportsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getExportsQueryResultsForCurrentQuery = createSelector(
    getExportsCurrentQuery,
    getExportsResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getExportsForCurrentQuery = createSelector(
    getExportsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                exports: getExportsList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Vehicles selectors
const getVehiclesCurrentQuerySelector = makeGetCurrentQuerySelector("vehicles");
const getVehiclesCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("vehicles");
const getVehiclesResultsSelector = makeGetResultsSelector("vehicles");

export const getVehiclesCurrentQuery = createDeepEqualSelector(
    getVehiclesCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getVehiclesCurrentQueryLoadingStatus = createSelector(
    getVehiclesCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getVehiclesQueryResultsForCurrentQuery = createSelector(
    getVehiclesCurrentQuery,
    getVehiclesResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);

export const getVehiclesForCurrentQuery = createSelector(
    getVehiclesQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                vehicles: getVehiclesList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Trailers selectors
const getTrailersCurrentQuerySelector = makeGetCurrentQuerySelector("trailers");
const getTrailersCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("trailers");
const getTrailersResultsSelector = makeGetResultsSelector("trailers");

export const getTrailersCurrentQuery = createDeepEqualSelector(
    getTrailersCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getTrailersCurrentQueryLoadingStatus = createSelector(
    getTrailersCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getTrailersQueryResultsForCurrentQuery = createSelector(
    getTrailersCurrentQuery,
    getTrailersResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getTrailersForCurrentQuery = createSelector(
    getTrailersQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                trailers: getTrailersList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// FleetItems selectors
const getFleetItemsCurrentQuerySelector = makeGetCurrentQuerySelector("fleet-items");
const getFleetItemsCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("fleet-items");
const getFleetItemsResultsSelector = makeGetResultsSelector("fleet-items");

export const getFleetItemsCurrentQuery = createDeepEqualSelector(
    getFleetItemsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getFleetItemsCurrentQueryLoadingStatus = createSelector(
    getFleetItemsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getFleetItemsQueryResultsForCurrentQuery = createSelector(
    getFleetItemsCurrentQuery,
    getFleetItemsResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getFleetItemsForCurrentQuery = createSelector(
    getFleetItemsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                fleetItems: getFleetItemsList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// RequestedVehicle selectors
const getRequestedVehiclesCurrentQuerySelector = makeGetCurrentQuerySelector("requested-vehicles");
const getRequestedVehiclesCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("requested-vehicles");
const getRequestedVehiclesResultsSelector = makeGetResultsSelector("requested-vehicles");

export const getRequestedVehiclesCurrentQuery = createDeepEqualSelector(
    getRequestedVehiclesCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getRequestedVehiclesCurrentQueryLoadingStatus = createSelector(
    getRequestedVehiclesCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getRequestedVehiclesQueryResultsForCurrentQuery = createSelector(
    getRequestedVehiclesCurrentQuery,
    getRequestedVehiclesResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getRequestedVehiclesForCurrentQuery = createSelector(
    getRequestedVehiclesQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                requestedVehicles: geRequestedVehiclesList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Tags selectors
const getTagsCurrentQuerySelector = makeGetCurrentQuerySelector("tags");
const getTagsCurrentQueryLoadingStatusSelector = makeGetCurrentQueryLoadingStatusSelector("tags");
const getTagsResultsSelector = makeGetResultsSelector<number>("tags");

export const getTagsCurrentQuery = createDeepEqualSelector(
    getTagsCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getTagsCurrentQueryLoadingStatus = createSelector(
    getTagsCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getTagsQueryResultsForCurrentQuery = createSelector(
    getTagsCurrentQuery,
    getTagsResultsSelector,
    (currentQuery, results) => results[queryService.toQueryString(currentQuery)]
);
export const getTagsForCurrentQuery = createSelector(
    getTagsQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                tags: getTagsList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                pageCount: queryResults.items?.length,
                totalCount: queryResults.count,
            };
        }
        return {};
    }
);

// Return plates as 'Vehicle[] | Trailer[]'.
export const getPlatesCurrentQuery = (fleetType: "vehicles" | "trailers") => {
    if (fleetType === "vehicles") {
        return getVehiclesCurrentQuery;
    } else {
        return getTrailersCurrentQuery;
    }
};
export const getPlatesCurrentQueryLoadingStatus = (fleetType: "vehicles" | "trailers") => {
    if (fleetType === "vehicles") {
        return getVehiclesCurrentQueryLoadingStatus;
    } else {
        return getTrailersCurrentQueryLoadingStatus;
    }
};
export const getPlatesForCurrentQuery = (fleetType: "vehicles" | "trailers") => {
    if (fleetType === "vehicles") {
        return createSelector(
            getVehiclesQueryResultsForCurrentQuery,
            getEntities,
            (queryResults, entities) => {
                if (queryResults) {
                    return {
                        plates: getVehiclesList({entities}, queryResults.items) as Vehicle[],
                        page: queryResults.page,
                        hasNextPage: queryResults.hasNextPage,
                        pageCount: queryResults.items?.length,
                        totalCount: queryResults.count,
                    };
                }
                return {};
            }
        );
    } else {
        return createSelector(
            getTrailersQueryResultsForCurrentQuery,
            getEntities,
            (queryResults, entities) => {
                if (queryResults) {
                    return {
                        plates: getTrailersList({entities}, queryResults.items) as Trailer[],
                        page: queryResults.page,
                        hasNextPage: queryResults.hasNextPage,
                        pageCount: queryResults.items?.length,
                        totalCount: queryResults.count,
                    };
                }
                return {};
            }
        );
    }
};

// Invoice selectors
const getInvoicesCurrentQuerySelector = makeGetCurrentQuerySelector("invoices");
const getInvoicesCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("invoices");
const getInvoicesResultsSelector = makeGetResultsSelector("invoices");

export const getInvoicesCurrentQuery = createDeepEqualSelector(
    getInvoicesCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getInvoicesCurrentQueryLoadingStatus = createSelector(
    getInvoicesCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getInvoicesQueryResultsForCurrentQuery = createSelector(
    getInvoicesCurrentQuery,
    getInvoicesResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getInvoicesForCurrentQuery = createSelector(
    getInvoicesQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                invoices: getInvoicesList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }

        return {};
    }
);

// Credit Notes selectors
const getCreditNotesCurrentQuerySelector = makeGetCurrentQuerySelector("creditNotes");
const getCreditNotesCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector("creditNotes");
const getCreditNotesResultsSelector = makeGetResultsSelector("creditNotes");

export const getCreditNotesCurrentQuery = createDeepEqualSelector(
    getCreditNotesCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getCreditNotesCurrentQueryLoadingStatus = createSelector(
    getCreditNotesCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getCreditNotesQueryResultsForCurrentQuery = createSelector(
    getCreditNotesCurrentQuery,
    getCreditNotesResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getCreditNotesForCurrentQuery = createSelector(
    getCreditNotesQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                creditNotes: getCreditNotesList({entities}, queryResults.items),
                page: queryResults.page,
                hasNextPage: queryResults.hasNextPage,
                totalCount: queryResults.count,
            };
        }

        return {};
    }
);

// Site scheduler shared activities selectors
const getSiteSchedulerSharedActivitiesCurrentQuerySelector = makeGetCurrentQuerySelector(
    SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME
);
const getSiteSchedulerSharedActivitiesCurrentQueryLoadingStatusSelector =
    makeGetCurrentQueryLoadingStatusSelector(SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME);
const getSiteSchedulerSharedActivitiesResultsSelector = makeGetResultsSelector(
    SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME
);

export const getSiteSchedulerSharedActivitiesCurrentQuery = createDeepEqualSelector(
    getSiteSchedulerSharedActivitiesCurrentQuerySelector,
    (currentQuery) => currentQuery
);
export const getSiteSchedulerSharedActivitiesCurrentQueryLoadingStatus = createSelector(
    getSiteSchedulerSharedActivitiesCurrentQueryLoadingStatusSelector,
    (loading) => loading
);
export const getSiteSchedulerSharedActivitiesQueryResultsForCurrentQuery = createSelector(
    getSiteSchedulerSharedActivitiesCurrentQuery,
    getSiteSchedulerSharedActivitiesResultsSelector,
    (currentQuery, results) => {
        const queryString = queryService.toQueryString(currentQuery);
        return results[queryString];
    }
);
export const getSiteSchedulerSharedActivitiesForCurrentQuery = createSelector(
    getSiteSchedulerSharedActivitiesQueryResultsForCurrentQuery,
    getEntities,
    (queryResults, entities) => {
        if (queryResults) {
            return {
                sharedActivities: getSiteSchedulerSharedActivitiesList(
                    {entities},
                    queryResults.items
                ),
            };
        }

        return {};
    }
);
