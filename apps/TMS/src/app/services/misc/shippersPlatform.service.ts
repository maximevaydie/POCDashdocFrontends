import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {BuildConstants} from "@dashdoc/web-core";
import {TranslationKeys} from "@dashdoc/web-core";
import {ExternalTransport, ShippersPlatformDataSource} from "dashdoc-utils";

import {
    Extension,
    ExtensionKey,
    ExtensionsConnectorPost,
} from "../../features/settings/api/types";

export const AVAILABLE_SHIPPERS_PLATFORMS: {
    [dataSource in ShippersPlatformDataSource]: Omit<
        Extension,
        "connectorCategory" | "dataSource"
    > & {
        availableServices: string[];
        isShipperBindingRequired: boolean;
        getExternalLink: (externalTransport: ExternalTransport) => string;
    };
} = {
    shippeo: {
        name: "Shippeo",
        description: "settings.shippersPlatforms.shippeoDescription",
        iconUrl: `${BuildConstants.staticUrl}img/shippeo.jpeg`,
        webSite: "https://www.shippeo.com",
        requiredCredentials: [
            {id: "user", label: "User", type: "text"},
            {id: "password", label: "Password", type: "password"},
            {
                id: "telematicConfiguration",
                label: "Telematic Configuration",
                type: "text",
                helpText: "settings.shippersPlatforms.shippeoTelematicConfigurationTooltip",
            },
        ],
        availableServices: [
            "transport_extraction",
            "license_plate_transmission",
            "pod_transmission",
            "transport_status_transmission",
        ],
        isShipperBindingRequired: true,
        isEnvironmentPickingAvailable: true,
        getExternalLink: (externalTransport: ExternalTransport) => {
            // todo : update the link
            return `https://frontoffice-legacy.core.qa.shippeo.com/legacy#!/app/orders/${externalTransport.remote_id}/details/timeline`;
        },
    },
    transporeon: {
        name: "Transporeon",
        description: "settings.shippersPlatforms.transporeonDescription",
        iconUrl: `${BuildConstants.staticUrl}img/transporeon.jpeg`,
        webSite: "https://www.transporeon.com",
        requiredCredentials: [
            {id: "user", label: "User", type: "text"},
            {id: "password", label: "Password", type: "password"},
        ],
        availableServices: [
            "transport_extraction",
            "license_plate_transmission",
            "pod_transmission",
        ],
        isShipperBindingRequired: true,
        isEnvironmentPickingAvailable: true,
        getExternalLink: (externalTransport: ExternalTransport) => {
            if (externalTransport.extra?.link_to_platform) {
                return externalTransport.extra?.link_to_platform;
            }
            return `https://login.transporeon.com/?jumpToTransport=true&transportId=${externalTransport.remote_id}`;
        },
    },
    pallex: {
        name: "Pall-Ex",
        description: "settings.shippersPlatforms.pallexDescription",
        iconUrl: `${BuildConstants.staticUrl}img/pallex.png`,
        webSite: "https://www.pallex.com",
        requiredCredentials: [],
        availableServices: ["transport_extraction"],
        isShipperBindingRequired: false,
        isEnvironmentPickingAvailable: false,
        getExternalLink: () => {
            // todo : find the link
            return "https://www.pallex.com";
        },
    },
    pole: {
        name: "Pole",
        description: "settings.shippersPlatforms.poleDescription",
        iconUrl: `${BuildConstants.staticUrl}img/pole.jpg`,
        webSite: "https://groupe-pole.com",
        requiredCredentials: [],
        availableServices: ["transport_extraction"],
        isShipperBindingRequired: false,
        isEnvironmentPickingAvailable: false,
        getExternalLink: () => {
            // todo : find the link
            return "https://groupe-pole.com";
        },
    },
    gedmouv: {
        name: "Gedmouv",
        description: "settings.shippersPlatforms.gedmouvDescription",
        iconUrl: `${BuildConstants.staticUrl}img/gedmouv.png`,
        webSite: "https://www.gedmouv.com",
        requiredCredentials: [{id: "token", label: "Token", type: "password"}],
        availableServices: [
            "transport_extraction",
            "transport_status_transmission",
            "pod_transmission",
            "license_plate_transmission",
        ],
        isShipperBindingRequired: true,
        isEnvironmentPickingAvailable: true,
        getExternalLink: (externalTransport: ExternalTransport) => {
            if (externalTransport.extra?.link_to_platform) {
                return externalTransport.extra?.link_to_platform;
            }
            return `http://app.gedmouv.com/order/display?id=${externalTransport.remote_id}`;
        },
    },
};
export const KEYS_SHIPPERS_PLATFORM: ExtensionKey = {
    backToList: "settings.shippersPlatform.backTolist",
    logOutBody: "settings.shippersPlatform.logOutBody",
    logOutTitle: "settings.shippersPlatform.logOutTitle",
    creationError: "settings.external_tms.error",
    deleted: "settings.external_tms.deleted",
    deletionError: "settings.external_tms.removeError",
    added: "settings.external_tms.added",
};

