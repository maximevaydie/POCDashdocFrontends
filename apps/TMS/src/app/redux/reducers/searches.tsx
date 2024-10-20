import {queryService} from "@dashdoc/web-core";
import isEqual from "lodash.isequal";
import isNil from "lodash.isnil";
import omitBy from "lodash.omitby";
import remove from "lodash.remove";
import union from "lodash.union";

import {TRANSPORTS_TO_PLAN_TAB} from "app/types/businessStatus";
import {
    CONTACT_QUERY_NAME,
    EXPORT_QUERY_NAME,
    FLEET_ITEMS_QUERY_NAME,
    INVOICE_QUERY_NAME,
    MANAGER_QUERY_NAME,
    SCHEDULER_PLANNED_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME,
    SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME,
    SidebarTabNames,
    SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME,
    SUPPORT_TYPES_QUERY_NAME,
    TAGS_QUERY_NAME,
    TRAILER_QUERY_NAME,
    TRANSPORTS_QUERY_NAME,
    TRUCKERS_QUERY_NAME,
    TRUCKER_STATS_QUERY_NAME,
    VEHICLE_QUERY_NAME,
    REQUESTED_VEHICLE_QUERY_NAME,
    CREDIT_NOTES_QUERY_NAME,
    LOGISTIC_POINT_QUERY_NAME,
    PARTNER_QUERY_NAME,
} from "app/types/constants";

const getInitialSearchQuery = (
    defaultQuery: Record<string, unknown> = {},
    acceptedParams?: string[]
) => {
    let initialQuery = defaultQuery;

    if (window.location.search) {
        initialQuery = queryService.parseQueryString(window.location.search) ?? {};

        // remove unknown params from query
        if (acceptedParams) {
            initialQuery = omitBy(initialQuery, (_, key) => !acceptedParams.includes(key));
        }
    }

    return initialQuery;
};

const transportsAcceptedQueryParams = [
    "tab",
    "archived",
    "pending",
    "declined",
    "ongoing",
    "done",
    "invoiced",
    "paid",
    "deleted",
    "done_date__gte",
    "done_date__lte",
    "page",
    "trucker",
];

export const initialTransportsSearchQuery = getInitialSearchQuery(
    {
        tab: TRANSPORTS_TO_PLAN_TAB,
        archived: false,
    },
    transportsAcceptedQueryParams
);

const addressesAcceptedQueryParams = [
    "tab",
    "query",
    "ordering",
    "page",
    "category",
    "category__in",
    "company__isnull",
];

const initialPartnersSearchQuery = getInitialSearchQuery(
    {query: ""},
    addressesAcceptedQueryParams
);

const initialLogisticPointsSearchQuery = getInitialSearchQuery(
    {tab: SidebarTabNames.LOGISTIC_POINTS, query: ""},
    addressesAcceptedQueryParams
);

const truckersAcceptedQueryParams = ["ordering", "from", "to", "date__gte", "date__lte", "page"];

export const initialTruckerStatsSearchQuery: {
    ordering?: string;
    from?: Date;
    to?: Date;
} = getInitialSearchQuery({}, truckersAcceptedQueryParams);

const managersAcceptedQueryParams = ["text", "ordering", "page"];

export const initialManagerSearchQuery: {
    ordering?: string;
    text?: string;
    page?: number;
} = getInitialSearchQuery({}, managersAcceptedQueryParams);

export interface SearchQuery {
    [key: string]: any;
}

export interface Results<T> {
    items: T[];
    page: number;
    hasNextPage: boolean;
    count: number;
}

type Model =
    | "transports"
    | "truckers"
    | "addresses"
    | "companies"
    | "trucker-stats"
    | "scheduler"
    | "scheduler-trip"
    | "site-scheduler-shared-activities"
    | "contacts"
    | "support-types"
    | "managers"
    | "exports"
    | "vehicles"
    | "trailers"
    | "requested-vehicles"
    | "fleet-items";

interface SearchState<TM = Model, ItemType = string> {
    model: TM;
    results: {[queryString: string]: Results<ItemType>};
    currentQuery: SearchQuery;
    loading: boolean;
}

