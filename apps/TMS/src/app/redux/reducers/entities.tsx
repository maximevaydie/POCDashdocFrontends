import {LogisticPoint, companySchema, managerSchema} from "@dashdoc/web-common";
import {
    AddressFromAddressBook,
    Company,
    Contact,
    Export,
    FleetItem,
    InvoiceableCompany,
    Manager,
    RequestedVehicle,
    SupportExchange,
    Tag,
    Trailer,
    TransportMessage,
    Trucker,
    Vehicle,
} from "dashdoc-utils";
import {DistanceData} from "dashdoc-utils/dist/api/scopes/transports";
import {pick} from "lodash";
import mergeWith from "lodash.mergewith";
import omit from "lodash.omit";
import uniq from "lodash.uniq";
import {Schema, denormalize, normalize, schema} from "normalizr";
import cloneDeep from "rfdc/default";

import {RawCarrierCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {SiteSchedulerSharedActivity} from "app/features/scheduler/site-scheduler/types";
import {Trip} from "app/features/trip/trip.types";
import {
    CREDIT_NOTE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS,
    CREDIT_NOTE_FILE_UPDATED_EVENT_SUCCESS,
} from "app/redux/actions/creditNotes";
import {
    ADD_INVOICELINE_SUCCESS,
    DELETE_INVOICELINE_SUCCESS,
    INVOICE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS,
    INVOICE_FILE_UPDATED_EVENT_SUCCESS,
    UPDATE_INVOICE_SUCCESS,
} from "app/redux/actions/invoices";
import {
    UPDATE_PARTIAL_TRANSPORT_SUCCESS,
    UPDATE_TRANSPORT_ESTIMATED_DISTANCES,
} from "app/redux/actions/transports";
import {UPDATE_PARTIAL_TRIP} from "app/redux/actions/trips";

import {
    addressSchema,
    contactSchema,
    creditNoteSchema,
    exportSchema,
    fleetItemSchema,
    invoiceSchema,
    logisticPointSchema,
    partialTransportSchema,
    requestedVehicleSchema,
    schedulerSegmentSchema,
    schedulerTripSchema,
    siteSchedulerSharedActivitySchema,
    tagSchema,
    trailerSchema,
    transportSchema,
    truckerSchema,
    truckerStatsSchema,
    vehicleSchema,
} from "../schemas";

import {RootState} from "./index";

import type {
    CreditNoteCommunicationStatus,
    InvoiceCommunicationStatus,
} from "app/taxation/invoicing/types/communicationStatus.types";
import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {
    CreditNoteLink,
    Invoice,
    InvoiceAttachment,
    PartialInvoice,
} from "app/taxation/invoicing/types/invoice.types";
import type {Segment, Site} from "app/types/transport";
import type {TransportListWeb} from "app/types/transport_list_web";

function mergeCustomizer<T = any>(objValue: T, otherValue: T, key: string): any {
    if (key === "loads" || key === "status_updates" || key === "messages") {
        return otherValue;
    }
    if (key === "signatures" && objValue instanceof Array && otherValue instanceof Array) {
        const allSignatures = otherValue.concat(objValue);
        return uniq(allSignatures);
    }
    if (key === "__partial") {
        return objValue && otherValue;
    }
    if (Array.isArray(objValue)) {
        return otherValue;
    }
    if (objValue === undefined) {
        return otherValue;
    }
}

function mergeEntities<T = any>(oldEntities: T, newEntities: T) {
    return mergeWith({}, cloneDeep(oldEntities), newEntities, mergeCustomizer);
}

export default function entitiesReducer(state: any = {}, action: any) {
    let newState: any;
    let site;
    let createdCreditNote: CreditNote;
    let generatedFromInvoiceUid;
    switch (action.type) {
        case "ADD_TRUCKER_SUCCESS":
        case UPDATE_INVOICE_SUCCESS:
            return mergeEntities(state, action.response.entities);
        case "BULK-ASSIGN-TO-TRUCKER-AND-TIME_SCHEDULER-TRIP_SUCCESS":
        case "BULK-ASSIGN-TO-VEHICLE-AND-TIME_SCHEDULER-TRIP_SUCCESS":
        case "BULK-ASSIGN-TO-TRAILER-AND-TIME_SCHEDULER-TRIP_SUCCESS":
        case "BULK-ASSIGN-TO-TRUCKER_SCHEDULER-TRIP_SUCCESS":
        case "BULK-ASSIGN-TO-TRAILER_SCHEDULER-TRIP_SUCCESS":
        case "BULK-ASSIGN-TO-VEHICLE_SCHEDULER-TRIP_SUCCESS": {
            const responseEntities = action.response.entities;
            let allowUpdate = false;
            action.response.result.map((tripUid: string) => {
                if (state.schedulerTrips[tripUid]._localMoveTo !== action.moveTo) {
                    delete responseEntities.schedulerTrips[tripUid];
                } else {
                    allowUpdate = true;
                }
            });
            if (allowUpdate) {
                return mergeEntities(state, action.response.entities);
            }
            return state;
        }
        case "BULK-MARK-FINAL_INVOICE_SUCCESS": {
            const normalized = normalize(
                action.response.finalized_invoices,
                new schema.Array(invoiceSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        case "BULK-MARK-PAID_INVOICE_SUCCESS": {
            const normalized = normalize(
                action.response.marked_paid_invoices,
                new schema.Array(invoiceSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        case "UPDATE_DELIVERY_SUCCESS": {
            const deliveryUid: string = action.response.result;
            newState = mergeEntities(state, action.response.entities);
            newState.deliveries[deliveryUid].tracking_contacts =
                action.response.entities.deliveries[deliveryUid].tracking_contacts;
            return newState;
        }
        case "DELETE_SUPPORTTYPE_SUCCESS": {
            return {...state, ["support-types"]: omit(state["support-types"], action.pk)};
        }
        case "DELETE_TRUCKER_SUCCESS":
            return {
                ...state,
                truckers: omit(state.truckers, action.pk),
            };
        case "DELETE_TRANSPORT_SUCCESS":
            return {
                ...state,
                transports: omit(state.transports, action.pk),
            };
        case "ADD_DOCUMENT_SUCCESS":
        case "ADD_MESSAGE_SUCCESS": {
            newState = mergeEntities(state, action.response.entities);
            let doc = action.response.entities.transportMessage[action.response.result];
            if (
                newState.transports?.[doc.transport] &&
                !newState.transports?.[doc.transport].messages.includes(doc.uid)
            ) {
                newState.transports[doc.transport].messages.push(doc.uid);
            }
            return newState;
        }
        case "DELETE_DOCUMENT_SUCCESS": {
            newState = cloneDeep(state);
            let transportsMessages: TransportMessage[] =
                newState.transports[action.transportUid]?.messages;
            const index = transportsMessages.findIndex((value) => value === action.pk);
            if (index !== -1) {
                transportsMessages.splice(index, 1);
            }
            delete newState.transportMessage[action.pk];
            return newState;
        }
        case "ADD_SUPPORTS-EXCHANGE_SUCCESS":
            newState = cloneDeep(state);
            site = newState.sites[action["supports-exchange"].site.uid];
            site.supports_exchanges?.push(action["supports-exchange"]);
            return newState;
        case "UPDATE_SUPPORTS-EXCHANGE_SUCCESS": {
            newState = cloneDeep(state);
            site = newState.sites[action["supports-exchange"].site.uid];
            const exchangeIndex = site.supports_exchanges.findIndex(
                (exchange: SupportExchange) => exchange.uid === action["supports-exchange"].uid
            );
            site.supports_exchanges[exchangeIndex] = action["supports-exchange"];
            return newState;
        }
        case "VALIDATE_COORDINATES_SUCCESS": {
            newState = cloneDeep(state);
            const {siteUid, ...addressCoordinates} = action.address;
            site = (newState.sites as {[uid: string]: Site})[siteUid];
            site.address = {...site.address, ...addressCoordinates, coords_validated: true};
            return newState;
        }
        case "ENABLE_ETA_SUCCESS":
            newState = cloneDeep(state);
            site = (newState.sites as {[uid: string]: Site})[action.uid];
            if (site) {
                site.eta_tracking = true;
            }
            return newState;
        case "UPDATE_VEHICLE_SUCCESS":
        case "RETRIEVE_VEHICLE_SUCCESS":
            newState = cloneDeep(state);
            if (newState?.["fleet-items"]?.[`vehicle-${action.vehicle.pk}`]) {
                newState["fleet-items"][`vehicle-${action.vehicle.pk}`] = {
                    type: "vehicle",
                    ...pick(
                        action.vehicle,
                        "pk",
                        "fleet_number",
                        "license_plate",
                        "remote_id",
                        "tags",
                        "used_for_qualimat_transports",
                        "telematic_vehicle",
                        "fuel_type",
                        "gross_combination_weight_in_tons",
                        "means_combination"
                    ),
                };
            }
            return newState;
        case "UPDATE_TRAILER_SUCCESS":
        case "RETRIEVE_TRAILER_SUCCESS":
            newState = cloneDeep(state);
            if (newState?.["fleet-items"]?.[`trailer-${action.trailer.pk}`]) {
                newState["fleet-items"][`trailer-${action.trailer.pk}`] = {
                    type: "trailer",
                    ...pick(
                        action.trailer,
                        "pk",
                        "fleet_number",
                        "license_plate",
                        "remote_id",
                        "tags",
                        "used_for_qualimat_transports",
                        "telematic_vehicle",
                        "means_combination"
                    ),
                };
            }
            return newState;
        case "DELETE_VEHICLE_SUCCESS":
            newState = cloneDeep(state);
            if (newState?.["fleet-items"]?.[`vehicle-${action.pk}`]) {
                delete newState["fleet-items"][`vehicle-${action.pk}`];
            }
            return newState;
        case "DELETE_TRAILER_SUCCESS":
            newState = cloneDeep(state);
            if (newState?.["fleet-items"]?.[`trailer-${action.pk}`]) {
                delete newState["fleet-items"][`trailer-${action.pk}`];
            }
            return newState;
        case INVOICE_FILE_UPDATED_EVENT_SUCCESS:
            newState = cloneDeep(state);
            if (newState?.invoices?.[action.payload.invoice_uid]) {
                newState.invoices[action.payload.invoice_uid].file = action.payload.file;
            }
            return newState;
        case CREDIT_NOTE_FILE_UPDATED_EVENT_SUCCESS:
            newState = cloneDeep(state);
            if (newState?.creditNotes?.[action.payload.credit_note_uid]) {
                newState.creditNotes[action.payload.credit_note_uid].file = action.payload.file;
            }
            return newState;
        case INVOICE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS:
            newState = cloneDeep(state);
            if (newState?.invoices?.[action.payload.invoice_uid]) {
                const communicationStatus = action.payload.communication_status;
                const communicationStatusIndex = newState.invoices[
                    action.payload.invoice_uid
                ].communication_statuses.findIndex(
                    ({pk}: InvoiceCommunicationStatus) => pk === communicationStatus.pk
                );
                if (communicationStatusIndex !== -1) {
                    newState.invoices[action.payload.invoice_uid].communication_statuses.splice(
                        communicationStatusIndex,
                        1,
                        communicationStatus
                    );
                } else {
                    newState.invoices[action.payload.invoice_uid].communication_statuses.unshift(
                        communicationStatus
                    );
                }
            }
            return newState;
        case CREDIT_NOTE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS:
            newState = cloneDeep(state);
            if (newState?.creditNotes?.[action.payload.credit_note_uid]) {
                const communicationStatus = action.payload.communication_status;
                const communicationStatusIndex = newState.creditNotes[
                    action.payload.credit_note_uid
                ].communication_statuses.findIndex(
                    ({pk}: CreditNoteCommunicationStatus) => pk === communicationStatus.pk
                );
                if (communicationStatusIndex !== -1) {
                    newState.creditNotes[
                        action.payload.credit_note_uid
                    ].communication_statuses.splice(
                        communicationStatusIndex,
                        1,
                        communicationStatus
                    );
                } else {
                    newState.creditNotes[
                        action.payload.credit_note_uid
                    ].communication_statuses.unshift(communicationStatus);
                }
            }
            return newState;

        case UPDATE_PARTIAL_TRIP: {
            const {siteUids, ...payload}: {siteUids: string[]; payload: any} = action.payload;

            return mergeEntities(state, {
                sites: siteUids.reduce((acc: Record<string, any>, uid) => {
                    acc[uid] = {
                        ...payload,
                    };
                    return acc;
                }, {}),
            });
        }

        case "UPDATE_TRIP_ACTIVITIES_ORDER": {
            const {tripUid, activitiesUids}: {tripUid: string; activitiesUids: string[]} =
                action.payload;
            return mergeEntities(state, {
                schedulerTrips: {
                    [tripUid]: {
                        activities: activitiesUids,
                    },
                },
            });
        }

        case UPDATE_PARTIAL_TRANSPORT_SUCCESS: {
            if (!state.transports) {
                return state;
            }
            const oldTransport = state.transports[action.payload.uid];

            // If there was no old transport, we can't partially store it
            // that's because components relies on properties on the transport to be defined
            // which we can't guarantee
            if (!oldTransport) {
                return state;
            }

            const transportUpdated = {
                ...oldTransport,
                ...action.payload,
            };

            return mergeEntities(state, {
                transports: {
                    ...state.transports,
                    [action.payload.uid]: transportUpdated,
                },
            });
        }

        case UPDATE_TRANSPORT_ESTIMATED_DISTANCES: {
            if (!state.transports) {
                return state;
            }
            const previousTransport = state.transports[action.payload.uid];

            if (!previousTransport) {
                return state;
            }

            let newTransport = {
                estimated_distance: action.payload.total_estimated_distance,
            };

            let newSegments: Record<string, Partial<Segment>> = {};

            Object.entries(action.payload.segment_distances).forEach(
                ([uid, distanceData]: [string, DistanceData]) => {
                    newSegments[uid] = distanceData;
                }
            );

            return mergeEntities(state, {
                transports: {
                    [action.payload.uid]: newTransport,
                },
                segments: newSegments,
            });
        }

        case ADD_INVOICELINE_SUCCESS: {
            // normalized response {entities: {invoiceLines}, result: invoiceLineId};
            const response = action.payload.response;

            const invoiceToUpdate = state.invoices?.[action.payload.invoiceUid];

            return mergeEntities(state, {
                invoices: {
                    [action.payload.invoiceUid]: {
                        lines: [...invoiceToUpdate.lines, response.result],
                    },
                },
                ...response.entities,
            });
        }

        case DELETE_INVOICELINE_SUCCESS: {
            newState = cloneDeep(state);
            const invoiceLineId = action.payload.invoiceLineId;

            // Remove invoice line from redux store
            if (newState.invoiceLines?.[invoiceLineId]) {
                delete newState.invoiceLines?.[invoiceLineId];
            }

            // Remove invoice line from invoice
            if (newState.invoices?.[action.payload.invoiceUid]) {
                newState.invoices[action.payload.invoiceUid].lines = newState.invoices?.[
                    action.payload.invoiceUid
                ].lines.filter((lineId: number) => lineId !== invoiceLineId);
            }

            return newState;
        }

        case "ADD_INVOICE_ATTACHMENT_SUCCESS": {
            // normalized response {entities: {invoiceLines}, result: invoiceLineId};
            const response = action.payload.response;

            const invoiceToUpdate = state.invoices?.[action.payload.invoice_uid];

            if (invoiceToUpdate) {
                return mergeEntities(state, {
                    invoices: {
                        [action.payload.invoice_uid]: {
                            attachments: [...invoiceToUpdate.attachments, response],
                        },
                    },
                    ...response.entities,
                });
            }
            return state;
        }

        case "DELETE_INVOICE_ATTACHMENT_SUCCESS": {
            newState = cloneDeep(state);
            const invoice_attachment_uid = action.payload.invoice_attachment_uid;

            const invoiceToUpdate = newState.invoices?.[action.payload.invoice_uid];

            // Remove invoice line from invoice
            if (invoiceToUpdate) {
                const newAttachmentsList = invoiceToUpdate.attachments.filter(
                    (attachment: InvoiceAttachment) => {
                        return attachment.uid !== invoice_attachment_uid;
                    }
                );
                newState.invoices[action.payload.invoice_uid].attachments = newAttachmentsList;
            }

            return newState;
        }

        case "DELETE_INVOICE_SUCCESS":
            return {
                ...state,
                invoices: omit(state.invoices, action.pk),
            };
        case "DELETE_CREDITNOTE_SUCCESS":
            // remove credit note from invoice
            generatedFromInvoiceUid = state.creditNotes[action.pk]?.generated_from?.uid;
            return generatedFromInvoiceUid
                ? {
                      ...state,
                      creditNotes: omit(state.creditNotes, action.pk),
                      invoices: {
                          ...state.invoices,
                          [generatedFromInvoiceUid]: {
                              ...state.invoices?.[generatedFromInvoiceUid],
                              credit_notes: state.invoices?.[
                                  generatedFromInvoiceUid
                              ]?.credit_notes?.filter((uid: string) => uid !== action.pk),
                          },
                      },
                  }
                : state;
        case "ADD_CREDITNOTE_SUCCESS":
            createdCreditNote = Object.values(
                action.response.entities.creditNotes
            )[0] as CreditNote;
            generatedFromInvoiceUid = createdCreditNote.generated_from?.uid;
            return {
                ...mergeEntities(state, action.response.entities),
                invoices: generatedFromInvoiceUid
                    ? {
                          ...state.invoices,
                          [generatedFromInvoiceUid]: {
                              ...state.invoices[generatedFromInvoiceUid],
                              credit_notes: uniq([
                                  ...(state.invoices[generatedFromInvoiceUid].credit_notes ?? []),
                                  createdCreditNote.uid,
                              ]),
                          },
                      }
                    : {...state.invoices},
            };

        case "UPDATE_MERGED_LINE_GROUPS": {
            const mergedLineGroups = state.invoiceMergedLineGroups[action.transports_group.uid];
            if (mergedLineGroups) {
                newState = cloneDeep(state);
                newState.description = action.transports_group.description;
                return newState;
            }
            return state;
        }
        case "BULK-SET-CUSTOMER-TO-INVOICE_TRANSPORT_SUCCESS": {
            // Here we have to update only the transports that are in the store otherwise we'll add some partial transports in the store which will break the display of the transports
            const partialTransportsUpdated = action.response.transports_updated.filter(
                (transport: {uid: string; customer_to_invoice: InvoiceableCompany}) =>
                    !!state.transports?.[transport.uid]
            );
            const normalized = normalize(
                partialTransportsUpdated,
                new schema.Array(partialTransportSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        case "BULK-ADD-TAGS_TRANSPORT_SUCCESS": {
            // Here we have to update only the transports that are in the store otherwise we'll add some partial transports in the store which will break the display of the transports
            const partialTransportsUpdated = action.response.transports_updated.filter(
                (transport: {uid: string; tags: Tag[]}) => !!state.transports?.[transport.uid]
            );
            const normalized = normalize(
                partialTransportsUpdated,
                new schema.Array(partialTransportSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        case "BULK-REMOVE-TAGS_TRANSPORT_SUCCESS": {
            // Here we have to update only the transports that are in the store otherwise we'll add some partial transports in the store which will break the display of the transports
            const partialTransportsUpdated = action.response.transports_updated.filter(
                (transport: {uid: string; tags: Tag[]}) => !!state.transports?.[transport.uid]
            );
            const normalized = normalize(
                partialTransportsUpdated,
                new schema.Array(partialTransportSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        case "BULK-SET-INVOICE-ITEM_TRANSPORT_SUCCESS": {
            // Here we have to update only the transports that are in the store otherwise we'll add some partial transports in the store which will break the display of the transports
            const partialTransportsUpdated = action.response.transports_updated.filter(
                (transport: {
                    uid: string;
                    pricing_total_price: number | null;
                    quotation_total_price: number | null;
                }) => !!state.transports?.[transport.uid]
            );
            const normalized = normalize(
                partialTransportsUpdated,
                new schema.Array(partialTransportSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        case "BULK-SET-PRICING_TRANSPORT_SUCCESS": {
            // Here we have to update only the transports that are in the store otherwise we'll add some partial transports in the store which will break the display of the transports
            const partialTransportsUpdated = action.response.transports_updated.filter(
                (transport: {uid: string; pricing_total_price: number | null}) =>
                    !!state.transports?.[transport.uid]
            );
            const normalized = normalize(
                partialTransportsUpdated,
                new schema.Array(partialTransportSchema)
            );
            return mergeEntities(state, normalized.entities);
        }
        default:
            return null; // fallback to the default entities reducer
    }
}

export function getFullTransport(state: any, uid: string) {
    // @guidedtour[epic=redux, seq=9] Normalizr: denormalize
    // When we want to get a full object from the store, we need to denormalize it
    // We use the function `denormalize` from normalizr with the schema of the object to do this.
    return denormalize(state.transports[uid], transportSchema, state);
}
export function getFullTrip(state: any, uid: string) {
    return denormalize(state.schedulerTrips[uid], schedulerTripSchema, state);
}

function getEntitiesList(
    state: any,
    entities: Record<string, unknown>,
    uids: (string | number)[],
    schema: Schema<any>
) {
    return uids.reduce((acc, uid) => {
        // always ensure that uid exists in entities before denormalizing it
        if (entities[uid]) {
            // @ts-ignore
            acc.push(denormalize(entities[uid], schema, state));
        }
        return acc;
    }, []);
}
export function getTransportsList(state: any, uids: string[]): TransportListWeb[] {
    return getEntitiesList(state, state.transports, uids, transportSchema);
}
export function getUnplannedSegmentsList(
    state: any,
    uids: string[]
): RawCarrierCharteringSchedulerSegment[] {
    return getEntitiesList(state, state.schedulerSegments, uids, schedulerSegmentSchema);
}
export function getTripsList(state: any, uids: string[]): Trip[] {
    return getEntitiesList(state, state.schedulerTrips, uids, schedulerTripSchema);
}

export function getLogisticPointList(state: any, pks: number[]): LogisticPoint[] {
    return getEntitiesList(state, state.logisticPoints, pks, logisticPointSchema);
}

export function getAddressesList(state: any, uids: string[]): AddressFromAddressBook[] {
    return getEntitiesList(state, state.addresses, uids, addressSchema);
}

export function getCompaniesList(state: any, pks: string[]): Company[] {
    return getEntitiesList(state, state.companies, pks, companySchema);
}

export function getPartnersList(state: any, pks: string[]): Company[] {
    return getEntitiesList(state, state.partnersList, pks, companySchema);
}

export function getContactsList(state: any, uids: string[]): Contact[] {
    return getEntitiesList(state, state.contacts, uids, contactSchema);
}

export function getFullTrucker(state: any, uid: string) {
    return denormalize(state.truckers?.[uid], truckerSchema, state);
}

export function getTruckersList(state: any, pks: string[]): Trucker[] {
    return getEntitiesList(state, state.truckers, pks, truckerSchema);
}

export function getTruckerStatsList(state: any, pks: string[]) {
    return getEntitiesList(state, state.truckers, pks, truckerStatsSchema);
}

export function getManagersList(state: any, pks: string[]): Manager[] {
    return getEntitiesList(state, state.managers, pks, managerSchema);
}

export function getExportsList(state: any, pks: string[]): Export[] {
    return getEntitiesList(state, state.exports, pks, exportSchema);
}

export function getFullVehicle(state: any, uid: string) {
    return denormalize(state.vehicles?.items?.[uid], vehicleSchema, state);
}

export function getVehiclesList(state: any, pks: string[]): Vehicle[] {
    return getEntitiesList(state, state.vehicles, pks, vehicleSchema);
}

export function getFullTrailer(state: any, uid: string) {
    return denormalize(state.trailers?.items?.[uid], trailerSchema, state);
}

export function getTrailersList(state: any, pks: string[]): Trailer[] {
    return getEntitiesList(state, state.trailers, pks, trailerSchema);
}

export function getInvoicesList(state: any, uids: string[]): (Invoice | PartialInvoice)[] {
    return getEntitiesList(state, state.invoices, uids, invoiceSchema);
}

export function getCreditNotesList(state: any, uids: string[]): CreditNote[] {
    if (state.creditNotes === undefined) {
        return [];
    }
    return getEntitiesList(state, state.creditNotes, uids, creditNoteSchema);
}

export function getInvoice(
    state?: RootState["entities"],
    uid?: Invoice["uid"]
): Invoice | PartialInvoice | undefined {
    if (!state || !uid) {
        return undefined;
    }

    return denormalize(state.invoices?.[uid], invoiceSchema, state);
}
export function getCreditNote(
    state?: RootState["entities"],
    uid?: Invoice["uid"]
): CreditNote | CreditNoteLink | undefined {
    if (!state || !uid) {
        return undefined;
    }

    return denormalize(state.creditNotes?.[uid], creditNoteSchema, state);
}

export function getFleetItemsList(state: any, uids: string[]): FleetItem[] {
    return getEntitiesList(state, state["fleet-items"], uids, fleetItemSchema);
}

export function geRequestedVehiclesList(state: any, uids: string[]): RequestedVehicle[] {
    return getEntitiesList(state, state["requested-vehicles"], uids, requestedVehicleSchema);
}

export function getTagsList(state: any, uids: number[]): Tag[] {
    return getEntitiesList(state, state["tags"], uids, tagSchema);
}

export function getSiteSchedulerSharedActivitiesList(
    state: any,
    ids: string[]
): SiteSchedulerSharedActivity[] {
    return getEntitiesList(
        state,
        state["site-scheduler-shared-activities"],
        ids,
        siteSchedulerSharedActivitySchema
    );
}
