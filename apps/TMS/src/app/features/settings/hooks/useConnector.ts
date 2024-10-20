import {Connector, IsInvoicingConnectorAuthenticatedResponse} from "dashdoc-utils";
import {ConnectorErrorCode} from "dashdoc-utils/src/types/entities/connector";
import {useEffect, useState} from "react";

import {
    fetchGetInvoicingConnectors,
    fetchIsInvoicingConnectorAuthenticated,
} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";
import {fetchGetAbsenceManagerConnector} from "app/services/misc/absence-manager.service";
import {fetchGetShippersPlatformConnector} from "app/services/misc/shippersPlatform.service";

import {ConnectivityStatusValue} from "../api/ConnectivityStatus";
import {ConnectorCategory, ExtensionDataSource} from "../api/types";

export type OauthData =
    | undefined
    | {
          code: ConnectorErrorCode;
          authorizationUrl?: string;
      };
/**
 * Return the connectivity state of a given connector.
 */
export function useConnector(
    connectorCategory: ConnectorCategory,
    dataSource: ExtensionDataSource,
    isOauthAvailable: boolean,
    updateStatus: (newStatus: ConnectivityStatusValue) => void,
    updateConnector: (newConnector: Connector | undefined) => void
): {
    oauthData: OauthData;
} {
    const [oauthData, setOauthData] = useState<OauthData>(undefined);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchConnectivityState = () => {
            (async () => {
                updateStatus("loading");
                const errorText = "Unknown connector category ";
                try {
                    let response = undefined;
                    let oauthStatus: "connected" | "authenticationInProgress" | undefined =
                        undefined;
                    if (connectorCategory === "external_tms") {
                        response = await fetchGetShippersPlatformConnector(dataSource);
                    } else if (connectorCategory === "absence_manager") {
                        response = await fetchGetAbsenceManagerConnector(dataSource);
                    } else if (connectorCategory === "invoicing") {
                        if (isOauthAvailable) {
                            const result: IsInvoicingConnectorAuthenticatedResponse =
                                await dispatch(fetchIsInvoicingConnectorAuthenticated());
                            if (result.response.connector?.data_source === dataSource) {
                                if (result.response.isAuthenticated) {
                                    oauthStatus = "connected";
                                    response = result.response.connector;
                                } else if (!result.response.connector) {
                                    response = undefined;
                                } else {
                                    oauthStatus = "authenticationInProgress";
                                    response = result.response.connector;
                                    if (result.response.authenticationData) {
                                        setOauthData(result.response.authenticationData);
                                    }
                                }
                            }
                        } else {
                            const result = await dispatch(fetchGetInvoicingConnectors());
                            response = result.response.results.find(
                                (connector: Connector) => connector.data_source === dataSource
                            );
                        }
                    } else {
                        updateStatus("noConnector");
                        throw `${errorText}${connectorCategory}`;
                    }

                    if (response?.uid || response?.pk) {
                        updateStatus(oauthStatus ?? "connected");
                    } else {
                        updateStatus("noConnector");
                    }

                    updateConnector(response);
                } catch (error) {
                    updateConnector(undefined);
                    if (error.status == 404) {
                        updateStatus("noConnector");
                    } else if (error.includes(errorText)) {
                        throw error;
                    } else {
                        updateStatus("connectivityIssue");
                        throw error;
                    }
                }
            })();
        };
        fetchConnectivityState();
    }, [connectorCategory, dataSource, isOauthAvailable, dispatch, updateConnector, updateStatus]);

    return {
        oauthData,
    };
}
