import {
    apiService,
    fetchAdd,
    fetchDelete,
    fetchDetailAction,
    fetchListAction,
    fetchRetrieve,
    fetchSearch,
    fetchUpdate,
} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {APIVersion, Tag, PurchaseCostLine} from "dashdoc-utils";
import {DistanceData, TelematicDistanceResponse} from "dashdoc-utils/dist/api/scopes/transports";
import isNil from "lodash.isnil";
import {normalize} from "normalizr";

import {BulkSetPricing} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetPricingForm";
import {
    TransportToCreateDeprecated,
    type TransportPost,
} from "app/features/transport/transport-form/transport-form.types";
import {SearchQuery} from "app/redux/reducers/searches";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import {partialTransportSchema, transportSchema} from "../schemas";

import {deleteSuccessAction} from "./base-actions";

import type {Site, Transport} from "app/types/transport";

export function fetchSearchTransports(queryName: string, query: any, page: number) {
    // we use the "web" namespace because its transport-list endpoint purposely doesn't return qualimatevents.
    return fetchSearch(
        "transports/list",
        "transport",
        transportSchema,
        queryName,
        query,
        page,
        "web",
        undefined,
        "POST"
    );
}

export function fetchSearchTransportsCount(query: any) {
    return fetchListAction(
        "transports",
        "transports",
        "list-count",
        "POST",
        undefined,
        {filters: query},
        undefined,
        undefined,
        "web"
    );
}

export function redoSearchTransports(queryName: string, query: any) {
    return function (dispatch: Function) {
        dispatch(fetchSearchTransports(queryName, query, 1));
    };
}

export function fetchRetrieveTransport(uid: string) {
    return fetchRetrieve(
        "transports",
        "transport",
        transportSchema,
        uid,
        undefined,
        "web",
        undefined,
        "?include_deleted=true"
    );
}

export function fetchRetrievePublicDelivery(uid: string) {
    return fetchRetrieve(
        "public-delivery",
        "transport",
        transportSchema,
        uid,
        undefined,
        "web",
        true
    );
}

export function fetchPublicTokenUserInfo() {
    return apiService.get("public-token-user-info/", {
        apiVersion: "web",
    });
}

export function fetchRetrievePublicTransport(uid: string) {
    return fetchRetrieve(
        "public-portal-transport",
        "transport",
        transportSchema,
        uid,
        undefined,
        "web",
        true
    );
}

export function fetchListPublicTransports() {
    return apiService.get("public-portal-transport/", {
        apiVersion: "web",
    });
}

export function fetchAddTransport(
    transport: Partial<Transport> | TransportToCreateDeprecated | TransportPost,
    apiVersion: APIVersion = "v4"
) {
    return fetchAdd(
        "transports",
        "transport",
        transport,
        transportSchema,
        t("components.transportSuccessfullyCreated"),
        undefined,
        apiVersion
    );
}

export function fetchAddTransportTemplate(
    transport: Partial<Transport> | TransportToCreateDeprecated,
    apiVersion: APIVersion = "v4"
) {
    return fetchAdd(
        "transport-templates",
        "transportTemplate",
        transport,
        transportSchema,
        t("components.transportTemplateSuccessfullyCreated"),
        undefined,
        apiVersion
    );
}

export function fetchUpdateTransportTemplate(
    transport: Partial<Transport> | TransportToCreateDeprecated,
    uid: string,
    apiVersion: APIVersion = "v4"
) {
    return fetchUpdate({
        urlBase: "transport-templates",
        objName: "transportTemplate",
        uid: uid,
        obj: transport,
        objSchema: transportSchema,
        successMessage: t("components.transportTemplateSuccessfullyEdited"),
        apiVersion: apiVersion,
    });
}

export function fetchUpdateTransport(transport: Partial<Transport>, uid: string) {
    return fetchUpdate({
        urlBase: "transports",
        objName: "transport",
        uid: uid,
        obj: transport,
        objSchema: transportSchema,
        successMessage: t("components.transportSuccessfullyEdited"),
    });
}

export function fetchDeleteTransport(uid: string) {
    return fetchDelete(
        "transports",
        "transport",
        uid,
        t("components.transportSuccessfullyDeleted"),
        undefined,
        undefined,
        undefined
    );
}

