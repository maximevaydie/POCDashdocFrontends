import {CompanyCategory} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {SimpleContact} from "dashdoc-utils";

import {ContactSelection} from "./types";

function isValid(selection: ContactSelection): boolean {
    // We used to also check for contacts, but now we allow no contacts
    // or purely nominative contacts (without email or phone number)
    return selection.company !== null;
}

function getCompanyLabel(category: CompanyCategory) {
    switch (category) {
        case "carrier":
            return t("common.carrier");
        case "shipper":
            return t("common.shipper");
        case "origin":
            return t("common.origin");
        case "destination":
            return t("common.destination");
    }
}

type EmailWarning = "noMail" | "noContact";

function getUnsentEmailMessage(
    contacts: SimpleContact[] | null,
    category: CompanyCategory
): {missingEmailWarning: string | null; emailWarningType: EmailWarning | null} {
    if (!contacts || !contacts.length) {
        switch (category) {
            case "carrier":
                return {
                    missingEmailWarning: t(
                        "shareInvoice.errors.emailWontBeSentToCarrierBecauseNoContact"
                    ),
                    emailWarningType: "noContact",
                };
            case "shipper":
                return {
                    missingEmailWarning: t(
                        "shareInvoice.errors.emailWontBeSentToShipperBecauseNoContact"
                    ),
                    emailWarningType: "noContact",
                };
            case "origin":
                return {
                    missingEmailWarning: t(
                        "shareInvoice.errors.emailWontBeSentToOriginBecauseNoContact"
                    ),
                    emailWarningType: "noContact",
                };
            case "destination":
                return {
                    missingEmailWarning: t(
                        "shareInvoice.errors.emailWontBeSentToDestinationBecauseNoContact"
                    ),
                    emailWarningType: "noContact",
                };
        }
    } else {
        for (const contact of contacts) {
            if (!contact.email) {
                return {
                    missingEmailWarning: t("shareInvoice.errors.someContactsWithoutEmail"),
                    emailWarningType: "noMail",
                };
            }
        }
    }
    return {
        missingEmailWarning: null,
        emailWarningType: null,
    };
}

export const contactService = {isValid, getUnsentEmailMessage, getCompanyLabel};
