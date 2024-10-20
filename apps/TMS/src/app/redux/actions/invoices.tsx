import {
    apiService,
    fetchAdd,
    fetchDelete,
    fetchDetailAction,
    fetchListAction,
    fetchRetrieve,
    fetchSearch,
    fetchUpdate,
    storeService,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {MessageDocumentType} from "dashdoc-utils";
import {normalize} from "normalizr";

import {addPusherEventLegacy} from "app/redux/actions/realtime";
import {MarkPaidInvoicePayload} from "app/services/invoicing/paymentMethod.service";
import {invoiceApiService} from "app/taxation/invoicing/services/invoicesApi.service";
import {toastInvoiceLineCreationError} from "app/taxation/invoicing/services/invoicingToasts";
import {UpdateTrackingInvoicePaymentPayload} from "app/taxation/invoicing/types/trackingInvoicePayment.types";

import {RootState} from "../reducers";
import {
    InvoiceCommunicationStatusPayload,
    InvoiceFileUpdatedPayload,
    InvoicePayload,
} from "../reducers/realtime";
import {SearchQuery} from "../reducers/searches";
import {
    connectorSchema,
    creditNoteSchema,
    invoiceLineGroupSchema,
    invoiceLineSchema,
    invoiceMergedLineGroupsSchema,
    invoiceSchema,
} from "../schemas";

import type {
    AddOrUpdateInvoiceLine,
    Invoice,
    InvoiceLineGroup,
    InvoiceReminderPayload,
    PatchInvoiceMergeBy,
    ShareInvoicePayload,
} from "app/taxation/invoicing/types/invoice.types";
import type {InvoiceLine} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

export function fetchRetrieveInvoice(invoiceUid: string) {
    return fetchRetrieve("invoices", "invoice", invoiceSchema, invoiceUid, "v4");
}

export function fetchRetrieveSharedInvoice(invoiceUid: string) {
    const base_action = "RETRIEVE_ENTITIES";
    return async (dispatch: Function) => {
        dispatch({type: base_action});

        try {
            const invoice = await invoiceApiService.getSharedInvoice(invoiceUid);
            const response = normalize({...invoice, __partial: false}, invoiceSchema);
            dispatch({type: base_action + "_SUCCESS", response});
            return invoice;
        } catch (error) {
            dispatch({type: base_action + "_ERROR", action: error});
            throw error;
        }
    };
}

export function fetchSearchInvoices(
    queryName: string,
    query: any,
    page: number | {fromPage: number; toPage: number}
) {
    return fetchSearch("invoices", "invoice", invoiceSchema, queryName, query, page, "web");
}

export function fetchSearchCreditNotes(
    queryName: string,
    query: any,
    page: number | {fromPage: number; toPage: number}
) {
    return fetchSearch(
        "credit-notes",
        "creditNotes",
        creditNoteSchema,
        queryName,
        query,
        page,
        "web"
    );
}

/**
 * Action to load the InvoicingConnectorAuthenticated in the store.
 * We abort this action when the InvoicingConnectorAuthenticated is already loading/loaded.
 * We can use this action in a component render safely.
 */
export function loadInvoicingConnectorAuthenticated() {
    if (storeService.getState<RootState>().invoicingConnectorLoading) {
        return () => {
            // nothing to do, loading already in progress
        };
    }
    if (storeService.getState<RootState>().invoicingConnectorLoaded) {
        return () => {
            // nothing to do, already loaded
        };
    }
    return fetchIsInvoicingConnectorAuthenticated();
}

export function fetchGetInvoicingConnectors() {
    return fetchListAction(
        "invoices",
        "invoicingConnector",
        "connector",
        "GET",
        null,
        null,
        null,
        null,
        "v4"
    );
}

export function fetchIsInvoicingConnectorAuthenticated() {
    return fetchListAction(
        "invoices/connector",
        "invoicingConnector",
        "is-authenticated",
        "GET",
        null,
        null,
        null,
        () => {}, // disable toast error
        "v4"
    );
}

export function fetchCreateInvoicingConnector(
    data_source: string,
    parameters: any,
    credentials: any
) {
    const payload = {
        data_source: data_source,
        parameters: parameters,
        credentials: credentials,
    };

    return fetchAdd(
        "invoices/connector",
        "invoicingConnector",
        payload,
        connectorSchema,
        t("settings.invoicing.added"),
        undefined,
        "v4"
    );
}

export function fetchRemoveInvoicingConnector() {
    return fetchListAction(
        "invoices/connector",
        "invoicingConnector",
        null,
        "DELETE",
        null,
        null,
        undefined,
        undefined,
        "v4"
    );
}

export function fetchRequestOAuthToken(
    authorization_code: string,
    state: string,
    extra: {[index: string]: string}
) {
    return fetchListAction(
        "invoices/connector",
        "invoicingConnector",
        "request-oauth-token",
        "GET",
        {
            authorization_code: authorization_code,
            state: state,
            ...extra,
        },
        null,

        t("invoices.successfullyAuthenticated"),
        undefined,
        "v4"
    );
}

export function fetchSynchronizeWithThirdParty() {
    return fetchListAction(
        "invoices/connector",
        "invoicingConnector",
        "synchronize",
        "POST",
        null,
        null,
        t("settings.invoicing.synchronizationWithThirdPartySuccessful"),
        undefined,
        "v4"
    );
}

export function fetchSearchInvoiceItems(query: any, page: number) {
    return fetchListAction(
        "invoice-item-catalog",
        "invoiceItem",
        "selectable-invoice-items",
        "GET",
        {
            search: query,
            page: page,
        },
        null,
        null,
        t("filter.error.couldNotFetchInvoiceItems"),
        "web"
    );
}

export function fetchPatchInvoiceFile(invoiceUid: string, file: File) {
    const base_action = "UPDATE_ENTITIES";
    return async (dispatch: Function) => {
        dispatch({type: base_action});

        try {
            const patchResponse = await invoiceApiService.patchFile(invoiceUid, file);
            const invoice = {uid: invoiceUid, ...patchResponse};
            const response = normalize(invoice, invoiceSchema);
            dispatch({type: base_action + "_SUCCESS", response});
            return invoice;
        } catch (error) {
            dispatch({type: base_action + "_ERROR", action: error});
            throw error;
        }
    };
}

export function fetchMarkInvoicesFinalBulk(
    filters: SearchQuery,
    documentNumber: Invoice["document_number"],
    invoicingDate: Invoice["invoicing_date"] | undefined,
    dueDateToSubmit: Invoice["due_date"] | undefined
) {
    return fetchListAction(
        "invoices",
        "invoice",
        "bulk-mark-final",
        "POST",
        filters,
        {
            document_number: documentNumber,
            invoicing_date: invoicingDate,
            due_date: dueDateToSubmit,
        },
        null,
        null,
        "v4"
    );
}

export function fetchMarkInvoicesPaidBulk(filters: SearchQuery, payload: MarkPaidInvoicePayload) {
    return fetchListAction(
        "invoices",
        "invoice",
        "bulk-mark-paid",
        "POST",
        filters,
        payload,
        null,
        null,
        "v4"
    );
}

export function fetchBulkShareInvoices(filters: SearchQuery, payload: any) {
    return fetchListAction(
        "invoices",
        "invoice",
        "bulk-share",
        "POST",
        filters,
        payload,
        null,
        null,
        "web"
    );
}

export function fetchBulkReminderInvoices(
    filters: SearchQuery,
    payload: {sending_type: "email_per_invoice" | "email_per_debtor"}
) {
    return fetchListAction(
        "invoices",
        "invoice",
        "bulk-reminder",
        "POST",
        filters,
        payload,
        null,
        null,
        "web"
    );
}

export function fetchBulkShareCreditNotes(filters: SearchQuery) {
    return fetchListAction(
        "credit-notes",
        "creditNotes",
        "bulk-share",
        "POST",
        filters,
        null,
        null,
        null,
        "web"
    );
}

export function fetchMarkInvoicePaid(invoiceUid: Invoice["uid"], payload: MarkPaidInvoicePayload) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "mark-paid",
        "POST",
        null,
        invoiceUid,
        payload,
        invoiceSchema,
        t("invoices.invoiceSuccessfullyMarkedPaid"),
        t("invoices.error.couldNotMarkInvoicePaid"),
        "v4",
        "mark-invoice-paid-success-toast",
        "mark-invoice-paid-error-toast"
    );
}

