import {
    fetchAdd,
    fetchDelete,
    fetchDetailAction,
    fetchListAction,
    fetchRetrieve,
    fetchUpdate,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {normalize} from "normalizr";

import {addPusherEventLegacy} from "app/redux/actions/realtime";
import {RootState} from "app/redux/reducers/index";
import {
    CreditNoteFileUpdatedPayload,
    CreditNoteCommunicationStatusPayload,
    CreditNotePayload,
} from "app/redux/reducers/realtime";
import {creditNoteSchema} from "app/redux/schemas";
import {CreditNote, ShareCreditNotePayload} from "app/taxation/invoicing/types/creditNote.types";

export function fetchRetrieveCreditNote(creditNoteUid: string) {
    return fetchRetrieve(
        "credit-notes",
        "creditNote",
        creditNoteSchema,
        creditNoteUid,
        undefined,
        "web"
    );
}

export function fetchRetrieveSharedCreditNote(creditNoteUid: string) {
    return fetchRetrieve(
        "credit-notes",
        "creditNote",
        creditNoteSchema,
        creditNoteUid,
        undefined,
        "web",
        undefined,
        "shared/"
    );
}

export function fetchAddCreditNoteToInvoice(invoiceUid: string) {
    return fetchAdd(
        "credit-notes",
        "creditNote",
        {invoice_uid: invoiceUid},
        creditNoteSchema,
        t("creditNote.successfullyCreated"),
        t("creditNote.error.couldNotCreate"),
        "web"
    );
}
export function fetchDeleteDraftCreditNote(creditNoteUid: string) {
    return fetchDelete(
        "credit-notes",
        "creditNote",
        creditNoteUid,
        t("creditNote.successfullyDeleted"),
        t("creditNote.error.couldNotDelete"),
        undefined,
        undefined,
        "web"
    );
}

export function fetchUpdateCreditNote(creditNoteUid: string, payload: Partial<CreditNote>) {
    return fetchUpdate({
        urlBase: "credit-notes",
        objName: "creditNote",
        uid: creditNoteUid,
        obj: payload,
        objSchema: creditNoteSchema,
        apiVersion: "web",
    });
}

export function fetchFinalizeCreditNote(
    creditNoteUid: string,
    payload: Pick<CreditNote, "due_date" | "invoicing_date">
) {
    return fetchDetailAction(
        "credit-notes",
        "creditNote",
        "finalize",
        "POST",
        null,
        creditNoteUid,
        payload,
        creditNoteSchema,
        t("creditNote.successfullyFinalized"),
        t("creditNote.error.couldNotFinalize"),
        "web"
    );
}
export function fetchMarkPaidCreditNote(creditNoteUid: string) {
    return fetchDetailAction(
        "credit-notes",
        "creditNote",
        "mark-paid",
        "POST",
        null,
        creditNoteUid,
        null,
        creditNoteSchema,
        t("creditNote.successfullyMarkPaid"),
        t("creditNote.error.couldNotMarkPaid"),
        "web"
    );
}
export function fetchMarkNotPaidCreditNote(creditNoteUid: string) {
    return fetchDetailAction(
        "credit-notes",
        "creditNote",
        "mark-not-paid",
        "POST",
        null,
        creditNoteUid,
        null,
        creditNoteSchema,
        t("creditNote.successfullyMarkNotPaid"),
        t("creditNote.error.couldNotMarkNotPaid"),
        "web"
    );
}
export function fetchShareCreditNote(creditNoteUid: string, payload: ShareCreditNotePayload) {
    return fetchDetailAction(
        "credit-notes",
        "creditNote",
        "share",
        "POST",
        null,
        creditNoteUid,
        payload,
        null,
        t("common.emailSent"),
        null,
        "web"
    );
}

export const CREDIT_NOTE_FILE_UPDATED_EVENT_SUCCESS = "CREDIT_NOTE_FILE_UPDATED_EVENT_SUCCESS";
export function fetchCreditNoteFileUpdatedEvent(
    creditNoteFileUpdatedEvent: CreditNoteFileUpdatedPayload
) {
    return (dispatch: Function) => {
        dispatch({
            type: CREDIT_NOTE_FILE_UPDATED_EVENT_SUCCESS,
            payload: creditNoteFileUpdatedEvent,
        });
        return creditNoteFileUpdatedEvent;
    };
}

export const CREDIT_NOTE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS =
    "CREDIT_NOTE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS";
export function fetchCreditNoteCommunicationStatusUpdatedEvent(
    creditNoteCommunicationStatusEvent: CreditNoteCommunicationStatusPayload
) {
    return (dispatch: Function) => {
        dispatch({
            type: CREDIT_NOTE_COMMUNICATION_STATUS_UPDATED_EVENT_SUCCESS,
            payload: creditNoteCommunicationStatusEvent,
        });
        return creditNoteCommunicationStatusEvent;
    };
}

export function fetchCreditNoteUpdatedEvent(data: CreditNotePayload) {
    return (dispatch: Function) => {
        const {action, ...creditNoteData} = data;
        switch (action) {
            case "updated":
                if (creditNoteData.uid) {
                    dispatch(fetchRetrieveCreditNote(creditNoteData.uid)).then(
                        dispatch({
                            type: "UPDATE_ENTITIES_SUCCESS",
                            response: normalize(creditNoteData, creditNoteSchema),
                        })
                    );
                }

                break;
            case "deleted":
                {
                    dispatch({type: "DELETE_CREDITNOTE_SUCCESS", pk: creditNoteData.uid});
                    dispatch(
                        addPusherEventLegacy({
                            entities: "reloadCreditNotes",
                            data: null,
                            timestamp: Date.now(),
                        })
                    );
                }
                break;
            case "added":
                if (creditNoteData.uid) {
                    dispatch(fetchRetrieveCreditNote(creditNoteData.uid)).then(
                        (result: {response: Partial<RootState>}) => {
                            dispatch({
                                type: "ADD_CREDITNOTE_SUCCESS",
                                response: result.response,
                            });
                        }
                    );
                }
                break;
            case "finalized":
                dispatch({
                    type: "UPDATE_ENTITIES_SUCCESS",
                    response: normalize(creditNoteData, creditNoteSchema),
                });
                dispatch(
                    addPusherEventLegacy({
                        entities: "invoiceOrFreeTransports",
                        data: null,
                        timestamp: Date.now(),
                    })
                );
                break;
        }
    };
}

export function fetchCreditNotesTotalAmount(filters: any) {
    return fetchListAction(
        "credit-notes",
        "creditNotesTotalAmount",
        "get-total-amount",
        "POST",
        undefined,
        filters,
        undefined,
        undefined,
        "web"
    );
}
