import {
    fetchAdd,
    fetchDelete,
    fetchDetailAction,
    fetchRetrieve,
    fetchSearch,
    fetchUpdate,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {contactSchema} from "../schemas";

export function fetchRetrieveContact(contactUid: string) {
    return fetchRetrieve("contacts", "contact", contactSchema, contactUid);
}

export function fetchContactSearch(queryName: string, query: any, page: number) {
    return fetchSearch("contacts", "contact", contactSchema, queryName, query, page);
}

export function fetchAddContact(payload: any) {
    return fetchAdd(
        "contacts",
        "contact",
        payload,
        contactSchema,
        t("contact.createSuccess"),
        t("contact.createFailed")
    );
}

export function fetchUpdateContact(contactUid: string, payload: any) {
    return fetchUpdate({
        urlBase: "contacts",
        objName: "contact",
        uid: contactUid,
        obj: payload,
        objSchema: contactSchema,
        successMessage: t("contact.updateSuccess"),
        errorMessage: t("contact.updateFailed"),
    });
}

export function fetchDeleteContact(contactUid: string) {
    return fetchDelete("contacts", "contact", contactUid);
}

export function fetchInviteContact(contactUid: string) {
    return fetchDetailAction(
        "contacts",
        "contact",
        "invite",
        "POST",
        null,
        contactUid,
        {},
        contactSchema,
        t("components.inviteSent"),
        t("components.ShareLinkSentFail")
    );
}
