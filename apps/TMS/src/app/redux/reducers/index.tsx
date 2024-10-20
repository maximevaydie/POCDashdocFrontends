import {
    accountReducer,
    authReducer,
    CommonEntities,
    CommonRootState,
    entitiesReducer,
    PartnerDetailOutput,
    realtimeReducer,
    RealtimeState,
    selectionsReducer,
    settingsViewsReducer,
    SettingsViewState,
} from "@dashdoc/web-common";
import {RESET_REDUX_STATE} from "@dashdoc/web-common/src/redux/actions/reset";
import {Connector, FleetTag, Manager, Tag, TransportMessage, Trucker} from "dashdoc-utils";
import {combineReducers} from "redux";

import {Connectors, connectorsReducer} from "app/redux/reducers/connectors";
import {extendedViewReducer} from "app/redux/reducers/extended-view";
import {extensionsReducer, ExtensionsState} from "app/redux/reducers/extensions";
import {InvoicingStatus, invoicingStatusReducer} from "app/redux/reducers/invoicing-status";
import realtimeLegacy, {RealtimeLegacyState} from "app/redux/reducers/realtime";
import {
    DASHDOC_TAX_CODES_SLICE_NAME,
    dashdocTaxCodesReducer,
    DashdocTaxCodeState,
} from "app/taxation/invoicing/store/dashdocTaxCodeSlice";
import {
    TARIFF_GRID_AREAS_SLICE_NAME,
    tariffGridAreasReducer,
    TariffGridAreasState,
} from "app/taxation/pricing/store/tariffGridAreasSlice";
import {
    TARIFF_GRID_COUNTRIES_SLICE_NAME,
    tariffGridCountriesReducer,
    TariffGridCountriesState,
} from "app/taxation/pricing/store/tariffGridCountriesSlice";
import {CompanyInvoicingData} from "app/types/company";
import {QuotationRequest} from "app/types/rfq";

import carrierCharteringScheduler from "./carrier-chartering-scheduler";
import companies from "./companies";
import {counts, CountsState} from "./counts";
import tmsEntitiesReducer, * as fromEntities from "./entities";
import invoicingConnector from "./invoicing-connector";
import invoicingConnectorLoaded from "./invoicing-connector-loaded";
import invoicingConnectorLoading from "./invoicing-connector-loading";
import loading, {Loading} from "./loading";
import managerTruckersTags from "./manager-truckers-tags";
import searches, {SearchesRootState} from "./searches";
import trailers from "./trailers";
import {transportsCount} from "./transportsCount";
import unifiedFleetTags from "./unified-fleet-tags";
import vehicles from "./vehicles";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {
    CreditNoteLink,
    Invoice,
    InvoiceLineGroup,
    PartialInvoice,
} from "app/taxation/invoicing/types/invoice.types";
import type {
    InvoiceLine,
    InvoiceMergedLineGroups,
} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";
import type {Delivery, Segment, Site, Transport, TransportStatus} from "app/types/transport";

// @guidedtour[epic=redux, seq=5] Reducers
// This is where we define two things:
// - the shape of the state
// - the reducers that will update the state based on actions
// Since we have a single state object with the whole state of the app, we have a lot of reducers.
// So we use the combineReducers function to combine several small reducers into a single one.
const createRootReducer = () => {
    const appReducer = combineReducers({
        auth: authReducer,
        account: accountReducer,
        extendedView: extendedViewReducer,
        [DASHDOC_TAX_CODES_SLICE_NAME]: dashdocTaxCodesReducer,
        [TARIFF_GRID_AREAS_SLICE_NAME]: tariffGridAreasReducer,
        [TARIFF_GRID_COUNTRIES_SLICE_NAME]: tariffGridCountriesReducer,
        loading,
        trailers,
        carrierCharteringScheduler,
        companies,
        vehicles,
        entities: entitiesReducer(tmsEntitiesReducer),
        searches,
        selections: selectionsReducer,
        counts,
        realtimeLegacy, // realtimeLegacy (tms) is deprecated, use realtime (common) instead
        realtime: realtimeReducer,
        unifiedFleetTags,
        managerTruckersTags,
        transportsCount,
        connectors: connectorsReducer,
        invoicingConnector,
        invoicingConnectorLoading,
        invoicingConnectorLoaded,
        settingsViews: settingsViewsReducer,
        invoicingStatus: invoicingStatusReducer,
        extensions: extensionsReducer,
    });
    const rootReducer = (state: any, action: any) => {
        if (action?.type === RESET_REDUX_STATE) {
            state = undefined;
        }

        return appReducer(state, action);
    };
    return rootReducer;
};

export default createRootReducer;

