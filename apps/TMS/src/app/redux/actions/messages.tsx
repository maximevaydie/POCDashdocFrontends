import {fetchAdd, fetchDelete, fetchUpdate} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {TransportMessagePost, populateFormData} from "dashdoc-utils";

import {transportMessageSchema} from "../schemas";

export function fetchAddNote(transportUid: string, deliveryUid: string | undefined, message: any) {
    const payload = {...message, transport: transportUid, delivery: deliveryUid};

    return fetchAdd(
        "transport-messages",
        "message",
        payload,
        transportMessageSchema,
        t("components.noteSuccessfullyAdded")
    );
}

export function fetchAddDocument(transportUid: string, message: TransportMessagePost) {
    const payload = {...message, transport: transportUid};
    const formData = populateFormData(payload);

    return fetchAdd(
        "transport-messages",
        "document",
        formData,
        transportMessageSchema,
        t("components.documentSuccessfullyAdded"),
        // @ts-ignore
        async (error: Response) => {
            const errorJson = error.json && (await error.json());
            if (errorJson?.document?.code?.includes("max_length")) {
                return t("errors.maxTitleLength100");
            }
            return undefined;
        }
    );
}

export function fetchUpdateMessage(message: any) {
    return fetchUpdate({
        urlBase: "transport-messages",
        objName: "message",
        uid: message.uid,
        obj: message,
        objSchema: transportMessageSchema,
        successMessage: t("components.documentSuccessfullyEdited"),
    });
}

export function fetchDeleteMessage(message: any) {
    return fetchDelete(
        "transport-messages",
        "document",
        message.uid,
        t("components.documentSuccessfullyDeleted"),
        undefined,
        message.deliveryUid,
        message.transportUid
    );
}