export function fetchDeleteTransportTemplate(uid: string) {
    return fetchDelete(
        "transport-templates",
        "transportTemplate",
        uid,
        t("components.transportTemplateSuccessfullyDeleted"),
        undefined,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchRestoreTransport(uid: Transport["uid"]) {
    return fetchDetailAction(
        "transports",
        "transport",
        "restore",
        "POST",
        null,
        uid,
        {},
        transportSchema,
        t("components.transportSuccessfullyRestored"),
        undefined
    );
}

export function fetchArchiveTransports(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "archive",
        "POST",
        filters,
        {},
        t("components.transportsSuccessfullyArchived"),
        undefined
    );
}

export function fetchUnarchiveTransports(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "unarchive",
        "POST",
        filters,
        {},
        t("components.transportsSuccessfullyUnarchived"),
        undefined
    );
}

export function fetchCheckOrders(payload: any, successMessage: string | undefined = undefined) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-checked-by-shipper",
        "POST",
        null,
        payload,
        successMessage,
        undefined,
        "web"
    );
}

export function fetchUncheckOrders(payload: any, successMessage: string | undefined = undefined) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-unchecked-by-shipper",
        "POST",
        null,
        payload,
        successMessage,
        undefined,
        "web"
    );
}

export function fetchSendTruckerNotification(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "send-to-trucker",
        "POST",
        filters,
        undefined,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchAssignTransports(filters: any, params: any) {
    return fetchListAction(
        "transports",
        "transport",
        "assign",
        "POST",
        filters,
        params,
        t("components.transportsSuccessfullyPlanned"),
        undefined
    );
}

export function fetchConfirmTransport(transportUid: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "confirm",
        "POST",
        null,
        transportUid,
        {},
        transportSchema,
        t("components.orderSuccessfullyAccepted"),
        undefined
    );
}

export function fetchConfirmTransports(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "confirm",
        "POST",
        filters,
        {},
        t("common.success"),
        undefined
    );
}

export function fetchCancelTransport(transportUid: string, cancelReason: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "cancel",
        "POST",
        null,
        transportUid,
        {cancel_reason: cancelReason},
        transportSchema,
        t("components.orderSuccessfullyCanceled"),
        undefined
    );
}

export function fetchDeleteTransports(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        null,
        "DELETE",
        filters,
        {},
        undefined,
        undefined
    );
}

export function removeTransportFromState(uid: Transport["uid"]) {
    return function (dispatch: Function) {
        dispatch(deleteSuccessAction("DELETE", "transport", uid));
    };
}

export function fetchDeclineTransport(transportUid: string, comment: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "decline",
        "POST",
        null,
        transportUid,
        {decline_reason: comment},
        transportSchema,
        t("components.orderSuccessfullyDeclined"),
        undefined
    );
}

export function fetchDeclineTransports(filters: any, declineReason: string) {
    return fetchListAction(
        "transports",
        "transport",
        "decline",
        "POST",
        filters,
        {decline_reason: declineReason},
        t("common.success"),
        undefined
    );
}

export function fetchSetTransportsStatusDone(
    filters: any,
    payload: {
        last_activity_date_by_transport_uid: {
            [uid: Transport["uid"]]: string;
        };
    } | null = null
) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-done",
        "POST",
        filters,
        payload,
        null,
        undefined
    );
}

export function fetchSetTransportsStatusVerified(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-verified",
        "POST",
        filters,
        null,
        t("components.transportsSuccessfullyMarkedVerified"),
        undefined
    );
}

export function fetchSetSingleTransportStatusVerified(transportUid: string) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-verified",
        "POST",
        {uid: transportUid},
        null,
        t("components.transportSuccessfullyMarkedVerified"),
        undefined
    );
}

export function fetchSetTransportsStatusInvoiced(filters: any, invoiceNumber: string) {
    return fetchListAction("transports", "transport", "mark-invoiced", "POST", filters, {
        invoice_number: invoiceNumber,
    });
}
export function fetchSetInvoiceNumberInBulk(filters: any, invoiceNumber: string) {
    return fetchListAction(
        "transports",
        "transport",
        "set-invoice-number",
        "POST",
        filters,
        {
            invoice_number: invoiceNumber,
        },
        undefined,
        undefined,
        "web"
    );
}

export function fetchSetSingleTransportStatusInvoiced(
    transportUid: string,
    payload: {
        invoice_number?: string;
        customer_to_invoice?: {pk: number};
    },
    options?: {successMessage?: string}
) {
    const successMessage =
        options?.successMessage || t("components.transportSuccessfullyInvoiced");
    return fetchDetailAction(
        "transports",
        "transport",
        "mark-invoiced",
        "POST",
        null,
        transportUid,
        payload,
        transportSchema,
        successMessage,
        undefined
    );
}

