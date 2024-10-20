import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {communicationStatusService} from "./communicationStatus.service";
import {CommunicationStatus} from "./types";

type EmailsRecapProps = {
    communicationStatuses: CommunicationStatus[];
};

export const EmailsRecapIcons = ({communicationStatuses}: EmailsRecapProps) => {
    const countsByStatus = communicationStatusService.getCountByStatus(communicationStatuses);

    return (
        <Flex style={{columnGap: "8px"}}>
            {countsByStatus.delivered > 0 && (
                <Flex style={{columnGap: "4px"}}>
                    <Icon name="checkCircle" color="green.dark" />
                    <Text color="green.dark">{countsByStatus.delivered}</Text>
                </Flex>
            )}
            {countsByStatus.bounced > 0 && (
                <Flex style={{columnGap: "4px"}}>
                    <Icon name="removeCircle" color="red.dark" />
                    <Text color="red.dark">{countsByStatus.bounced}</Text>
                </Flex>
            )}
            {countsByStatus.submitted > 0 && (
                <Flex style={{columnGap: "4px"}}>
                    <Icon name="history" color="blue.dark" />
                    <Text color="blue.dark">{countsByStatus.submitted}</Text>
                </Flex>
            )}
        </Flex>
    );
};
