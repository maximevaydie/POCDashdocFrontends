import {LogisticPoint, useTimezone} from "@dashdoc/web-common";
import {Box, Icon, NoWrap, Text} from "@dashdoc/web-ui";
import {parseAndZoneDate} from "dashdoc-utils";
import React from "react";

import {DateCell} from "app/features/transport/transports-list/TransportColumns";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};
export function SecurityProtocolCell({logisticPoint}: Props) {
    const timezone = useTimezone();
    if (!logisticPoint.security_protocol) {
        return null;
    }
    const {document_title} = logisticPoint.security_protocol;
    const updated = parseAndZoneDate(logisticPoint.security_protocol.updated, timezone);
    return (
        <NoWrap>
            {document_title && (
                <Box style={{display: "grid", gridTemplateColumns: "min-content 1fr", gap: "4px"}}>
                    <Box>
                        <Icon name="commonFileText" fontSize={2} color="blue.default" />
                    </Box>
                    <Text variant="caption" lineHeight={0}>
                        <NoWrap>{document_title}</NoWrap>
                    </Text>
                </Box>
            )}
            {updated && (
                <Text variant="caption" lineHeight={0}>
                    <DateCell zonedDate={updated} />
                </Text>
            )}
        </NoWrap>
    );
}
