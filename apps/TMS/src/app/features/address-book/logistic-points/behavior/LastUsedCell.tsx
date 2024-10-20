import {LogisticPoint, useTimezone} from "@dashdoc/web-common";
import {NoWrap, Text} from "@dashdoc/web-ui";
import {parseAndZoneDate} from "dashdoc-utils";
import React from "react";

import {DateCell} from "app/features/transport/transports-list/TransportColumns";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};
export function LastUsedCell({logisticPoint}: Props) {
    const timezone = useTimezone();
    if (!logisticPoint.last_used) {
        return null;
    }
    const lastUsed = parseAndZoneDate(logisticPoint.last_used, timezone);
    return (
        <NoWrap>
            <Text variant="caption" lineHeight={0}>
                <DateCell zonedDate={lastUsed} />
            </Text>
        </NoWrap>
    );
}