export function fetchMarkInvoiceNotFinal(invoiceUid: Invoice["uid"]) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "mark-not-final",
        "POST",
        null,
        invoiceUid,
        null,
        invoiceSchema,
        t("invoices.invoiceSuccessfullyMarkedNotFinal"),
        t("invoices.error.couldNotMarkInvoiceNotFinal"),
        "v4"
    );
}

export function fetchMarkInvoiceNotPaid(invoiceUid: Invoice["uid"]) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "mark-not-paid",
        "POST",
        null,
        invoiceUid,
        null,
        invoiceSchema,
        t("invoices.invoiceSuccessfullyMarkedNotPaid"),
        t("invoices.error.couldNotMarkInvoiceNotPaid"),
        "v4"
    );
}

export function fetchInvoiceDocumentsMetadata(invoiceUid: Invoice["uid"]) {
    return fetchListAction(
        "invoice-documents-export",
        "invoice-documents",
        "get-metadata",
        "GET",
        {invoice_uid: invoiceUid},
        null,
        null,
        null,
        "v4"
    );
}

export function fetchExportInvoiceDocuments(
    invoiceUid: Invoice["uid"],
    filename: string,
    selectedDocumentTypes: MessageDocumentType[],
    includeInvoiceAttachments: boolean
) {
    return fetchListAction(
        "invoice-documents-export",
        "invoice-documents",
        "export",
        "POST",
        null,
        {
            invoice_uid: invoiceUid,
            export_name: filename,
            document_types: selectedDocumentTypes,
            include_invoice_attachments: includeInvoiceAttachments,
        },
        t("common.exportScheduled"),
        null,
        "v4"
    );
}

