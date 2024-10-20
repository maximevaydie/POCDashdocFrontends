import {t, isTranslationKey} from "@dashdoc/web-core";
import {yup} from "dashdoc-utils";

import {KEYS_CUSTOM_EXTENSIONS} from "app/services/misc/customExtensions.service";

import {AVAILABLE_INVOICING_CONNECTORS, KEYS_INVOICING} from "../../services/invoicing";
import {
    AVAILABLE_ABSENCE_MANAGER,
    KEYS_ABSENCE_MANAGER,
} from "../../services/misc/absence-manager.service";
import {
    AVAILABLE_SHIPPERS_PLATFORMS,
    KEYS_SHIPPERS_PLATFORM,
    SHIPPERS_PLATFORM_SERVICES,
} from "../../services/misc/shippersPlatform.service";

import {
    ConnectorCategory,
    ExtensionDataSource,
    ConnectorParameters,
    Extension,
    ExtensionCard,
    ExtensionKey,
    OverloadedExtension,
    RequiredInput,
} from "./api/types";
import {ExtensionsConnectorPayload} from "./hooks/useCrudConnector";

export function getRoute(connectorCategory: ConnectorCategory): string {
    if (connectorCategory === "invoicing") {
        return "/app/settings/invoicing/";
    } else if (connectorCategory === "external_tms") {
        return "/app/settings/external-tms/";
    } else if (connectorCategory === "absence_manager") {
        return "/app/settings/absence-manager/";
    } else if (connectorCategory === "custom") {
        return "/app/settings/custom-extensions/";
    } else {
        throw `Unknown connector category ${connectorCategory}`;
    }
}

function getOverloadedExtension(
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource
): OverloadedExtension {
    function getExtensionOrThrow(
        extensions: {
            [dataSource in ExtensionDataSource]?: Omit<
                OverloadedExtension,
                "connectorCategory" | "dataSource"
            >;
        },
        dataSource: ExtensionDataSource
    ) {
        if (!Object.prototype.hasOwnProperty.call(extensions, dataSource)) {
            throw `No such ${connectorCategory} connector: ${dataSource}`;
        }
        const extension = extensions[dataSource] as Omit<
            OverloadedExtension,
            "connectorCategory" | "dataSource"
        >;
        return {
            ...extension,
            name:
                dataSource === "custom_invoicing" && isTranslationKey(extension.name)
                    ? t(extension.name)
                    : extension.name,
            dataSource,
            connectorCategory,
        };
    }

    if (connectorCategory === "invoicing") {
        return getExtensionOrThrow(AVAILABLE_INVOICING_CONNECTORS, dataSource);
    } else if (connectorCategory === "external_tms") {
        return getExtensionOrThrow(AVAILABLE_SHIPPERS_PLATFORMS, dataSource);
    } else if (connectorCategory === "absence_manager") {
        return getExtensionOrThrow(AVAILABLE_ABSENCE_MANAGER, dataSource);
    } else {
        throw `Unknown connector category ${connectorCategory}`;
    }
}

export function getExtensionCard(
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource
): ExtensionCard {
    return getOverloadedExtension(connectorCategory, dataSource);
}

export function getTranslationKeys(connectorCategory: ConnectorCategory): ExtensionKey {
    switch (connectorCategory) {
        case "external_tms":
            return KEYS_SHIPPERS_PLATFORM;
        case "absence_manager":
            return KEYS_ABSENCE_MANAGER;
        case "invoicing":
            return KEYS_INVOICING;
        case "custom":
            return KEYS_CUSTOM_EXTENSIONS;
        default:
            throw `Unknown connector category ${connectorCategory}`;
    }
}

