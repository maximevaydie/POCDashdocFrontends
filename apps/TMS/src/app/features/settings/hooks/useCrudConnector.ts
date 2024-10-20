import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {Connector} from "dashdoc-utils";
import {CreateInvoicingConnectorResponse} from "dashdoc-utils/src/types/entities/connector";
import {FormikHelpers} from "formik";
import {useEffect, useState} from "react";

import {useDispatch} from "app/redux/hooks";
import {
    fetchCreateAbsenceManagerConnector,
    fetchDeleteAbsenceManagerConnector,
} from "app/services/misc/absence-manager.service";

import {
    fetchCreateInvoicingConnector,
    fetchRemoveInvoicingConnector,
    fetchRequestOAuthToken,
} from "../../../redux/actions";
import {
    fetchCreateShippersPlatformConnector,
    fetchDeleteShippersPlatformConnector,
    SHIPPERS_PLATFORM_SERVICES,
} from "../../../services/misc/shippersPlatform.service";
import {ConnectivityStatusValue} from "../api/ConnectivityStatus";
import {
    ConnectorCategory,
    ExtensionDataSource,
    ExtensionKey,
    ExtensionsConnectorCredentialsPost,
    RequiredInput,
} from "../api/types";
import {getExtensionName, getTranslationKeys} from "../extensions.service";

import {OauthData, useConnector} from "./useConnector";

export interface ExtensionsConnectorPayload {
    [index: string]: string | boolean | undefined;
}

export type OauthStatus =
    | "connected"
    | "authenticationInProgress"
    | "validatingToken"
    | "redirectingToProvider"
    | "authenticatingOnThirdParty"
    | undefined;

/**
 * Return the connectivity state of a given connector.
 */
