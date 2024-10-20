import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React, {useState} from "react";

import {communicationStatusService} from "./communicationStatus.service";
import {EmailsRecapIcons} from "./EmailsRecapIcons";
import {CommunicationStatus} from "./types";

type LastEmailStatusProps = {
    communicationStatuses: CommunicationStatus[];
    timezone: string;
    onClick?: () => void;
};

export const LastEmailStatus = ({
    communicationStatuses,
    timezone,
    onClick,
}: LastEmailStatusProps) => {
    const isSubmitting = communicationStatusService.isSubmitting(communicationStatuses);
    const sortedCommunicationStatuses = communicationStatusService.sort(communicationStatuses);

    const lastEmailSent = t("communicationStatus.lastEmailSent", {
        date: formatDate(
            parseAndZoneDate(sortedCommunicationStatuses[0].status_updated_at, timezone),
            "P"
        ),
        time: formatDate(
            parseAndZoneDate(sortedCommunicationStatuses[0].status_updated_at, timezone),
            "p"
        ),
    });

    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            {isSubmitting ? (
                <Text variant="caption" color="grey.dark">
                    {t("communicationStatus.emailSending")}
                </Text>
            ) : (
                <Flex alignItems={"center"}>
                    {onClick ? (
                        <Text
                            variant="caption"
                            color={isHovered ? "blue.default" : "grey.dark"}
                            onPointerEnter={() => setIsHovered(true)}
                            onPointerLeave={() => setIsHovered(false)}
                            onClick={onClick}
                        >
                            {lastEmailSent}
                        </Text>
                    ) : (
                        <Text variant="caption" color="grey.dark">
                            {lastEmailSent}
                        </Text>
                    )}
                    <Box ml={2} />
                    <EmailsRecapIcons communicationStatuses={communicationStatuses} />
                </Flex>
            )}
        </>
    );
};
