import {t} from "@dashdoc/web-core";

import {FilterDateTypes} from "./dateRangeFilter.types";

export function getTypeOfDatePrefixLabel(typeOfDates?: FilterDateTypes) {
    switch (typeOfDates) {
        case "loading":
            return `${t("common.pickupDate")}: `;
        case "unloading":
            return `${t("common.deliveryDate")}: `;
        case "invoicing":
            return `${t("common.invoicingDate")}: `;
        case "due":
            return `${t("common.dueDate")}: `;
        case "transports":
            return `${t("filter.transportsDates")}: `;
        case "payment":
            return `${t("invoice.paymentDate")}: `;
        case "created":
            return `${t("common.creationDate")}: `;
        default:
            return "";
    }
}
