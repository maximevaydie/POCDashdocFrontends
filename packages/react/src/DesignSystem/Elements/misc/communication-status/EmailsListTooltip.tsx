import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React, {ReactElement} from "react";

import {CommunicationStatus} from "./types";

export type EmailsListTooltipProps = {
    title: string;
    children: Array<ReactElement<EmailsListTooltipItemProps>>;
    noEmailLabel: string;
};

export function EmailsListTooltip({title, children, noEmailLabel}: EmailsListTooltipProps) {
    return (
        <Flex flexDirection="column" style={{rowGap: "8px"}} p={2}>
            <Text
                pb={1}
                variant="h1"
                color="grey.dark"
                borderBottom={"1px solid"}
                borderBottomColor="grey.light"
                mb={1}
            >
                {title}
            </Text>
            {children.length > 0 ? children : <Text>{noEmailLabel}</Text>}
        </Flex>
    );
}

export type EmailsListTooltipItemProps = {
    communicationStatus: CommunicationStatus;
    timezone: string;
    children?: React.ReactNode;
};

export function EmailsListTooltipItem({
    communicationStatus,
    timezone,
    children,
}: EmailsListTooltipItemProps) {
    const {email, status, status_updated_at} = communicationStatus;
    return (
        <Flex key={email + status_updated_at} alignItems={"center"} mt={1}>
            <Flex flexDirection={"column"} mr={4}>
                <Flex alignItems={"center"}>
                    <Text fontWeight={"bold"} mr={2}>
                        {email}
                    </Text>
                    {children && children}
                </Flex>
                <Text color="grey.dark" mr={2}>
                    {t("common.onDateAtTime", {
                        date: formatDate(parseAndZoneDate(status_updated_at, timezone), "P"),
                        time: formatDate(parseAndZoneDate(status_updated_at, timezone), "p"),
                    }).toLowerCase()}
                </Text>
            </Flex>

            <Box flex={1} />

            <Flex style={{columnGap: "6px"}} mb={1}>
                {status === "delivered" ? (
                    <>
                        <Icon name="checkCircle" color="green.dark" />
                        <Text color="green.dark">{t("communicationStatus.received")}</Text>
                    </>
                ) : status === "bounced" ? (
                    <>
                        <Icon name="removeCircle" color="red.dark" />
                        <Text color="red.dark">{t("communicationStatus.error")}</Text>
                    </>
                ) : status === "submitted" ? (
                    <>
                        <Icon name="history" color="blue.dark" />
                        <Text color="blue.dark">{t("communicationStatus.ongoing")}</Text>
                    </>
                ) : null}
            </Flex>
        </Flex>
    );
}
