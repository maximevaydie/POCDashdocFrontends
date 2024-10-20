import {PartnerInListOutput, useTimezone} from "@dashdoc/web-common";
import {NoWrap, Text} from "@dashdoc/web-ui";
import {parseAndZoneDate} from "dashdoc-utils";
import React from "react";

import {DateCell} from "app/features/transport/transports-list/TransportColumns";

type Props = {
    partner: PartnerInListOutput;
};

export function CreatedByCell({partner}: Props) {
    const timezone = useTimezone();
    const zonedDate = parseAndZoneDate(partner.created ?? null, timezone);
    const createdByArray = [partner.created_by.user_name, partner.created_by.company_name].filter(
        (value) => value !== null
    );

    return (
        <NoWrap>
            {createdByArray && (
                <Text variant="caption" lineHeight={0}>
                    {createdByArray.join(" - ")}
                </Text>
            )}
            {zonedDate && (
                <Text variant="caption" lineHeight={0}>
                    <DateCell zonedDate={zonedDate} />
                </Text>
            )}
        </NoWrap>
    );
}
