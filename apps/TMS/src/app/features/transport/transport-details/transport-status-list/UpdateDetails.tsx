import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Flex, Text} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import isNil from "lodash.isnil";
import omitBy from "lodash.omitby";
import React from "react";

import {getRestTimeText} from "app/features/transport/rental/rental.service";
import {getListDiff} from "app/services/transport";

import type {Site, TransportStatus} from "app/types/transport";

export function UpdateDetails({
    update,
    siteCategory,
}: {
    update: TransportStatus;
    siteCategory?: Site["category"];
}) {
    const timezone = useTimezone();
    if (update.category === "rest.amended") {
        const updateDetails = update.update_details;
        const diff = {
            old: updateDetails?.old ? getRestTimeText(updateDetails.old, timezone) : null,
            new: updateDetails?.new ? getRestTimeText(updateDetails.new, timezone) : null,
        };
        return (
            <Flex style={{columnGap: "8px"}} alignItems="center">
                {diff.old && <Deleted>{diff.old}</Deleted>}
                {diff.new && <Mark>{diff.new}</Mark>}
            </Flex>
        );
    } else if (update.category === "supports_exchange.amended") {
        const labels =
            siteCategory === "loading"
                ? {
                      actual_retrieved: t("supportExchange.supportTaken"),
                      actual_delivered: t("supportExchange.supportDelivered"),
                  }
                : {
                      actual_retrieved: t("supportExchange.supportRecovered"),
                      actual_delivered: t("supportExchange.supportGivenBack"),
                  };

        const rows = [
            [
                labels["actual_retrieved"],
                update.update_details.actual_retrieved?.old,
                update.update_details.actual_retrieved?.new,
            ],
            [
                labels["actual_delivered"],
                update.update_details.actual_delivered?.old,
                update.update_details.actual_delivered?.new,
            ],
        ];
        return (
            <>
                {rows
                    .filter(([, old, new_]) => !isNil(old) || !isNil(new_))
                    .map(([label, old, new_], index) => (
                        <Flex style={{columnGap: "8px"}} alignItems="center" key={index}>
                            <Text>{label}</Text>
                            {!isNil(old) && <Deleted>{old}</Deleted>}
                            {!isNil(new_) && <Mark>{new_}</Mark>}
                        </Flex>
                    ))}
            </>
        );
    } else if (
        ["updated", "amended", "activity.amended", "delivery.added"].includes(update.category)
    ) {
        const updateDetails =
            update.category === "activity.amended"
                ? getUpdateDetailsForActivityAmended(update.update_details, timezone)
                : update.update_details;

        const listDiff = getListDiff(updateDetails, null);
        if (listDiff.length === 0) {
            return null;
        }

        return (
            <>
                {!!update.content && <Box>{update.content}</Box>}
                {listDiff.map((diff: Record<string, string>, index: number) => (
                    <Flex key={index} style={{columnGap: "8px"}} alignItems="center">
                        {!!diff.label && <Text>{diff.label}</Text>}
                        {!isNil(diff.old) && <Deleted>{diff.old}</Deleted>}
                        {!isNil(diff.new) && <Mark>{diff.new}</Mark>}
                    </Flex>
                ))}
            </>
        );
    } else if (
        update.category === "delivery_load.amended" &&
        // the diff in the event may be on fields not formatted, thus we hide this event to avoid confusion
        update.update_details.formatted_old_load !== update.update_details.formatted_new_load
    ) {
        return (
            <Flex style={{columnGap: "8px"}} alignItems="center">
                {update.update_details.formatted_old_load && (
                    <Deleted>{update.update_details.formatted_old_load}</Deleted>
                )}
                {update.update_details.formatted_new_load && (
                    <Mark>{update.update_details.formatted_new_load}</Mark>
                )}
            </Flex>
        );
    } else if (update.category === "checklist_filled") {
        return <Checklist checklist={update.update_details.checklist} />;
    }
    return null;
}

function getUpdateDetailsForActivityAmended(
    updateDetails: TransportStatus["update_details"],
    timezone: string
) {
    let real_start = null;
    let real_end = null;

    if (updateDetails?.real_start) {
        real_start = getUpdateDetail(updateDetails["real_start"], timezone);
    }
    if (updateDetails?.real_end) {
        real_end = getUpdateDetail(updateDetails["real_end"], timezone);
    }
    return omitBy({real_start, real_end}, isNil);
}

function getUpdateDetail(detail: {new: string; old?: string}, timezone: string) {
    let values = {};

    const newValue = formatDate(parseAndZoneDate(detail["new"], timezone), "Pp");
    values = {
        new: newValue,
    };

    if (detail?.old) {
        const oldValue = formatDate(parseAndZoneDate(detail["old"], timezone), "Pp");
        values = {...values, old: oldValue};
    }
    return values;
}

function Checklist({checklist}: {checklist: Array<{text: string; checked: boolean}>}) {
    return (
        <Box>
            {checklist.map((item) => (
                <Box key={item.text}>
                    <Checkbox label={item.text} checked={item.checked} disabled />
                </Box>
            ))}
        </Box>
    );
}

const Mark = styled("mark")`
    background-color: ${theme.colors.blue.ultralight};
    color: ${theme.colors.blue.default};
    padding: 4px 8px;
`;

const Deleted = styled("del")`
    background-color: ${theme.colors.grey.light};
    color: ${theme.colors.grey.dark};
    padding: 4px 8px;
`;
