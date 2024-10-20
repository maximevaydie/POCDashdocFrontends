import {fetchUsages, requestPlanUpgrade, updateAccountCompany} from "@dashdoc/web-common";
import cloneDeep from "rfdc/default";

import {
    REQUEST_COMPANY_SEARCH,
    REQUEST_COMPANY_SEARCH_ERROR,
    REQUEST_COMPANY_SEARCH_SUCCESS,
} from "app/redux/actions/companies";
import {
    REQUEST_TRAILERS_SEARCH,
    REQUEST_TRAILERS_SEARCH_ERROR,
    REQUEST_TRAILERS_SEARCH_SUCCESS,
} from "app/redux/actions/company/fetch-trailers-search";
import {
    REQUEST_VEHICLES_SEARCH,
    REQUEST_VEHICLES_SEARCH_ERROR,
    REQUEST_VEHICLES_SEARCH_SUCCESS,
} from "app/redux/actions/company/fetch-vehicles-search";
import {Entities} from "app/redux/reducers";

export type Loading = {
    shipmentsSearch: boolean;
    addressesSearch: boolean;
    truckersList: boolean;
    contactsSearch: boolean;
    companiesSearch: boolean;
    managers: boolean;
    switchCompany: boolean;
    usages: boolean;
    requestPlanUpgrade: boolean;
    entities: Record<keyof Entities, Record<string, boolean>>;
};

const initialLoadingState: Loading = {
    shipmentsSearch: false,
    addressesSearch: false,
    truckersList: false,
    contactsSearch: false,
    companiesSearch: false,
    managers: false,
    switchCompany: false,
    usages: false,
    requestPlanUpgrade: false,
    /** @guidedtour[epic=redux] Data loading policy: loading state
     * We create the loading state to store the entity loading status.
     * In this way, we can use this state to prevent an unnecessary data fetching.
     * ```
     * if(state.loading.transports?["bfd16988-1346-4f41-a956-f161f77e53d2"]) {
     *   // nothing to do, loading already in progress
     * }
     * ```
     * We can also detect a loaded entity thanks to the `entities` state.
     * if(state.entities.transports?["bfd16988-1346-4f41-a956-f161f77e53d2"]) {
     *   // nothing to do, already loaded
     * }
     */
    entities: {
        addresses: {},
        logisticPoints: {},
        contacts: {},
        deliveries: {},
        managers: {},
        companies: {},
        partnerDetails: {},
        companiesInvoicingData: {},
        segments: {},
        sites: {},
        transports: {},
        transportStatus: {},
        truckers: {},
        invoices: {},
        invoiceLineGroups: {},
        invoiceMergedLineGroups: {},
        invoiceLines: {},
        creditNotes: {},
        transportMessage: {},
        schedulerTrips: {},
        quotationRequests: {},
    },
};

export default function loading(state = initialLoadingState, action: any) {
    let newState: Loading;
    const entityKey: keyof Entities = action.entity;
    switch (action.type) {
        case "ENTITY_LOADING":
            newState = cloneDeep(state);
            if (!newState.entities[entityKey]) {
                newState.entities[entityKey] = {};
            }
            newState.entities[entityKey][action.id] = true;
            return newState;
        case "ENTITY_LOADED":
            newState = cloneDeep(state);
            newState.entities[entityKey][action.id] = false;
            return newState;
        case REQUEST_VEHICLES_SEARCH:
            return {...state, vehiclesSearch: true};
        case REQUEST_VEHICLES_SEARCH_SUCCESS:
        case REQUEST_VEHICLES_SEARCH_ERROR:
            return {...state, vehiclesSearch: false};
        case REQUEST_TRAILERS_SEARCH:
            return {...state, trailersSearch: true};
        case REQUEST_TRAILERS_SEARCH_SUCCESS:
        case REQUEST_TRAILERS_SEARCH_ERROR:
            return {...state, trailersSearch: false};
        case REQUEST_COMPANY_SEARCH:
            return {...state, companiesSearch: true};
        case REQUEST_COMPANY_SEARCH_SUCCESS:
        case REQUEST_COMPANY_SEARCH_ERROR:
            return {...state, companiesSearch: false};
        case "SEARCH_ENTITIES":
        case "SEARCH_PARTIAL_ENTITIES":
            if (action.queryName === "truckers") {
                return {...state, truckersList: true};
            }
            return state;
        case "SEARCH_ENTITIES_SUCCESS":
        case "SEARCH_PARTIAL_ENTITIES_SUCCESS":
        case "SEARCH_BY_UIDS_ENTITIES_SUCCESS":
        case "SEARCH_ENTITIES_ERROR":
            if (action.queryName === "truckers") {
                return {...state, truckersList: false};
            }
            return state;

        case updateAccountCompany.pending.type:
            return {...state, switchCompany: true};
        case updateAccountCompany.fulfilled.type:
        case updateAccountCompany.rejected.type:
            return {...state, switchCompany: false};

        case fetchUsages.pending.type:
            return {...state, usages: true};
        case fetchUsages.rejected.type:
        case fetchUsages.fulfilled.type:
            return {...state, usages: false};

        case requestPlanUpgrade.pending.type:
            return {...state, requestPlanUpgrade: true};
        case requestPlanUpgrade.rejected.type:
        case requestPlanUpgrade.fulfilled.type:
            return {...state, requestPlanUpgrade: false};

        default:
            return state;
    }
}
