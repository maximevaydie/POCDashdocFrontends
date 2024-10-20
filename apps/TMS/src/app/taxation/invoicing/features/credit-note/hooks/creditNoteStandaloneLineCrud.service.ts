// TODO : put those in a clean hook

import {apiService} from "@dashdoc/web-common";

/** Must be in sync with the backend `CreditNoteStandaloneLineUpsertInputValidator` */
export type CreditNoteStandaloneLineUpsertInput = {
    description: string;
    quantity: string;
    unit_price: string;
    invoice_item_uid: string;
};

/** This api sends a realtime event to update the credit note in redux, no need to do anything with the result */
export const createCreditNoteStandaloneLine = async (
    creditNoteUid: string,

    payload: CreditNoteStandaloneLineUpsertInput
) => {
    await apiService.post(`credit-notes/${creditNoteUid}/standalone-lines/`, payload, {
        apiVersion: "web",
    });
};

/** This api sends a realtime event to update the credit note in redux, no need to do anything with the result */
export const updateCreditNoteStandaloneLine = async (
    creditNoteUid: string,
    creditNoteLineId: number,
    payload: CreditNoteStandaloneLineUpsertInput
) => {
    await apiService.post(
        `credit-notes/${creditNoteUid}/standalone-lines/${creditNoteLineId}/`,
        payload,
        {
            apiVersion: "web",
        }
    );
};

/** This api sends a realtime event to update the credit note in redux, no need to do anything with the result */
export const deleteCreditNoteStandaloneLine = async (
    creditNoteUid: string,
    creditNoteLineId: number
) => {
    await apiService.delete(
        `credit-notes/${creditNoteUid}/standalone-lines/${creditNoteLineId}/`,
        {
            apiVersion: "web",
        }
    );
};