export function fetchSetTransportsStatusPaid(filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-paid",
        "POST",
        filters,
        null,
        null,
        undefined,
        "web"
    );
}

export function fetchSetTransportUnverified(transportUid: string) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-unverified",
        "POST",
        {uid__in: transportUid},
        null,
        t("common.updateSaved"),
        undefined
    );
}

export function fetchSetTransportUnpaid(transportUid: string) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-unpaid",
        "POST",
        {uid__in: transportUid},
        null,
        t("common.updateSaved"),
        undefined
    );
}

export function fetchSetTransportUninvoiced(transportUid: string) {
    return fetchListAction(
        "transports",
        "transport",
        "mark-uninvoiced",
        "POST",
        {uid__in: transportUid},
        null,
        t("common.updateSaved"),
        undefined
    );
}

export function fetchSetTransportCustomerToInvoice(
    transportUid: string,
    invoicingCompanyPk: number | null
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-customer-to-invoice",
        "POST",
        null,
        transportUid,
        {customer_to_invoice_id: invoicingCompanyPk},
        partialTransportSchema, // This is safe because the response only returns the status_updates fields and the customer_to_invoice
        t("components.transportCustomerToInvoiceSet"),
        undefined,
        "web"
    );
}

/**
 * @deprecated to delete with betterCompanyRoles FF
 */
export function fetchSetTransportCarrierAddress(
    transportUid: string,
    carrierAddressPk: number | null,
    analytics: object
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-carrier-address",
        "POST",
        null,
        transportUid,
        {carrier_address: carrierAddressPk, analytics},
        partialTransportSchema, // This is safe because the response only returns the carrier address
        t("components.transportCarrierAddressSet"),
        undefined
    );
}

export function fetchSetTransportCarrier(
    transportUid: string,
    carrierPk: number | null,
    analytics: object
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-carrier",
        "POST",
        null,
        transportUid,
        {carrier: carrierPk, analytics},
        partialTransportSchema, // This is safe because the response only returns the carrier address
        t("components.transportCarrierAddressSet"),
        undefined,
        "web"
    );
}

/**
 * @deprecated to delete with betterCompanyRoles FF
 */
export function fetchSetTransportDraftCarrierAddress(
    transportUid: string,
    carrierAddressPk: number | null,
    analytics: object
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-draft-carrier-address",
        "POST",
        null,
        transportUid,
        {carrier_address: carrierAddressPk, analytics},
        partialTransportSchema, // This is safe because the response only returns the carrier address
        t("components.transportCarrierAddressSet"),
        undefined
    );
}

export function fetchSetTransportDraftCarrier(
    transportUid: string,
    carrierPk: number | null,
    analytics: object
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-draft-carrier",
        "POST",
        null,
        transportUid,
        {carrier: carrierPk, analytics},
        partialTransportSchema, // This is safe because the response only returns the carrier address
        t("components.transportCarrierAddressSet"),
        undefined,
        "web"
    );
}

/**
 * @deprecated to delete with betterCompanyRoles FF
 */
export function fetchSetTransportShipperAddress(transportUid: string, shipperAddressPk: number) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-shipper-address",
        "POST",
        null,
        transportUid,
        {shipper_address: shipperAddressPk},
        partialTransportSchema, // This is safe because the response only returns the shipper address & the deliveries
        t("components.transportShipperAddressSet"),
        undefined
    );
}

export function fetchSetTransportShipper(transportUid: string, shipperPk: number) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-shipper",
        "POST",
        null,
        transportUid,
        {shipper: shipperPk},
        partialTransportSchema, // This is safe because the response only returns the shipper address & the deliveries
        t("components.transportShipperAddressSet"),
        undefined,
        "web"
    );
}

export function fetchSetInvoiceNumber(transportUid: string, invoiceNumber: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-invoice-number",
        "POST",
        null,
        transportUid,
        {invoice_number: invoiceNumber},
        partialTransportSchema, // This is safe because the response only the invoice number
        t("components.transportInvoiceNumberSet"),
        undefined
    );
}

export function fetchSetShipperReference(transportUid: string, shipperReference: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-shipper-reference",
        "POST",
        null,
        transportUid,
        {reference: shipperReference},
        partialTransportSchema, // This is safe because the response only returns the status_updates/deliveries fields, not the messages/segments
        t("components.transportshipperReferenceSet"),
        undefined
    );
}

