import {fetchDetailAction} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {SupportExchange, SupportExchangePost} from "dashdoc-utils";

import {fetchAdd, fetchUpdate} from "./base-actions";

export function fetchAddSupportsExchange(exchange: SupportExchangePost, siteUid: string) {
    return fetchAdd(
        "supports-exchanges",
        "supports-exchange",
        {...exchange, site: siteUid},
        t("supportExchange.successfullyAdded"),
        "v4"
    );
}
export function fetchAmendAddSupportsExchange(exchange: SupportExchangePost) {
    return fetchAdd(
        "supports-exchanges/amend-add",
        "supports-exchange",
        exchange,
        t("supportExchange.successfullyAdded"),
        "v4"
    );
}

export function fetchUpdateSupportsExchange(
    exchange: Omit<SupportExchange, "support_type"> & {support_type: {uid: string}}
) {
    return fetchUpdate(
        "supports-exchanges",
        "supports-exchange",
        exchange,
        exchange.uid,
        undefined,
        "v4"
    );
}

export function fetchAmendUpdateSupportsExchange(
    exchange: Omit<SupportExchange, "support_type"> & {support_type: {uid: string}}
) {
    return fetchDetailAction(
        "supports-exchanges",
        "supports-exchange",
        "amend-edit",
        "PATCH",
        null,
        exchange.uid,
        exchange,
        null
    );
}