export type SearchesRootState = {
    [TRANSPORTS_QUERY_NAME]: SearchState<"transports">;
    [TRUCKERS_QUERY_NAME]: SearchState<"truckers">;
    [PARTNER_QUERY_NAME]: SearchState<"companies">;
    [LOGISTIC_POINT_QUERY_NAME]: SearchState<"addresses">;
    [TRUCKER_STATS_QUERY_NAME]: SearchState<"trucker-stats">;
    [SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME]: SearchState<"scheduler">;
    [SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME]: SearchState<"scheduler-trip">;
    [SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME]: SearchState<"scheduler-trip">;
    [SCHEDULER_PLANNED_TRIPS_QUERY_NAME]: SearchState<"scheduler-trip">;
    [SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME]: SearchState<"site-scheduler-shared-activities">;
    [CONTACT_QUERY_NAME]: SearchState<"contacts">;
    [SUPPORT_TYPES_QUERY_NAME]: SearchState<"support-types">;
    [MANAGER_QUERY_NAME]: SearchState<"managers">;
    [EXPORT_QUERY_NAME]: SearchState<"exports">;
    [VEHICLE_QUERY_NAME]: SearchState<"vehicles">;
    [TRAILER_QUERY_NAME]: SearchState<"trailers">;
    [REQUESTED_VEHICLE_QUERY_NAME]: SearchState<"requested-vehicles">;
    [INVOICE_QUERY_NAME]: SearchState<"invoices">;
    [CREDIT_NOTES_QUERY_NAME]: SearchState<"creditNotes">;
    [FLEET_ITEMS_QUERY_NAME]: SearchState<"fleet-items">;
    [TAGS_QUERY_NAME]: SearchState<"tags", number>;
};

type QueryName =
    | typeof TRANSPORTS_QUERY_NAME
    | typeof TRUCKERS_QUERY_NAME
    | typeof LOGISTIC_POINT_QUERY_NAME
    | typeof TRUCKER_STATS_QUERY_NAME
    | typeof SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME
    | typeof SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME
    | typeof SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME
    | typeof SCHEDULER_PLANNED_TRIPS_QUERY_NAME
    | typeof SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME
    | typeof CONTACT_QUERY_NAME
    | typeof SUPPORT_TYPES_QUERY_NAME
    | typeof EXPORT_QUERY_NAME
    | typeof VEHICLE_QUERY_NAME
    | typeof TRAILER_QUERY_NAME
    | typeof REQUESTED_VEHICLE_QUERY_NAME;

export interface SearchAction {
    type: string;
    query: SearchQuery;
    queryName: QueryName;
    response: {result: string[]};
    page: number | {fromPage: number; toPage: number};
    hasNextPage: boolean;
    count: number;
    itemIdToRemove?: string;
    itemIdToAdd?: string;
    uids?: string[];
}

const initialTransportsState: SearchState<"transports"> = {
    model: "transports",
    results: {},
    currentQuery: initialTransportsSearchQuery,
    loading: false,
};
const initialTruckersState: SearchState<"truckers"> = {
    model: "truckers",
    results: {},
    currentQuery: initialTruckerStatsSearchQuery,
    loading: false,
};

const initialPartnersState: SearchState<"companies"> = {
    model: "companies",
    results: {},
    currentQuery: initialPartnersSearchQuery,
    loading: false,
};

const initialLogisticPointsState: SearchState<"addresses"> = {
    model: "addresses",
    results: {},
    currentQuery: initialLogisticPointsSearchQuery,
    loading: false,
};

const initialSchedulerState: SearchState<"scheduler"> = {
    model: "scheduler",
    results: {},
    currentQuery: getInitialSearchQuery(),
    loading: false,
};
const initialSchedulerTripState: SearchState<"scheduler-trip"> = {
    model: "scheduler-trip",
    results: {},
    currentQuery: getInitialSearchQuery(),
    loading: false,
};

const initialSiteSchedulerState: SearchState<"site-scheduler-shared-activities"> = {
    model: "site-scheduler-shared-activities",
    results: {},
    currentQuery: getInitialSearchQuery(),
    loading: false,
};

const initialTruckerStatsState: SearchState<"trucker-stats"> = {
    model: "trucker-stats",
    results: {},
    currentQuery: initialTruckerStatsSearchQuery,
    loading: false,
};

const initialContactsState: SearchState<"contacts"> = {
    model: "contacts",
    results: {},
    currentQuery: getInitialSearchQuery(),
    loading: false,
};

const initialSupportTypesState: SearchState<"support-types"> = {
    model: "support-types",
    results: {},
    currentQuery: getInitialSearchQuery(),
    loading: false,
};

