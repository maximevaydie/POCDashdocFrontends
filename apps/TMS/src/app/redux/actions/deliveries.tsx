import {fetchDetailAction, fetchListAction, fetchRetrieve, fetchUpdate} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {deliverySchema} from "../schemas";

import type {Delivery} from "app/types/transport";

export function fetchRetrieveDelivery(uid: string) {
    return fetchRetrieve("deliveries", "delivery", deliverySchema, uid);
}

export function fetchUpdateDelivery(uid: string, delivery: Partial<Delivery>) {
    return fetchUpdate({
        urlBase: "deliveries",
        objName: "delivery",
        uid: uid,
        obj: delivery,
        objSchema: deliverySchema,
        successMessage: t("common.updateSaved"),
        apiVersion: "v4",
    });
}

export function fetchShareDelivery(uid: string, email: string) {
    return fetchListAction(
        "deliveries",
        "delivery",
        "share",
        "POST",
        {uid__in: uid},
        {emails: [email]},
        t("common.emailSent")
    );
}

export function fetchAmendAddRest(deliveryUid: string, rest: {start: string; end: string}) {
    return fetchDetailAction(
        "deliveries",
        "delivery",
        "amend-add-rest",
        "POST",
        null,
        deliveryUid,
        rest,
        deliverySchema,
        undefined,
        undefined,
        "web"
    );
}

export function fetchAmendUpdateRest(
    deliveryUid: string,
    rest: {uid: string; start: string; end: string}
) {
    return fetchDetailAction(
        "deliveries",
        "delivery",
        "amend-edit-rest",
        "PATCH",
        null,
        deliveryUid,
        rest,
        deliverySchema,
        undefined,
        undefined,
        "web"
    );
}
export function fetchAmendDeleteRest(deliveryUid: string, restUid: string) {
    return fetchDetailAction(
        "deliveries",
        "delivery",
        "amend-delete-rest",
        "POST",
        null,
        deliveryUid,
        {uid: restUid},
        deliverySchema,
        undefined,
        undefined,
        "web"
    );
}
