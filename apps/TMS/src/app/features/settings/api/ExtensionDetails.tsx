import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {Connector} from "dashdoc-utils";
import React, {useState} from "react";

import {ExtensionConnectivity} from "app/features/settings/api/ExtensionConnectivity";
import {ExtensionMappings} from "app/features/settings/api/ExtensionMappings";
import {BackToLink} from "app/features/settings/BackToLink";

import {getExtensionCard, getRoute, getTranslationKeys} from "../extensions.service";

import {ConnectivityStatusValue} from "./ConnectivityStatus";
import {ExtensionHeader} from "./ExtensionHeader";
import {ConnectorCategory, ExtensionDataSource, ExtensionKey} from "./types";

export const ExtensionDetails = ({
    dataSource,
    connectorCategory,
}: {
    dataSource: ExtensionDataSource;
    connectorCategory: ConnectorCategory;
}) => {
    const extensionCard = getExtensionCard(connectorCategory, dataSource);
    const translationKeys: ExtensionKey = getTranslationKeys(connectorCategory);
    const [status, setStatus] = useState<ConnectivityStatusValue>("loading");
    const [connector, setConnector] = useState<Connector | undefined>(undefined);

    return (
        <Flex flexDirection="column" mt={3} pb="15em">
            <BackToLink label={translationKeys.backToList} route={getRoute(connectorCategory)} />
            <ExtensionHeader {...extensionCard} description={t(extensionCard.description)} />
            <ExtensionConnectivity
                status={status}
                connector={connector}
                dataSource={dataSource}
                connectorCategory={connectorCategory}
                updateStatus={setStatus}
                updateConnector={setConnector}
            />
            {status === "connected" && (
                <ExtensionMappings
                    dataSource={dataSource}
                    connectorCategory={connectorCategory}
                    connector={connector}
                />
            )}
        </Flex>
    );
};