export function fetchSetCarrierReference(transportUid: string, carrierReference: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-carrier-reference",
        "POST",
        null,
        transportUid,
        {reference: carrierReference},
        partialTransportSchema, // This is safe because the response only returns the status_updates fields, not the deliveries/messages/segments
        t("components.transportcarrierReferenceSet"),
        undefined
    );
}

export function fetchSetTransportRequiresWashing(transportUid: string, requiresWashing: boolean) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-requires-washing",
        "POST",
        null,
        transportUid,
        {requires_washing: requiresWashing},
        partialTransportSchema, // This is safe because the response only returns the status_updates fields, not the deliveries/messages/segments
        t("components.transportRequiresWashingSet"),
        undefined
    );
}

export function fetchSetTransportIsMultipleCompartments(
    transportUid: string,
    isMultiCompartments: boolean
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-is-multiple-compartments",
        "POST",
        null,
        transportUid,
        {is_multiple_compartments: isMultiCompartments},
        partialTransportSchema, // This is safe because the response only returns is_multiple_compartment
        t("components.transportIsMultipleCompartmentSet"),
        undefined
    );
}

export function fetchSetTransportRequestedVehicle(
    transportUid: string,
    requestedVehicleLabel: string
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-requested-vehicle",
        "POST",
        null,
        transportUid,
        {
            requested_vehicle: requestedVehicleLabel,
        },
        partialTransportSchema, // This is safe because the response only returns the events and the documents
        t("components.transportRequestedVehicleSet"),
        undefined,
        "web"
    );
}

export function fetchSetTransportInstructions(transportUid: string, instructions: string) {
    return fetchDetailAction(
        "transports",
        "transport",
        "set-instructions",
        "POST",
        null,
        transportUid,
        {instructions: instructions},
        partialTransportSchema, // This is safe because the response only returns the instructions
        t("components.transportInstructionsSet"),
        undefined
    );
}

export function fetchDeleteTransportSites(transportUid: string, sitesUids: string[]) {
    return fetchDetailAction(
        "transports",
        "transport",
        "sites",
        "DELETE",
        {uid__in: sitesUids},
        transportUid,
        null,
        transportSchema,
        t("components.transportSuccessfullyEdited"),
        undefined
    );
}

export function fetchAddTransportSite(
    transportUid: string,
    category: Extract<Site["category"], "loading" | "unloading">,
    siteUidBeforeWhichToInsertNewSite: string | null
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "sites",
        "POST",
        {},
        transportUid,
        {category, site_uid_before_which_to_insert_new_site: siteUidBeforeWhichToInsertNewSite},
        transportSchema,
        t("components.transportSuccessfullyEdited"),
        undefined
    );
}
export async function fetchBulkAddTagsToTransport(
    tags: Tag[],
    selectedTransportsQuery: SearchQuery
) {
    try {
        if (selectedTransportsQuery) {
            const response = await apiService.post(
                `/transports/bulk-add-tags/?${queryService.toQueryString(
                    selectedTransportsQuery
                )}`,
                {
                    tags: tags,
                },
                {apiVersion: "web"}
            );
            toast.success(t("common.success"));
            return function (dispatch: Function) {
                dispatch({
                    type: `BULK-ADD-TAGS_TRANSPORT_SUCCESS`,
                    query: selectedTransportsQuery,
                    response,
                });
            };
        } else {
            toast.error(t("common.error"));
            throw new Error("No transports selected");
        }
    } catch (error) {
        toast.error(t("common.error"));
        throw error;
    }
}

export async function fetchBulkRemoveTagsFromTransport(
    tags: Tag[],
    selectedTransportsQuery: SearchQuery
) {
    try {
        if (selectedTransportsQuery) {
            const response = await apiService.post(
                `/transports/bulk-remove-tags/?${queryService.toQueryString(
                    selectedTransportsQuery
                )}`,
                {
                    tags: tags,
                },
                {apiVersion: "web"}
            );
            toast.success(t("common.success"));
            return function (dispatch: Function) {
                dispatch({
                    type: `BULK-ADD-TAGS_TRANSPORT_SUCCESS`,
                    query: selectedTransportsQuery,
                    response,
                });
            };
        } else {
            toast.error(t("common.error"));
            throw new Error("No transports selected");
        }
    } catch (error) {
        toast.error(t("common.error"));
        throw error;
    }
}