const initialManagersState: SearchState<"managers"> = {
    model: "managers",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialExportsState: SearchState<"exports"> = {
    model: "exports",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialVehiclesState: SearchState<"vehicles"> = {
    model: "vehicles",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialTrailersState: SearchState<"trailers"> = {
    model: "trailers",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialInvoicesState: SearchState<"invoices"> = {
    model: "invoices",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialCreditNotesState: SearchState<"creditNotes"> = {
    model: "creditNotes",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialFleetItemsState: SearchState<"fleet-items"> = {
    model: "fleet-items",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialRequestedVehiclesState: SearchState<"requested-vehicles"> = {
    model: "requested-vehicles",
    results: {},
    currentQuery: {},
    loading: false,
};

const initialTagsState: SearchState<"tags", number> = {
    model: "tags",
    results: {},
    currentQuery: {},
    loading: false,
};

export const initialSearches = {
    [TRANSPORTS_QUERY_NAME]: initialTransportsState,
    [TRUCKERS_QUERY_NAME]: initialTruckersState,
    [PARTNER_QUERY_NAME]: initialPartnersState,
    [LOGISTIC_POINT_QUERY_NAME]: initialLogisticPointsState,
    [TRUCKER_STATS_QUERY_NAME]: initialTruckerStatsState,
    [SCHEDULER_UNPLANNED_SEGMENTS_QUERY_NAME]: initialSchedulerState,
    [SCHEDULER_UNPLANNED_BASIC_TRIPS_QUERY_NAME]: initialSchedulerTripState,
    [SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME]: initialSchedulerTripState,
    [SCHEDULER_PLANNED_TRIPS_QUERY_NAME]: initialSchedulerTripState,
    [CONTACT_QUERY_NAME]: initialContactsState,
    [SUPPORT_TYPES_QUERY_NAME]: initialSupportTypesState,
    [MANAGER_QUERY_NAME]: initialManagersState,
    [EXPORT_QUERY_NAME]: initialExportsState,
    [VEHICLE_QUERY_NAME]: initialVehiclesState,
    [TRAILER_QUERY_NAME]: initialTrailersState,
    [INVOICE_QUERY_NAME]: initialInvoicesState,
    [CREDIT_NOTES_QUERY_NAME]: initialCreditNotesState,
    [FLEET_ITEMS_QUERY_NAME]: initialFleetItemsState,
    [REQUESTED_VEHICLE_QUERY_NAME]: initialRequestedVehiclesState,
    [TAGS_QUERY_NAME]: initialTagsState,
    [SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME]: initialSiteSchedulerState,
};

function searchSuccessReducer(state: SearchState, action: SearchAction) {
    const queryString = queryService.toQueryString(action.query),
        resultsState = state.results;
    let newItemsKeys = [...action.response.result];
    if (
        ((typeof action?.page === "number" && action?.page !== 1) ||
            (typeof action?.page === "object" && action.page?.fromPage !== 1)) &&
        !isNil(resultsState[queryString])
    ) {
        newItemsKeys = union(resultsState[queryString].items, newItemsKeys);
    }
    return {
        ...state,
        results: {
            ...resultsState,
            [queryString]: {
                page: typeof action.page === "number" ? action.page : action.page?.toPage,
                hasNextPage: action.hasNextPage ?? undefined,
                items: newItemsKeys,
                count: action.count,
            },
        },
        loading: isEqual(action.query, state.currentQuery) ? false : state.loading,
    };
}
function searchPartialSuccessReducer(
    state: SearchState,
    action: Omit<SearchAction, "page" | "hasNextPage" | "count">
) {
    const queryString = queryService.toQueryString(action.query);
    const resultsState = state.results;
    let newItemsKeys = [...action.response.result];
    if (!isNil(resultsState[queryString])) {
        newItemsKeys = union(resultsState[queryString].items, newItemsKeys);
    }
    return {
        ...state,
        results: {
            ...resultsState,
            [queryString]: {
                ...resultsState[queryString],
                items: newItemsKeys,
            },
        },
        loading: isEqual(action.query, state.currentQuery) ? false : state.loading,
    };
}
function searchByUidsSuccessReducer(
    state: SearchState,
    action: Omit<SearchAction, "page" | "hasNextPage" | "count">
) {
    const queryString = queryService.toQueryString(action.query);
    const resultsState = state.results;
    let newItemsKeys = [...action.response.result];
    let count = undefined;
    if (!isNil(resultsState[queryString])) {
        const previousCount = resultsState[queryString].count;
        const previousItemsLength = resultsState[queryString].items.length;
        const previousItemsFiltered = resultsState[queryString].items.filter(
            (uid) => !action.uids?.includes(uid) || newItemsKeys.includes(uid)
        );
        const addedItemsLength = newItemsKeys.filter(
            (uid) => !resultsState[queryString].items.includes(uid)
        ).length;
        newItemsKeys = union(previousItemsFiltered, newItemsKeys);

        if (previousCount !== undefined) {
            if (action.queryName === SCHEDULER_UNPLANNED_PREPARED_TRIPS_QUERY_NAME) {
                // we consider that all the prepared trips hold in a single page
                // and we already have all of them
                count = newItemsKeys.length;
            } else {
                count =
                    previousCount -
                    (previousItemsLength - previousItemsFiltered.length) +
                    addedItemsLength;
            }
        }
    }
    return {
        ...state,
        results: {
            ...resultsState,
            [queryString]: {
                ...resultsState[queryString],
                items: newItemsKeys,
                count: count,
            },
        },
        loading: isEqual(action.query, state.currentQuery) ? false : state.loading,
    };
}

export default function searches(
    state: SearchesRootState = initialSearches,
    action: SearchAction
) {
    let newState;
    let queryResults;
    switch (action.type) {
        case "SEARCH_ENTITIES":
        case "SEARCH_PARTIAL_ENTITIES":
        case "SEARCH_PARTIAL_ENTITIES_BY_UID":
            if (action.queryName === null) {
                return state;
            }
            return {
                ...state,
                [action.queryName]: {
                    ...state[action.queryName],
                    currentQuery: {...action.query},
                    loading: action.type !== "SEARCH_PARTIAL_ENTITIES_BY_UID",
                },
            };
        case "RESET_SEARCH_RESULTS":
            if (action.queryName === null) {
                return state;
            }
            return {
                ...state,
                [action.queryName]: {
                    ...state[action.queryName],
                    results: {
                        ...state[action.queryName]?.results,
                        [queryService.toQueryString(action.query)]: {
                            items: [],
                            count: 0,
                        },
                    },
                },
            };
        case "SEARCH_ENTITIES_SUCCESS":
            if (action.queryName === null) {
                return state;
            }

            return {
                ...state,
                [action.queryName]: searchSuccessReducer(state[action.queryName], action),
            };
        case "SEARCH_PARTIAL_ENTITIES_SUCCESS":
            if (action.queryName === null) {
                return state;
            }

            return {
                ...state,
                [action.queryName]: searchPartialSuccessReducer(state[action.queryName], action),
            };
        case "SEARCH_BY_UIDS_ENTITIES_SUCCESS":
            if (action.queryName === null) {
                return state;
            }

            return {
                ...state,
                [action.queryName]: searchByUidsSuccessReducer(state[action.queryName], action),
            };
        case "SEARCH_ENTITIES_ERROR":
            if (action.queryName === null) {
                return state;
            }

            return {
                ...state,
                [action.queryName]: {
                    ...state[action.queryName],
                    loading: false,
                },
            };
        case "CLEAR_SEARCHES":
            newState = Object.assign({}, state);
            for (let search in state) {
                state[search as QueryName].results = {};
            }
            return newState;
        case "REMOVE_SEARCH_ITEM":
            queryResults =
                state[action.queryName].results[queryService.toQueryString(action.query)];
            if (!queryResults) {
                return state;
            }
            remove(queryResults.items, (item) => item === action.itemIdToRemove);
            queryResults.count -= 1;
            queryResults.hasNextPage = queryResults.items.length < queryResults.count;
            return {
                ...state,
                [action.queryName]: {
                    ...state[action.queryName],
                    results: {
                        ...state[action.queryName].results,
                        [queryService.toQueryString(action.query)]: {
                            ...state[action.queryName].results[
                                queryService.toQueryString(action.query)
                            ],
                            items: queryResults.items,
                            count: queryResults.count,
                            hasNextPage: queryResults.hasNextPage,
                        },
                    },
                },
            };
        case "ADD_SEARCH_ITEM":
            newState = Object.assign({}, state);
            queryResults =
                newState[action.queryName].results[queryService.toQueryString(action.query)];
            // @ts-ignore
            queryResults.items.push(action.itemIdToAdd);
            queryResults.count += 1;
            queryResults.hasNextPage = queryResults.items.length < queryResults.count;
            return {
                ...state,
                [action.queryName]: {
                    ...state[action.queryName],
                    results: {
                        ...state[action.queryName].results,
                        [queryService.toQueryString(action.query)]: {
                            ...state[action.queryName].results[
                                queryService.toQueryString(action.query)
                            ],
                            items: queryResults.items,
                            count: queryResults.count,
                            hasNextPage: queryResults.hasNextPage,
                        },
                    },
                },
            };
        default:
            return state;
    }
}
