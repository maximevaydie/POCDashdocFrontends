import {t} from "@dashdoc/web-core";
import {IsInvoicingConnectorAuthenticatedResponse} from "dashdoc-utils";
import React, {useEffect, useState} from "react";
import {useHistory} from "react-router";

import {fetchIsInvoicingConnectorAuthenticated} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";
import {fetchGetAbsenceManagerConnectors} from "app/services/misc/absence-manager.service";
import {fetchGetShippersPlatformConnectors} from "app/services/misc/shippersPlatform.service";

import {getExtensions} from "../extensions.service";

import {ConnectivityStatusValue} from "./ConnectivityStatus";
import {ExtensionCard} from "./ExtensionCard";
import {ConnectorCategory, ExtensionDataSource, ExtensionCard as ExtensionCardData} from "./types";

const getPlatforms = (connectorCategory: ConnectorCategory) => {
    const extensions = getExtensions(connectorCategory);

    return Object.keys(extensions).reduce(
        (array: ExtensionCardData[], dataSource: ExtensionDataSource) => {
            array.push({
                dataSource: dataSource,
                connectorCategory: connectorCategory,
                ...(extensions[dataSource] as Omit<
                    ExtensionCardData,
                    "connectorCategory" | "dataSource"
                >),
            });
            return array;
        },
        [] as ExtensionCardData[]
    );
};

const setAllStatuses = (
    connectorCategory: ConnectorCategory,
    status: ConnectivityStatusValue
): Record<ExtensionDataSource, ConnectivityStatusValue> => {
    return getPlatforms(connectorCategory).reduce(
        (statuses, extension: ExtensionCardData) => {
            statuses[extension.dataSource] = status;
            return statuses;
        },
        {} as Record<ExtensionDataSource, ConnectivityStatusValue>
    );
};

export const ExtensionsPicker = ({connectorCategory}: {connectorCategory: ConnectorCategory}) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [platforms, setPlatforms] = useState<ExtensionCardData[]>(
        getPlatforms(connectorCategory)
    );
    const [statuses, setStatuses] = useState<Record<ExtensionDataSource, ConnectivityStatusValue>>(
        setAllStatuses(connectorCategory, "loading")
    );
    useEffect(() => {
        const fetchConnectivityState = () => {
            function sortExtensions(
                newStatuses: Record<ExtensionDataSource, ConnectivityStatusValue>
            ) {
                const newPlatforms = [...getPlatforms(connectorCategory)];
                setPlatforms(
                    newPlatforms.sort((a, b) => {
                        if (
                            newStatuses[a.dataSource] !== "noConnector" &&
                            newStatuses[a.dataSource] !== "loading" &&
                            newStatuses[b.dataSource] !== "noConnector" &&
                            newStatuses[b.dataSource] !== "loading"
                        ) {
                            return 0;
                        } else if (
                            newStatuses[a.dataSource] !== "noConnector" &&
                            newStatuses[a.dataSource] !== "loading"
                        ) {
                            return -10;
                        } else if (
                            newStatuses[b.dataSource] !== "noConnector" &&
                            newStatuses[b.dataSource] !== "loading"
                        ) {
                            return 10;
                        }

                        return 0;
                    })
                );
            }

            (async () => {
                setStatuses(setAllStatuses(connectorCategory, "loading"));
                try {
                    let connectors = [];
                    if (connectorCategory === "external_tms") {
                        connectors = await fetchGetShippersPlatformConnectors();
                    } else if (connectorCategory === "absence_manager") {
                        connectors = await fetchGetAbsenceManagerConnectors();
                    } else if (connectorCategory === "invoicing") {
                        const result: IsInvoicingConnectorAuthenticatedResponse = await dispatch(
                            fetchIsInvoicingConnectorAuthenticated()
                        );

                        const newStatuses = setAllStatuses(connectorCategory, "noConnector");
                        if (result.response.connector) {
                            if (result.response.isAuthenticated) {
                                newStatuses[
                                    result.response.connector.data_source as ExtensionDataSource
                                ] = "connected";
                            } else {
                                newStatuses[
                                    result.response.connector.data_source as ExtensionDataSource
                                ] = "authenticationInProgress";
                            }
                        }

                        sortExtensions(newStatuses);
                        setStatuses(newStatuses);
                        return;
                    } else {
                        setStatuses(setAllStatuses(connectorCategory, "noConnector"));
                        throw `Unknown connector category ${connectorCategory}`;
                    }

                    const newStatuses = setAllStatuses(connectorCategory, "noConnector");
                    for (const connector of connectors) {
                        newStatuses[connector.data_source as ExtensionDataSource] = "connected";
                    }

                    sortExtensions(newStatuses);
                    setStatuses(newStatuses);
                } catch (error) {
                    if (error.status == 404) {
                        setStatuses(setAllStatuses(connectorCategory, "noConnector"));
                    } else {
                        throw error;
                    }
                }
            })();
        };
        fetchConnectivityState();
    }, [connectorCategory, dispatch]);

    return (
        <>
            {platforms.map((platform) => (
                <ExtensionCard
                    key={platform.dataSource}
                    data-testid={platform.dataSource}
                    status={statuses[platform.dataSource]}
                    name={platform.name}
                    description={t(platform.description)}
                    iconUrl={platform.iconUrl}
                    beta={platform.name === "Gedmouv"}
                    onClick={() => history.push(platform.dataSource)}
                    mt={4}
                />
            ))}
        </>
    );
};