export async function fetchAddTransportDelivery(payload: {
    transport_uid: string;
    origin_address: {pk: number};
    destination_address: {pk: number};
    site_uid_before_which_to_insert_new_sites: string | null;
}) {
    try {
        const response = await apiService.post("deliveries/", payload);
        toast.success(t("components.transportSuccessfullyEdited"));
        return function (dispatch: Function) {
            dispatch({
                type: "UPDATE_ENTITIES_SUCCESS",
                response: normalize(response, transportSchema),
            });
        };
    } catch (error) {
        toast.error(t("common.error"));
        throw error;
    }
}

export function fetchBulkInvoiceTransports(
    query: Record<string, any>,
    ungroupInvoicesForTransportsUids?: Transport["uid"][],
    transportsToAddToInvoices?: Record<Invoice["uid"], Transport["uid"][]>
) {
    return fetchListAction(
        "transports",
        "transports",
        "bulk-invoice",
        "POST",
        undefined,
        {
            filters: queryService.toQueryString(query),
            ungroup_invoices_for_transports_uids: ungroupInvoicesForTransportsUids,
            transports_to_add_to_invoices: transportsToAddToInvoices,
        },
        t("invoices.invoicesSuccessfullyCreated"),
        null,
        "v4"
    );
}

export function fetchUpdateTransportTags(transportUid: string, tags: Transport["tags"]) {
    return async (dispatch: Function) => {
        try {
            const response = await apiService.patch(`transports/${transportUid}/tags/`, {tags});
            toast.success(t("components.transportSuccessfullyEdited"));
            dispatch(fetchPartialTransportUpdateAction(transportUid, {tags: response}));

            return response;
        } catch (error) {
            toast.error(t("common.error"));

            throw error;
        }
    };
}

export function fetchRefreshCarbonFootprint(
    transportUid: string,
    {
        distance = null,
        transportOperationCategory = undefined,
    }: {
        distance?: number | null;
        transportOperationCategory?: Transport["transport_operation_category"];
    } = {}
) {
    return async (dispatch: Function) => {
        try {
            const response = await apiService.Transports.refreshCarbonFootprint(
                transportUid,
                {},
                {
                    distance,
                    transport_operation_category_uid: transportOperationCategory?.uid || undefined,
                }
            );
            toast.success(t("components.carbonFootprint.refreshSuccess"));
            dispatch(
                fetchPartialTransportUpdateAction(transportUid, {
                    user_carbon_footprint: response.manual_method.emission_value,
                    estimated_carbon_footprint: response.estimated_method.emission_value,
                    transport_operation_category: transportOperationCategory,
                })
            );

            return response;
        } catch (error) {
            toast.error(t("components.carbonFootprint.refreshFail"));

            throw error;
        }
    };
}

export function fetchSetCarbonFootprint(transportUid: string, userCarbonFootprint: number | null) {
    return async (dispatch: Function) => {
        try {
            const response = await apiService.Transports.setCarbonFootprint(transportUid, {
                user_carbon_footprint: userCarbonFootprint,
            });
            toast.success(t("common.updateSaved"));
            dispatch(fetchPartialTransportUpdateAction(transportUid, response));

            return response;
        } catch (error) {
            toast.error(t("common.error"));

            throw error;
        }
    };
}

export function fetchConfirmTransportDraftAssigned(transportFilters: SearchQuery) {
    return async (dispatch: Function) => {
        try {
            const queryParams = queryService.toQueryString(transportFilters);
            const result = await apiService.post(
                `transports/confirm-draft-assignation/?${queryParams}`
            );
            for (const transportUpdate of result.transports_updates) {
                dispatch(fetchPartialTransportUpdateAction(transportUpdate.uid, transportUpdate));
            }
        } catch (error) {
            toast.error(t("common.error"));
            throw error;
        }
    };
}

export function fetchRemoveDraftCarrier(transportUid: Transport["uid"]) {
    return async (dispatch: Function) => {
        try {
            const result = await apiService.post(
                `transports/${transportUid}/set-draft-carrier-address/`,
                {
                    carrier_address: null,
                }
            );
            dispatch(fetchPartialTransportUpdateAction(result.uid, result));
        } catch (error) {
            toast.error(t("common.error"));
            throw error;
        }
    };
}

export const UPDATE_PARTIAL_TRANSPORT_SUCCESS = "UPDATE_PARTIAL_TRANSPORT_SUCCESS";