export function fetchExportInvoiceDocumentsPublic(
    invoiceUid: Invoice["uid"],
    filename: string,
    selectedDocumentTypes: MessageDocumentType[],
    includeInvoiceAttachments: boolean
) {
    return fetchListAction(
        "invoice-documents-export",
        "invoice-documents",
        "public-export",
        "POST",
        null,
        {
            invoice_uid: invoiceUid,
            export_name: filename,
            document_types: selectedDocumentTypes,
            include_invoice_attachments: includeInvoiceAttachments,
        },
        null,
        null,
        "v4"
    );
}

export const INVOICE_FILE_UPDATED_EVENT_SUCCESS = "INVOICE_FILE_UPDATED_EVENT_SUCCESS";
export function fetchInvoiceFileUpdatedEvent(invoiceFileUpdatedEvent: InvoiceFileUpdatedPayload) {
    return (dispatch: Function) => {
        dispatch({type: INVOICE_FILE_UPDATED_EVENT_SUCCESS, payload: invoiceFileUpdatedEvent});
        return invoiceFileUpdatedEvent;
    };
}

export const INVOICE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS =
    "INVOICE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS";
export function fetchInvoiceCommunicationStatusUpdatedEvent(
    invoiceCommunicationStatusEvent: InvoiceCommunicationStatusPayload
) {
    return (dispatch: Function) => {
        dispatch({
            type: INVOICE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS,
            payload: invoiceCommunicationStatusEvent,
        });
        return invoiceCommunicationStatusEvent;
    };
}

export const UPDATE_INVOICE = "UPDATE_INVOICE";
export const UPDATE_INVOICE_SUCCESS = "UPDATE_INVOICE_SUCCESS";
export const UPDATE_INVOICE_ERROR = "UPDATE_INVOICE_ERROR";
export type UpdateInvoicePayload = Partial<
    Invoice & {template_uid: string | null} & {
        bank_information_uid: string;
    }
>;
export function fetchUpdateInvoice(invoiceUid: string, payload: UpdateInvoicePayload) {
    return async (dispatch: Function) => {
        dispatch({type: UPDATE_INVOICE});

        try {
            const response = await invoiceApiService.patch(invoiceUid, {data: payload});
            const normalizedResponse = normalize(response, invoiceSchema);

            dispatch({
                type: UPDATE_INVOICE_SUCCESS,
                response: normalizedResponse,
            });
            toast.success(t("components.invoiceSuccessfullyUpdated"));
            return response;
        } catch (error) {
            dispatch({type: UPDATE_INVOICE_ERROR, action: error});
            toast.error(t("components.invoiceUpdateFailure"));
            throw error;
        }
    };
}