export function useCrudConnector(
    status: ConnectivityStatusValue,
    connector: Connector | undefined,
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource,
    isOauthAvailable: boolean,
    updateStatus: (newStatus: ConnectivityStatusValue) => void,
    updateConnector: (newConnector: Connector | undefined) => void
): {
    oauthStatus: OauthStatus;
    upsertConnector: (
        values: ExtensionsConnectorPayload,
        formikHelpers: FormikHelpers<ExtensionsConnectorPayload>,
        requiredCredentials: RequiredInput[] | undefined,
        requiredParameters: RequiredInput[] | undefined
    ) => Promise<void>;
    removeConnector: () => Promise<void>;
} {
    const dispatch = useDispatch();
    const {oauthData: initialOauthData} = useConnector(
        connectorCategory,
        dataSource,
        isOauthAvailable,
        updateStatus,
        updateConnector
    );

    const [oauthStatus, setOauthStatus] = useState<OauthStatus>(undefined);
    const [oauthData, setOauthData] = useState<OauthData>(initialOauthData);
    const {added, creationError, deletionError, deleted}: ExtensionKey =
        getTranslationKeys(connectorCategory);

    useEffect(() => {
        if (status === "authenticationInProgress") {
            if (isOauthAvailable) {
                const redirectToProvider = () => {
                    if (oauthData?.authorizationUrl) {
                        setOauthStatus("redirectingToProvider");
                        setTimeout(function () {
                            window.open(oauthData.authorizationUrl, "_blank");
                            setOauthStatus("authenticatingOnThirdParty");
                        }, 3000);
                    } else {
                        setOauthStatus(undefined);
                        updateStatus("connectivityIssue");
                    }
                };
                const validateToken = (query: URLSearchParams) => {
                    setOauthStatus("validatingToken");
                    dispatch(
                        fetchRequestOAuthToken(
                            // @ts-ignore
                            query.get("code"),
                            query.get("state"),
                            {realmId: query.get("realmId")}
                        )
                    )
                        .then(() => {
                            updateStatus("connected");
                            setOauthStatus(undefined);
                        })
                        .catch(() => {
                            updateStatus("connectivityIssue");
                            setOauthStatus(undefined);
                        });
                };

                const query = new URLSearchParams(window.location.search);
                if (query.has("code")) {
                    validateToken(query);
                } else if (query.has("error")) {
                    setOauthStatus(undefined);
                    updateStatus("connectivityIssue");
                } else {
                    redirectToProvider();
                }
            }
        }
    }, [status, setOauthStatus, isOauthAvailable, dispatch, updateStatus, oauthData]);

    const upsertConnector = async (
        values: ExtensionsConnectorPayload,
        formikHelpers: FormikHelpers<ExtensionsConnectorPayload>,
        requiredCredentials: RequiredInput[] | undefined,
        requiredParameters: RequiredInput[] | undefined
    ) => {
        let response: Connector;
        try {
            const parameters: ExtensionsConnectorCredentialsPost = {
                environment: values["environment"],
            };

            if (isOauthAvailable) {
                parameters["redirect_uri"] =
                    `${window.location.origin}${window.location.pathname}`;
            }

            if (connectorCategory === "external_tms") {
                parameters["requested_services"] = SHIPPERS_PLATFORM_SERVICES.filter(
                    (service) => !service.displayOnly
                )
                    .map((service) => (values[service.key] ? service.key : ""))
                    .filter(function (val: string) {
                        return val !== "";
                    });

                if (dataSource === "gedmouv") {
                    parameters["s3p_subscription"] = values["s3p_subscription"];
                }

                if (dataSource === "transporeon") {
                    parameters["license_plate_type"] = values["license_plate_type"];
                }
            }

            const credentials: ExtensionsConnectorCredentialsPost = {};
            if (requiredCredentials) {
                requiredCredentials.map((credential) => {
                    credentials[credential.id] = values[credential.id];
                });
            }
            if (requiredParameters) {
                requiredParameters.map((parameter) => {
                    parameters[parameter.id] = values[parameter.id];
                });
            }

            let hasToast = false;
            if (connectorCategory === "external_tms") {
                response = await fetchCreateShippersPlatformConnector({
                    data_source: dataSource,
                    credentials: credentials,
                    parameters: parameters,
                });
            } else if (connectorCategory === "absence_manager") {
                response = await fetchCreateAbsenceManagerConnector({
                    data_source: dataSource,
                    credentials: credentials,
                    parameters: parameters,
                });
            } else if (connectorCategory === "invoicing") {
                hasToast = true;
                const result: CreateInvoicingConnectorResponse = await dispatch(
                    fetchCreateInvoicingConnector(dataSource, parameters, credentials)
                );
                response = result.connector;
                if (isOauthAvailable && result.authentication) {
                    setOauthData(result.authentication.authenticationData);
                    setOauthStatus("authenticationInProgress");
                }
            } else {
                throw `Unknown connector category ${connectorCategory}`;
            }

            updateStatus(isOauthAvailable ? "authenticationInProgress" : "connected");
            updateConnector(response);
            if (!hasToast) {
                toast.success(t(added));
            }
        } catch (error) {
            getErrorMessagesFromServerError(error).then((error?: any) => {
                if (error) {
                    formikHelpers.setSubmitting(false);
                    formikHelpers.setErrors(error);
                }
            });
            toast.error(
                t(creationError, {platform_name: getExtensionName(connectorCategory, dataSource)})
            );
        }
    };

    const removeConnector = async () => {
        if (connector?.uid || (connector?.pk && connectorCategory === "invoicing")) {
            try {
                if (connectorCategory === "external_tms") {
                    await fetchDeleteShippersPlatformConnector(connector.uid);
                } else if (connectorCategory === "absence_manager") {
                    await fetchDeleteAbsenceManagerConnector(connector.uid);
                } else if (connectorCategory === "invoicing") {
                    await dispatch(fetchRemoveInvoicingConnector());
                } else {
                    throw `Unknown connector category ${connectorCategory}`;
                }
                toast.success(t(deleted));
                updateStatus("noConnector");
                setOauthStatus(undefined);
                updateConnector(undefined);
            } catch (error) {
                toast.error(t(deletionError));
                throw error;
            }
        } else {
            updateStatus("noConnector");
            setOauthStatus(undefined);
        }
    };

    useEffect(() => {
        setOauthData(initialOauthData);
    }, [initialOauthData]);

    return {
        oauthStatus,
        upsertConnector,
        removeConnector,
    };
}
