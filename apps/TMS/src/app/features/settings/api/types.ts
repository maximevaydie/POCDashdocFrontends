import {ApiModels} from "@dashdoc/web-common";
import {TranslationKeys} from "@dashdoc/web-core";
import {TextInputType} from "@dashdoc/web-ui";
import {ShippersPlatformDataSource} from "dashdoc-utils";

import {InvoicingDataSource} from "../../../services/invoicing";
import {AbsenceManagerDataSource} from "../../../services/misc/absence-manager.service";

export type ConnectionStatus =
    | "loading"
    | "noConnector"
    | "notAuthenticated"
    | "connected"
    | "redirectingToProvider"
    | "authenticationInProgress"
    | "connectivityProblem"
    | "error";
export type ConnectorCategory = "external_tms" | "absence_manager" | "invoicing" | "custom";
export type ExtensionDataSource =
    | InvoicingDataSource
    | ShippersPlatformDataSource
    | AbsenceManagerDataSource
    | string;

export interface ExtensionCard {
    dataSource: ExtensionDataSource;
    connectorCategory: ConnectorCategory;
    name: string;
    description: TranslationKeys;
    iconUrl?: string;
    webSite?: string;
}

export type RequiredInput = {
    id: string;
    label: string;
    type: TextInputType;
    helpText?: TranslationKeys;
};

export interface Extension extends ExtensionCard {
    requiredCredentials?: RequiredInput[];
    isEnvironmentPickingAvailable: boolean;
    isOauthAvailable?: boolean;
}

export interface OverloadedExtension extends Extension {
    // this type can be used to fetch the specificities of some extensions from a generic method.
    requiredParameters?: RequiredInput[];
    availableServices?: string[];
    isShipperBindingRequired?: boolean;
    isInvoicingDateAvailable?: boolean;
    canShowNotes?: boolean;
    canMergeByAllGroups?: boolean;
}

export interface ExtensionKey {
    backToList: TranslationKeys;
    logOutBody: TranslationKeys;
    logOutTitle: TranslationKeys;
    creationError: TranslationKeys;
    deleted: TranslationKeys;
    deletionError: TranslationKeys;
    added: TranslationKeys;
}

export interface ConnectorParameters {
    environment?: string;
    requested_services?: string[];
    mapping_absence_type?: any;
    s3p_subscription?: string;
    license_plate_type?: string;
}

export interface ExtensionsConnectorCredentialsPost {
    [index: string]: string | boolean | undefined | string[];
}

export interface ExtensionsConnectorPost {
    data_source: string;
    credentials: ExtensionsConnectorCredentialsPost;
    parameters: ExtensionsConnectorCredentialsPost;
}

export interface ExternalFields {
    label: string;
    value: string;
    field: string;
    id: string;
    remote_id: string;
}

export interface ExternalFieldsProps {
    fields: ExternalFields[];
    deleteExternalFields: (id: string) => void;
}

export type CustomExtension = ApiModels.Extensions.Extension;