export function fetchUpdateInvoiceLineGroupDescription(
    invoiceLineGroupId: InvoiceLineGroup["id"],
    description: string
) {
    const payload = {description: description};
    return fetchUpdate({
        urlBase: "invoice-line-groups",
        objName: "invoice",
        uid: invoiceLineGroupId.toString(),
        obj: payload,
        objSchema: invoiceLineGroupSchema,
        successMessage: t("invoices.invoiceSuccessfullyUpdated"),
        errorMessage: t("invoices.error.couldNotUpdateInvoice"),
        apiVersion: "v4",
    });
}

export function fetchUpdateMergeLineGroups(
    mergedLineGroupsUID: string,
    payload: {description: string}
) {
    return fetchUpdate({
        urlBase: "merged-line-groups",
        objName: "transports_group",
        uid: mergedLineGroupsUID,
        obj: payload,
        objSchema: invoiceMergedLineGroupsSchema,
        successMessage: t("invoices.invoiceSuccessfullyUpdated"),
        errorMessage: t("invoices.error.couldNotUpdateInvoice"),
        apiVersion: "web",
    });
}

export function fetchUpdateMergeBy(invoiceUid: string, payload: PatchInvoiceMergeBy) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "update-merge-by",
        "POST",
        null,
        invoiceUid,
        payload,
        invoiceSchema,
        t("invoices.invoiceSuccessfullyUpdated"),
        t("invoices.error.couldNotUpdateInvoice"),
        "v4"
    );
}

export function fetchUpdateInvoiceGasIndex(
    invoiceUid: string,
    gasIndex: number,
    gasIndexInvoiceItemUid: string | null
) {
    const payload = {gas_index: gasIndex, gas_index_invoice_item_uid: gasIndexInvoiceItemUid};
    return fetchDetailAction(
        "invoices",
        "invoice",
        "update-gas-index",
        "POST",
        null,
        invoiceUid.toString(),
        payload,
        invoiceSchema,
        t("invoices.invoiceSuccessfullyUpdated"),
        t("invoices.error.couldNotUpdateInvoice"),
        "v4"
    );
}

export function fetchShareInvoice(invoiceUid: string, payload: ShareInvoicePayload) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "share",
        "POST",
        null,
        invoiceUid,
        payload,
        null,
        t("common.emailSent"),
        null,
        "v4"
    );
}

export function fetchSendInvoiceReminder(invoiceUid: string, payload: InvoiceReminderPayload) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "send-reminder",
        "POST",
        null,
        invoiceUid,
        payload,
        null,
        t("common.emailSent"),
        null,
        "v4"
    );
}

export const ADD_INVOICELINE = "ADD_INVOICELINE";
export const ADD_INVOICELINE_SUCCESS = "ADD_INVOICELINE_SUCCESS";
export const ADD_INVOICELINE_ERROR = "ADD_INVOICELINE_ERROR";
export function fetchAddInvoiceLine(invoiceUid: string, payload: AddOrUpdateInvoiceLine) {
    return async (dispatch: Function) => {
        dispatch({type: ADD_INVOICELINE});
        try {
            const invoiceLine: InvoiceLine = await apiService.post(
                `invoices/${invoiceUid}/add-invoice-line/`,
                payload,
                {apiVersion: "v4"}
            );
            const response = normalize(invoiceLine, invoiceLineSchema);
            toast.success(t("invoices.invoiceLineSuccessfullyCreated"), {
                toastId: "invoice-line-creation-toast-success",
            });
            dispatch({
                type: ADD_INVOICELINE_SUCCESS,
                payload: {
                    response,
                    invoiceUid,
                },
            });
            return invoiceLine;
        } catch (error) {
            dispatch({type: ADD_INVOICELINE_ERROR, action: error});
            if (!error?.json) {
                toastInvoiceLineCreationError();
                return;
            }
            // Custom toast if one specific error code is returned
            const errorCodes = (await error.json()).non_field_errors?.code ?? [];
            if (errorCodes.length !== 1) {
                toastInvoiceLineCreationError();
                return;
            }
            const errorCode = errorCodes[0];
            toastInvoiceLineCreationError(errorCode);
            return;
        }
    };
}
export function fetchUpdateInvoiceLine(
    invoiceLineId: InvoiceLine["id"],
    payload: AddOrUpdateInvoiceLine
) {
    return fetchUpdate({
        urlBase: "invoice-lines",
        objName: "invoice",
        uid: invoiceLineId.toString(),
        obj: payload,
        objSchema: invoiceLineSchema,
        successMessage: t("invoices.invoiceLineSuccessfullyUpdated"),
        successToastId: "successfully-updated-invoice-line-toast",
        errorMessage: t("invoices.error.couldNotUpdateInvoiceLine"),
        apiVersion: "v4",
    });
}