export async function fetchCreateShippersPlatformConnector(payload: ExtensionsConnectorPost) {
    return await apiService.post("/shippers-platforms/connectors/", payload);
}

export async function fetchGetShippersPlatformConnector(dataSource: string) {
    return await apiService.get(`/shippers-platforms/connectors/${dataSource}`);
}

export async function fetchGetShippersPlatformConnectors() {
    return await apiService.get("/shippers-platforms/connectors/");
}

export async function fetchDeleteShippersPlatformConnector(uid: string) {
    return await apiService.delete(`/shippers-platforms/connectors/${uid}/`);
}

export async function fetchListCompanies(pk: string) {
    return await apiService.get(`/companies/${pk}/`);
}

export async function fetchShipperListCompanies() {
    const response = await apiService.get(
        "/companies/?category=shipper&company__isnull=false&ordering=name"
    );
    return response.results;
}

export async function fetchListExternalCompany(connectorUid: string) {
    const response = await apiService.get(
        `/shippers-platforms/${connectorUid}/external-companies/`
    );
    return response.results;
}

export async function fetchShipperNotExternalCompanyList(
    searchText: string,
    connectorUid: string,
    page: number
) {
    return await apiService.get(
        `/shippers-platforms/${connectorUid}/external-companies/unmapped/?page=${page}&query=${searchText}`
    );
}

export async function fetchDeleteExternalCompany(connectorUid: string, pk: string) {
    return await apiService.delete(
        `/shippers-platforms/${connectorUid}/external-companies/${pk}/`
    );
}

export async function fetchCreateExternalCompany(
    connectorUid: string,
    payload: {company: {pk: number}; remote_id: string}[]
) {
    return await apiService.post(
        `/shippers-platforms/${connectorUid}/external-companies/`,
        payload
    );
}

export function getExternalLink(externalTransport: ExternalTransport) {
    if (externalTransport.data_source in AVAILABLE_SHIPPERS_PLATFORMS) {
        return AVAILABLE_SHIPPERS_PLATFORMS[externalTransport.data_source].getExternalLink(
            externalTransport
        );
    } else if ("link_to_platform" in externalTransport.extra) {
        return externalTransport.extra.link_to_platform;
    } else {
        Logger.error(`No defined external link format for ${externalTransport.data_source}`);
        return "";
    }
}

export const SHIPPERS_PLATFORM_SERVICES: {
    key: string;
    label: TranslationKeys;
    displayOnly?: boolean;
}[] = [
    // we may fetch this list from backend
    {
        key: "transport_extraction",
        label: "settings.transportExtraction",
        displayOnly: true,
    },
    {
        key: "transport_status_transmission",
        label: "settings.transportStatusTransmission",
    },
    {
        key: "pod_transmission",
        label: "settings.podTransmission",
    },
    {
        key: "license_plate_transmission",
        label: "settings.licensePlateTransmission",
    },
];