export type Entities = CommonEntities & {
    companiesInvoicingData: Record<string, CompanyInvoicingData>;
    deliveries: Record<string, Delivery>;
    managers: Record<string, Manager>;
    segments: Record<string, Segment>;
    sites: Record<string, Site>;
    transports: Record<string, Transport>;
    transportStatus: Record<string, TransportStatus>;
    truckers: Record<string, Trucker>;
    invoices: Record<string, Invoice | PartialInvoice>;
    creditNotes: Record<string, CreditNote | CreditNoteLink>;
    invoiceLineGroups: Record<string, InvoiceLineGroup>;
    invoiceMergedLineGroups: Record<string, InvoiceMergedLineGroups>;
    invoiceLines: Record<string, InvoiceLine>;
    transportMessage: Record<string, TransportMessage>;
    schedulerTrips: Record<string, any>;
    quotationRequests: Record<string, QuotationRequest>;
    partnerDetails: Array<PartnerDetailOutput>;
};

// TODO: import for each reducer and use it here.
export type RootState = CommonRootState & {
    extendedView: boolean;
    loading: Loading;
    trailers: any;
    carrierCharteringScheduler: any;
    [DASHDOC_TAX_CODES_SLICE_NAME]: DashdocTaxCodeState;
    [TARIFF_GRID_AREAS_SLICE_NAME]: TariffGridAreasState;
    [TARIFF_GRID_COUNTRIES_SLICE_NAME]: TariffGridCountriesState;
    companies: any;
    vehicles: any;
    entities: Entities;
    searches: SearchesRootState;
    selections: any;
    counts: CountsState;
    updateLateTransports: any;
    realtimeLegacy: RealtimeLegacyState; // realtimeLegacy (tms) is deprecated, use realtime (common) instead
    realtime: RealtimeState;
    unifiedFleetTags: Array<FleetTag>;
    managerTruckersTags: Array<FleetTag>;
    tags: Array<Tag>;
    transportsCount: number | null;
    connectors: Connectors;
    invoicingConnector: Connector | null;
    invoicingConnectorLoading: boolean;
    invoicingConnectorLoaded: boolean;
    invoicingStatus: InvoicingStatus;
    settingsViews: SettingsViewState;
    extensions: ExtensionsState;
};

export function getFullTransport(state: Partial<RootState>, uid: string) {
    return fromEntities.getFullTransport(state.entities, uid);
}
export function getFullTrip(state: Partial<RootState>, uid: string) {
    return fromEntities.getFullTrip(state.entities, uid);
}

export function getTransportsList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getTransportsList(state.entities, uids);
}

export function getUnplannedSegmentsList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getUnplannedSegmentsList(state.entities, uids);
}
export function getTripsList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getTripsList(state.entities, uids);
}

export function getLogisticPointList(state: Partial<RootState>, pks: number[]) {
    return fromEntities.getLogisticPointList(state.entities, pks);
}

/**
 * @deprecated
 */
export function getAddressesList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getAddressesList(state.entities, uids);
}

export function getCompaniesList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getCompaniesList(state.entities, pks);
}

export function getPartnersList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getPartnersList(state.entities, pks);
}

export function getContactsList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getContactsList(state.entities, uids);
}

export function getFullTrucker(state: Partial<RootState>, uid: string) {
    return fromEntities.getFullTrucker(state.entities, uid);
}

export function getTruckersList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getTruckersList(state.entities, pks);
}

export function getTruckerStatsList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getTruckerStatsList(state.entities, pks);
}

export function getManagersList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getManagersList(state.entities, pks);
}

export function getExportsList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getExportsList(state.entities, pks);
}

export function getFullVehicle(state: Partial<RootState>, uid: string) {
    return fromEntities.getFullVehicle(state, uid);
}
export function getVehiclesList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getVehiclesList(state.entities, pks);
}

export function getFullTrailer(state: Partial<RootState>, uid: string) {
    return fromEntities.getFullTrailer(state, uid);
}

export function getTrailersList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getTrailersList(state.entities, pks);
}

export function getInvoicesList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getInvoicesList(state.entities, uids);
}

export function getCreditNotesList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.getCreditNotesList(state.entities, uids);
}

export function getInvoice(state: Partial<RootState>, uid?: Invoice["uid"]) {
    return fromEntities.getInvoice(state.entities, uid);
}
export function getCreditNote(state: Partial<RootState>, uid?: CreditNote["uid"]) {
    return fromEntities.getCreditNote(state.entities, uid);
}

export function getFleetItemsList(state: Partial<RootState>, pks: string[]) {
    return fromEntities.getFleetItemsList(state.entities, pks);
}

export function geRequestedVehiclesList(state: Partial<RootState>, uids: string[]) {
    return fromEntities.geRequestedVehiclesList(state.entities, uids);
}

export function getTagsList(state: Partial<RootState>, pks: number[]) {
    return fromEntities.getTagsList(state.entities, pks);
}

export function getSiteSchedulerSharedActivitiesList(state: Partial<RootState>, ids: string[]) {
    return fromEntities.getSiteSchedulerSharedActivitiesList(state.entities, ids);
}