export function getExtensions(connectorCategory: ConnectorCategory): {
    [dataSource in ExtensionDataSource]?: Omit<Extension, "connectorCategory" | "dataSource">;
} {
    switch (connectorCategory) {
        case "external_tms":
            return AVAILABLE_SHIPPERS_PLATFORMS;
        case "absence_manager":
            return AVAILABLE_ABSENCE_MANAGER;
        case "invoicing":
            return {
                ...AVAILABLE_INVOICING_CONNECTORS,
                custom_invoicing: {
                    ...AVAILABLE_INVOICING_CONNECTORS.custom_invoicing,
                    name: isTranslationKey(AVAILABLE_INVOICING_CONNECTORS.custom_invoicing.name)
                        ? t(AVAILABLE_INVOICING_CONNECTORS.custom_invoicing.name)
                        : AVAILABLE_INVOICING_CONNECTORS.custom_invoicing.name,
                },
            };
        default:
            throw `Unknown connector category ${connectorCategory}`;
    }
}

export function getExtension(
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource
): OverloadedExtension {
    return getOverloadedExtension(connectorCategory, dataSource);
}

export function getExtensionName(
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource
): string {
    return getOverloadedExtension(connectorCategory, dataSource).name;
}

export function generateInitialValues(
    parameters: ConnectorParameters,
    environment: "production" | "sandbox",
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource,
    requiredCredentials: RequiredInput[] | undefined,
    requiredParameters: RequiredInput[] | undefined,
    availableServices: string[] | undefined
) {
    const requiredFields = (requiredCredentials ?? []).concat(requiredParameters ?? []);
    let initialValues: ExtensionsConnectorPayload = {};

    for (let field_data of requiredFields) {
        if (field_data["type"] === "text") {
            initialValues[field_data["id"]] = undefined;
        } else if (field_data["type"] === "password") {
            initialValues[field_data["id"]] = undefined;
        } else if (field_data["type"] === "email") {
            initialValues[field_data["id"]] = undefined;
        } else {
            throw "unable to generate initial values";
        }
    }

    // ShippersPlatforms PART
    if (connectorCategory === "external_tms") {
        const requestedServices = parameters?.requested_services ?? availableServices ?? [];
        SHIPPERS_PLATFORM_SERVICES.filter((service) => !service.displayOnly).map(
            (service) => (initialValues[service.key] = requestedServices.includes(service.key))
        );
        if (dataSource === "gedmouv") {
            initialValues["s3p_subscription"] = parameters?.s3p_subscription ?? undefined;
        }
        if (dataSource === "transporeon") {
            initialValues["license_plate_type"] = parameters?.license_plate_type ?? undefined;
        }
    }

    initialValues["environment"] = parameters?.environment ?? environment;
    return initialValues;
}

export function generateSchemaFromRequiredFields(
    connectorCategory: ConnectorCategory,
    requiredCredentials: RequiredInput[] | undefined,
    requiredParameters: RequiredInput[] | undefined
) {
    const requiredFields = (requiredCredentials ?? []).concat(requiredParameters ?? []);
    let validationFields: {[index: string]: yup.StringSchema | yup.BooleanSchema} = {};
    for (let field_data of requiredFields) {
        if (field_data["type"] === "password") {
            validationFields[field_data["id"]] = yup
                .string()
                .required(`${field_data["label"]} is required`);
        } else if (field_data["type"] === "text") {
            validationFields[field_data["id"]] = yup
                .string()
                .required(`${field_data["label"]} is required`);
        } else if (field_data["type"] === "email") {
            validationFields[field_data["id"]] = yup
                .string()
                .email(t("errors.email.invalid"))
                .required(`${field_data["label"]} is required`);
        } else {
            throw "unable to generate validation schema";
        }
    }

    // ShippersPlatform Part
    if (connectorCategory === "external_tms") {
        SHIPPERS_PLATFORM_SERVICES.filter((service) => !service.displayOnly).map(
            (service) => (validationFields[service.key] = yup.boolean())
        );
    }
    validationFields["environment"] = yup.string().required(`Environment is required`);
    return yup.object(validationFields);
}
