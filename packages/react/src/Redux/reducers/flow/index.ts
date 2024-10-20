export * from "../../hooks";

import {getConnectedCompanies, isAuthenticated} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {createAsyncThunk, createSelector} from "@reduxjs/toolkit";
import {combineReducers} from "redux";
import {RootState} from "redux/reducers";
import {startOfDay, tz} from "services/date";
import {filtersService} from "services/filters.service";
import {FlowProfile, Site, TzDate} from "types";

import {FlowManagerCompany} from "../../../types/company";

import {availabilityReducer, AvailabilityState} from "./availability.slice";
import {bookingStatusReducer, BookingStatusState, fetchBookingStatus} from "./bookingStatus.slice";
import {filterReducer, FilterState, updateFilters} from "./filter.slice";
import {reportingReducer, ReportingState} from "./reporting.slice";
import {getSiteBySlug, selectSite, siteReducer, SiteState} from "./site.slice";
import {slotReducer, SlotState} from "./slot.slice";
import {slotEventsReducer, SlotEventsState} from "./slotEvents.slice";
import {fetchDelegateSlots, slotsDelegateReducer, SlotsDelegateState} from "./slotsDelegate.slice";
import {fetchSearch, SearchPayload, slotSearchReducer, SlotSearchState} from "./slotSearch.slice";
import {fetchStatistics, statisticReducer, StatisticState} from "./statistic.slice";
import {fetchZones, zoneReducer, ZoneState} from "./zone.slice";

export type Silently = {
    silently?: true; // To avoid displaying a loading indicator
};

// Action Creators
// ---------------

export const fetchFlow = createAsyncThunk(
    "dashdoc/flow/fetch",
    async (slug: string, {dispatch, getState}) => {
        // Firstly, we fetch the site
        await dispatch(getSiteBySlug(slug));
        const state = getState() as RootState;
        const {
            flow: {
                site: {entity},
            },
        } = state;
        if (entity !== null) {
            const profile = selectProfile(state);

            const timezone = entity.timezone;
            const nowOnSite = tz.now(timezone);
            const todayBegin = startOfDay(nowOnSite);
            if (profile === "guest") {
                // secondly, as a guest, we compute zones
                dispatch(fetchZones({siteId: entity.id}));
            } else if (profile === "delegate") {
                // secondly, as a delegate, we compute the filters thanks to the site timezone
                const filters = filtersService.create(todayBegin, entity.id, 6);
                // thirdly, we fetch all required data
                dispatch(updateFilters(filters));
                dispatch(fetchZones({siteId: entity.id}));
                dispatch(fetchDelegateSlots(filters));
            } else {
                // secondly, as a siteManager, we compute the filters thanks to the site timezone
                const filters = filtersService.create(todayBegin, entity.id);
                // thirdly, we fetch all required data
                dispatch(updateFilters(filters));
                dispatch(fetchZones({siteId: filters.site}));
                dispatch(fetchBookingStatus(filters));
                dispatch(fetchStatistics(filters));
            }
        } else {
            Logger.error("No site, cannot fetch flow");
        }
    }
);

export const refreshFlow = createAsyncThunk(
    "dashdoc/flow/refresh",
    async (_, {dispatch, getState}) => {
        const state = getState() as RootState;
        const {flow} = state;
        if ("site" in flow.filter) {
            const profile = selectProfile(state);
            if (profile === "guest" || profile === "delegate") {
                // secondly, as a guest, we refresh zones
                dispatch(fetchZones({siteId: flow.filter.site, silently: true}));
            } else {
                // secondly, as a siteManager or a delegate, we refresh data
                dispatch(fetchZones({siteId: flow.filter.site, silently: true}));
                dispatch(fetchBookingStatus({...flow.filter, silently: true}));
                dispatch(fetchStatistics({...flow.filter, silently: true}));
            }
        } else {
            Logger.error("No filters, cannot refresh site");
        }
    }
);

export const updateFlowDate = createAsyncThunk(
    "dashdoc/flow/updateDate",
    async (date: TzDate, {dispatch, getState}) => {
        const state = getState() as RootState;
        const {flow} = state;
        const {
            site: {entity},
        } = flow;

        if ("site" in flow.filter && entity !== null) {
            const profile = selectProfile(state);
            const filter = flow.filter;
            if (profile === "siteManager") {
                const updatedFilter = filtersService.create(date, filter.site);
                dispatch(updateFilters(updatedFilter));
                dispatch(fetchBookingStatus({...updatedFilter}));
                dispatch(fetchStatistics({...updatedFilter}));
            } else {
                Logger.error("updateFlowDate works only with a siteManager profile");
            }
        } else {
            Logger.error("No filters, cannot refresh site");
        }
    }
);

