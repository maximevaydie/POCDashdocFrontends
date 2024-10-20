import {Flex, Icon, NoWrap, Box} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

export function InvoiceDueDate({
    dueDate,
    isLate,
    compact,
}: {
    dueDate: string | null;
    isLate: boolean;
    compact?: boolean;
}) {
    return dueDate && isLate ? (
        <Flex>
            <Flex
                backgroundColor="red.ultralight"
                px={2}
                py={compact ? 0 : 1}
                color="red.dark"
                flexDirection="row"
            >
                <NoWrap color="red.dark">{formatDate(dueDate, "P")}</NoWrap>
                <Icon name="calendarTimes" ml={2} />
            </Flex>
            <Box flex={1} />
        </Flex>
    ) : (
        <NoWrap px={compact ? 2 : 0}>{formatDate(dueDate, "P")}</NoWrap>
    );
}
