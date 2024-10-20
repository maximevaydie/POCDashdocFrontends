import {BuildConstants} from "@dashdoc/web-core";
import {Connector} from "dashdoc-utils";

import {Extension, ExtensionKey, RequiredInput} from "../../features/settings/api/types";

export type InvoicingDataSource = "pennylane" | "sage" | "billit" | "custom_invoicing";

export const AVAILABLE_INVOICING_CONNECTORS: {
    [dataSource in InvoicingDataSource]: Omit<Extension, "connectorCategory" | "dataSource"> & {
        requiredParameters?: RequiredInput[];
        isOauthAvailable: boolean;
        isInvoicingDateAvailable: boolean; // TO REMOVE once it's integrated for every invoicing connectors
        canShowNotes: boolean;
        canMergeByAllGroups: boolean;
    };
} = {
    billit: {
        name: "Billit",
        description: "settings.invoicing.description",
        iconUrl: `${BuildConstants.staticUrl}img/billit.png`,
        webSite: "https://www.billit.be",
        requiredCredentials: [],
        requiredParameters: [
            {
                id: "party_id",
                label: "Company ID",
                type: "text",
                helpText: "settings.invoicing.billitCompanyIdHelpText",
            },
        ],
        isOauthAvailable: true,
        isEnvironmentPickingAvailable: true,
        isInvoicingDateAvailable: true,
        canShowNotes: true,
        canMergeByAllGroups: true,
    },
    pennylane: {
        name: "Pennylane",
        description: "settings.invoicing.description",
        iconUrl: `${BuildConstants.staticUrl}img/pennylane.png`,
        webSite: "https://www.pennylane.com",
        requiredCredentials: [],
        isOauthAvailable: true,
        isEnvironmentPickingAvailable: false,
        isInvoicingDateAvailable: true,
        canShowNotes: true,
        canMergeByAllGroups: true,
    },
    sage: {
        name: "Sage 100c",
        description: "settings.invoicing.description",
        iconUrl: `${BuildConstants.staticUrl}img/sage.png`,
        webSite: "https://www.sage.com",
        requiredCredentials: [
            {id: "token", label: "Token", type: "text"},
            {id: "base_url", label: "Url de connexion", type: "text"},
        ],
        isOauthAvailable: false,
        isEnvironmentPickingAvailable: false,
        isInvoicingDateAvailable: true,
        canShowNotes: true,
        canMergeByAllGroups: false,
    },
    custom_invoicing: {
        name: "settings.invoicing.customIntegration",
        description: "settings.invoicing.description",
        iconUrl: "",
        webSite: "",
        isOauthAvailable: false,
        isEnvironmentPickingAvailable: false,
        isInvoicingDateAvailable: true,
        canShowNotes: true,
        canMergeByAllGroups: false,
    },
};

export const KEYS_INVOICING: ExtensionKey = {
    backToList: "settings.invoicing.backToList",
    logOutBody: "settings.invoicing.logOutBody",
    logOutTitle: "settings.extension.logOutTitle",
    creationError: "settings.extension.creationError",
    deleted: "settings.invoicing.deleted",
    deletionError: "settings.extension.deletionError",
    added: "settings.invoicing.added",
};

/**
 * @deprecated to remove with CONNECTORS_WITH_INVOICING_DATE once it's integrated for every invoicing connectors
 */
function canAccessInvoicingDate(invoicingConnector: Connector | undefined): boolean {
    const dataSource = invoicingConnector?.data_source as InvoicingDataSource | undefined;
    if (dataSource && AVAILABLE_INVOICING_CONNECTORS[dataSource]) {
        return AVAILABLE_INVOICING_CONNECTORS[dataSource].isInvoicingDateAvailable;
    } else {
        return false;
    }
}

/**
 * @deprecated to remove with CONNECTORS_WITH_INVOICING_DATE once it's integrated for every invoicing connectors
 */
function canShowNotes(invoicingConnector: Connector | undefined): boolean {
    const dataSource = invoicingConnector?.data_source as InvoicingDataSource | undefined;
    if (dataSource && AVAILABLE_INVOICING_CONNECTORS[dataSource]) {
        return AVAILABLE_INVOICING_CONNECTORS[dataSource].canShowNotes;
    } else {
        return false;
    }
}

/**
 * We propose the merging by all groups only for compatible connectors that come from the user profile.
 * The invoice connector isn't provided in draft state.
 * We cannot use the invoice connector of the invoice to decide if the merging behavior is available.
 */
function canMergeByAllGroups(invoicingConnector: Connector | undefined): boolean {
    const dataSource = invoicingConnector?.data_source as InvoicingDataSource | undefined;
    if (dataSource && AVAILABLE_INVOICING_CONNECTORS[dataSource]) {
        return AVAILABLE_INVOICING_CONNECTORS[dataSource].canMergeByAllGroups;
    } else {
        return false;
    }
}

export const connectorsService = {
    canAccessInvoicingDate,
    canShowNotes,
    canMergeByAllGroups,
};