export const searchSlots = createAsyncThunk(
    "dashdoc/flow/search",
    async ({search, start}: Omit<SearchPayload, "site">, {dispatch, getState}) => {
        const {flow} = getState() as {flow: FlowState};
        if (flow.site.entity !== null) {
            const searchPayload: SearchPayload = {search, site: flow.site.entity.id, start};
            await dispatch(fetchSearch(searchPayload));
        } else {
            Logger.error("No site, cannot search slots");
        }
    }
);

// Reducer
// -------
export const flowReducer = combineReducers({
    availability: availabilityReducer,
    site: siteReducer,
    filter: filterReducer,
    zone: zoneReducer,
    slotsDelegate: slotsDelegateReducer,
    bookingStatus: bookingStatusReducer,
    reporting: reportingReducer,
    statistic: statisticReducer,
    slot: slotReducer,
    slotEvents: slotEventsReducer,
    slotSearch: slotSearchReducer,
});

export type FlowState = {
    availability: AvailabilityState;
    filter: FilterState;
    zone: ZoneState;
    bookingStatus: BookingStatusState;
    reporting: ReportingState;
    statistic: StatisticState;
    site: SiteState;
    slot: SlotState;
    slotEvents: SlotEventsState;
    slotSearch: SlotSearchState;
    slotsDelegate: SlotsDelegateState;
};

const selectSelf = (state: {flow: FlowState; account: {companies: FlowManagerCompany[]}}) => state;

export const loadingFlow = createSelector(selectSelf, (state) => {
    const {flow} = state;
    const loadingSite = flow.site.loading;
    const loadingBookings = flow.bookingStatus.loading;
    const loadingStatistics = flow.statistic.loading;
    const slotsDelegate = flow.slotsDelegate.loading;
    const zone = flow.zone.loading;
    const profile = selectProfile(state);
    let loadings = [loadingSite];
    if (profile === "siteManager") {
        loadings = [loadingSite, loadingBookings, loadingStatistics];
    } else if (profile === "delegate") {
        loadings = [loadingSite, slotsDelegate, zone];
    }

    if (loadings.includes("pending")) {
        return "pending";
    } else if (loadings.includes("reloading")) {
        return "reloading";
    } else if (loadings.includes("failed")) {
        return "failed";
    } else if (loadings.every((loadingState) => loadingState === "succeeded")) {
        return "succeeded";
    } else {
        return "idle";
    }
});

export const selectStartDate = createSelector(selectSelf, (state) => {
    const filters = state.flow.filter;
    return "start" in filters ? filters.start : null;
});

export const selectedSlot = createSelector(selectSelf, (state) => {
    const selectedId = state.flow.slot.selectedId;
    if (selectedId !== null) {
        if (state.flow.slot.entities[selectedId]) {
            const slot = state.flow.slot.entities[selectedId];
            return slot;
        }
        Logger.error(`No slot found with id ${selectedId}`);
    }
    return null;
});

/**
 * Derived the flow profile from all manager companies.
 */
export const selectProfile = createSelector(selectSelf, (state) => {
    const isAuth = isAuthenticated(state as any);
    const site = selectSite(state);
    const companies = getConnectedCompanies(state as any) as FlowManagerCompany[];

    return deriveProfileFrom(isAuth, companies, site);
});

function deriveProfileFrom(isAuth: boolean, companies: FlowManagerCompany[], site: Site | null) {
    let result: FlowProfile = "guest"; // Low level as default profile
    if (isAuth && site !== null) {
        if (isSiteManager(companies, site.id)) {
            result = "siteManager";
        } else if (isDelegate(companies, site.id)) {
            result = "delegate";
        }
    }
    return result;
}

function isSiteManager(companies: FlowManagerCompany[], siteId: number) {
    return companies.some((company) => company.flow_site?.id === siteId);
}

function isDelegate(companies: FlowManagerCompany[], siteId: number) {
    return companies.some((company) => {
        const result = company.flow_delegations.some((delegate) => delegate.site.id === siteId);
        return result;
    });
}

export const selectFlowDelegateCompanies = createSelector(selectSelf, (state) => {
    const site = selectSite(state);
    const companies = getConnectedCompanies(state) as FlowManagerCompany[];

    return companies.filter((company) => {
        return company.flow_delegations.some((delegate) => delegate.site.id === site?.id);
    });
});