export const DELETE_INVOICELINE = "DELETE_INVOICELINE";
export const DELETE_INVOICELINE_SUCCESS = "DELETE_INVOICELINE_SUCCESS";
export const DELETE_INVOICELINE_ERROR = "DELETE_INVOICELINE_ERROR";
export function fetchDeleteInvoiceLine(
    invoiceLineId: InvoiceLine["id"],
    invoiceUid: Invoice["uid"]
) {
    return async (dispatch: Function) => {
        dispatch({type: DELETE_INVOICELINE});

        try {
            await apiService.delete(`invoice-lines/${invoiceLineId}/`, {
                apiVersion: "v4",
            });

            toast.success(t("invoices.invoiceLineSuccessfullyDeleted"), {
                toastId: "successfully-deleted-line",
            });
            return dispatch({
                type: DELETE_INVOICELINE_SUCCESS,
                payload: {
                    invoiceLineId,
                    invoiceUid,
                },
            });
        } catch (error) {
            toast.error(t("invoices.couldNotDeleteInvoiceLine"));
            dispatch({type: DELETE_INVOICELINE_ERROR, action: error});
            throw error;
        }
    };
}

export function fetchDeleteInvoice(invoiceUid: Invoice["uid"]) {
    return fetchDelete("invoices", "invoice", invoiceUid);
}

export function fetchInvoicesTotalAmount(filters: any) {
    return fetchListAction(
        "invoices",
        "invoicesTotalAmount",
        "invoices-total-amount",
        "POST",
        undefined,
        filters,
        undefined,
        undefined,
        "web"
    );
}

export function fetchInvoiceUpdatedEvent(data: InvoicePayload) {
    return (dispatch: Function) => {
        const {action, invoice_or_free_transport, ...invoiceData} = data;
        if (invoice_or_free_transport) {
            dispatch(
                addPusherEventLegacy({
                    entities: "invoiceOrFreeTransports",
                    data: null,
                    timestamp: Date.now(),
                })
            );
        }
        if (action === "updated") {
            if (invoiceData.uid) {
                dispatch(fetchRetrieveInvoice(invoiceData.uid));
            }
        } else {
            dispatch(
                addPusherEventLegacy({
                    entities: "reloadInvoices",
                    data: null,
                    timestamp: Date.now(),
                })
            );
        }
    };
}

export function fetchBulkDuplicateInvoices(filters: SearchQuery) {
    return fetchListAction(
        "invoices",
        "invoice",
        "bulk-duplicate",
        "POST",
        filters,
        null,
        null,
        null,
        "web"
    );
}

export function fetchDuplicateInvoice(invoiceUid: string) {
    const base_action = "RETRIEVE_ENTITIES";
    return async (dispatch: Function) => {
        dispatch({type: base_action});

        try {
            const invoice = await invoiceApiService.duplicate(invoiceUid);
            const response = normalize({...invoice, __partial: false}, invoiceSchema);
            dispatch({type: base_action + "_SUCCESS", response});
            return invoice;
        } catch (error) {
            dispatch({type: base_action + "_ERROR", action: error});
            throw error;
        }
    };
}

export function fetchUpdateTrackingInvoicePayment(
    invoiceUid: string,
    payload: UpdateTrackingInvoicePaymentPayload
) {
    return fetchDetailAction(
        "invoices",
        "invoice",
        "tracking-invoice-payment",
        "PATCH",
        null,
        invoiceUid,
        payload,
        invoiceSchema,
        t("invoices.invoiceSuccessfullyUpdated"),
        t("invoices.error.couldNotUpdateInvoice"),
        "web"
    );
}