export const UPDATE_TRANSPORT_ESTIMATED_DISTANCES = "UPDATE_TRANSPORT_ESTIMATED_DISTANCES";
export function fetchPartialTransportUpdateAction(
    transportUid: string,
    payload: Partial<Transport>
) {
    return {
        type: UPDATE_PARTIAL_TRANSPORT_SUCCESS,
        payload: {
            uid: transportUid,
            ...payload,
        },
    };
}

export function fetchUpdateTransportDistances(
    transportUid: string,
    total_estimated_distance: number | null,
    segment_distances: Record<string, Partial<DistanceData>>
) {
    // Data is from Pusher
    return {
        type: "UPDATE_TRANSPORT_ESTIMATED_DISTANCES",
        payload: {
            uid: transportUid,
            total_estimated_distance: total_estimated_distance,
            segment_distances: segment_distances,
        },
    };
}

export function fetchRefreshDistance(transportUid: string) {
    return async (dispatch: Function) => {
        try {
            const response = await apiService.Transports.refreshDistance(transportUid);
            toast.success(t("components.distance.refreshSuccess"));
            const segmentDistanceByUid: Record<string, Partial<DistanceData>> = {};
            for (const segment of response.segments) {
                segmentDistanceByUid[segment.uid] = segment;
            }
            dispatch(
                fetchUpdateTransportDistances(
                    transportUid,
                    response.estimated_distance,
                    segmentDistanceByUid
                )
            );

            return response;
        } catch (error) {
            toast.error(t("common.error"));

            throw error;
        }
    };
}

export function fetchUpdateTransportTelematic(
    transportUid: string,
    telematic_distance: TelematicDistanceResponse
) {
    // Data is from API telematics/distance

    let totalDistance = 0;
    for (const segmentData of Object.values(telematic_distance.segment_distances)) {
        if (!isNil(segmentData.user_distance)) {
            totalDistance += segmentData.user_distance;
        } else if (!isNil(segmentData.telematic_distance)) {
            totalDistance += segmentData.telematic_distance;
        } else if (!isNil(segmentData.estimated_distance)) {
            totalDistance += segmentData.estimated_distance;
        } else {
            // @ts-ignore
            totalDistance = null;
            break;
        }
    }

    let segment_distances: Record<string, DistanceData> = {};
    telematic_distance.segment_distances.forEach((distances) => {
        segment_distances[distances.uid] = {
            estimated_distance: distances.estimated_distance,
            telematic_distance: distances.telematic_distance,
            user_distance: distances.user_distance,
            destination_mileage: distances.destination_mileage,
            origin_mileage: distances.origin_mileage,
        };
    });

    return {
        type: "UPDATE_TRANSPORT_ESTIMATED_DISTANCES",
        payload: {
            uid: transportUid,
            total_estimated_distance: totalDistance,
            segment_distances,
        },
    };
}

export function fetchSubcontractOrdersPrice(filters: any) {
    return fetchListAction(
        "transports",
        "totalSubcontractOrderPrice",
        "total-subcontract-order-price",
        "GET",
        filters,
        undefined,
        undefined,
        undefined,
        "web"
    );
}

export function fetchBulkSetCustomerToInvoice(customerToInvoiceId: number, filters: any) {
    return fetchListAction(
        "transports",
        "transport",
        "bulk-set-customer-to-invoice",
        "POST",
        filters,
        {customer_to_invoice_id: customerToInvoiceId},
        null,
        undefined,
        "web"
    );
}

export function fetchBulkSetInvoiceItem(invoiceItemUid: string, filters: SearchQuery) {
    return fetchListAction(
        "transports",
        "transport",
        "bulk-set-invoice-item",
        "POST",
        null,
        {invoice_item_uid: invoiceItemUid, filters: queryService.toQueryString(filters)},
        null,
        undefined,
        "web"
    );
}

export function fetchBulkSetPricing(pricing: BulkSetPricing, filters: SearchQuery) {
    return fetchListAction(
        "transports",
        "transport",
        "bulk-set-pricing",
        "POST",
        null,
        {pricing: pricing, filters: queryService.toQueryString(filters)},
        null,
        undefined,
        "web"
    );
}

export function fetchUpsertPurchaseCost(
    transportUid: string,
    purchaseCostLines: PurchaseCostLine[]
) {
    return fetchDetailAction(
        "transports",
        "transport",
        "purchase-cost",
        "POST",
        null,
        transportUid,
        {lines: purchaseCostLines},
        null,
        undefined,
        undefined,
        "web"
    );
}
