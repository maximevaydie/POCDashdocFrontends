import {t} from "@dashdoc/web-core";
import {Badge, Box, Callout, Flex, Icon, LoadingWheel, Text} from "@dashdoc/web-ui";
import React from "react";

import {OauthStatus} from "../hooks/useCrudConnector";

import {ConnectivityStatusValue} from "./ConnectivityStatus";

export const StatusDisplay = ({
    status,
    extensionName,
}: {
    status: ConnectivityStatusValue | OauthStatus;
    extensionName: string;
}) => {
    switch (status) {
        case "connected":
            return (
                <Flex alignItems={"center"} data-testid="invoicing-connector-status-connected">
                    <Icon name="checkCircle" scale={[1.2, 1.2]} color="green.dark" mr={2} />
                    {t("settings.absence_manager.active", {
                        connectorSource: extensionName,
                    })}
                </Flex>
            );
        case "authenticationInProgress":
        case "validatingToken":
            return (
                <Box data-testid="invoicing-connector-status-authentication-in-procress">
                    <Callout>
                        <Text>{t("settings.invoicing.authenticationInProgress")}</Text>
                    </Callout>
                    <LoadingWheel />
                </Box>
            );
        case "redirectingToProvider":
            return (
                <Box data-testid="invoicing-connector-status-redirecting-to-provider">
                    <Callout>
                        <Text>{t("settings.invoicing.redirectingToProvider")}</Text>
                    </Callout>
                    <LoadingWheel />
                </Box>
            );
        case "connectivityIssue":
            return (
                <Callout
                    variant="warning"
                    data-testid="invoicing-connector-status-connectivity-issue"
                >
                    <Text>
                        {t("settings.absence_manager.error_connectivity", {
                            connectorSource: extensionName,
                        })}
                    </Text>
                </Callout>
            );
        case "authenticatingOnThirdParty":
            return (
                <Badge
                    maxWidth="fit-content"
                    variant="blue"
                    mt={4}
                    data-testid="invoicing-connector-status-pending-authentication"
                >
                    {t("settings.invoicing.pendingAuthentication")}
                </Badge>
            );
        default:
            return <Box />;
    }
};
