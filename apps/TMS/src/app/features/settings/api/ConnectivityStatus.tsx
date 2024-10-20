import {t, TranslationKeys} from "@dashdoc/web-core";
import {Box, Flex, FlexProps} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export type ConnectivityStatusValue =
    | "loading"
    | "connected"
    | "noConnector"
    | "authenticationInProgress"
    | "connectivityIssue"
    | "instantiated"
    | "notInstantiated";

export type ConnectivityStatusProps = FlexProps & {
    status: ConnectivityStatusValue;
};
export const ConnectivityStatus: FunctionComponent<ConnectivityStatusProps> = ({
    status,
    ...flexProps
}) => {
    const statusDisplay: {
        [index in Exclude<ConnectivityStatusValue, "loading">]: {
            label: TranslationKeys;
            color: string;
        };
    } = {
        connected: {
            label: "settings.extensions.connected",
            color: "green.default",
        },
        authenticationInProgress: {
            label: "settings.extensions.authenticationInProgress",
            color: "yellow.default",
        },
        noConnector: {
            label: "settings.extensions.noConnector",
            color: "grey.dark",
        },
        connectivityIssue: {
            label: "settings.extensions.connectivityIssue",
            color: "yellow.default",
        },
        instantiated: {
            label: "settings.extensions.instantiated",
            color: "green.default",
        },
        notInstantiated: {
            label: "settings.extensions.notInstantiated",
            color: "grey.dark",
        },
    };

    return (
        <Flex
            alignItems="center"
            style={{gap: "8px"}}
            data-testid={`connectivity-status-${status}`}
            {...flexProps}
        >
            {status === "loading" && <LoadingWheel small />}
            {status !== "loading" && (
                <>
                    <Box
                        backgroundColor={statusDisplay[status].color}
                        p="6px"
                        borderRadius="6px"
                        height="6px"
                    />
                    <Box>{t(statusDisplay[status].label)}</Box>
                </>
            )}
        </Flex>
    );
};
