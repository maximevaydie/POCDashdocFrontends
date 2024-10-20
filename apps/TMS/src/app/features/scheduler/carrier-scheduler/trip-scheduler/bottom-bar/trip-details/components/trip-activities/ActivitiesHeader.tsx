import {t} from "@dashdoc/web-core";
import {Box, Flex, themeAwareCss, Text} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

import {
    CELL_WIDTHS,
    CELL_WIDTHS_PERCENT,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/trip-details/components/trip-activities/constants";

type Props = {
    isPreparedTrip: boolean;
    isComplexTransport: boolean;
    isTripStarted: boolean;
};

export function ActivitiesHeader({isPreparedTrip, isComplexTransport, isTripStarted}: Props) {
    return (
        <Flex
            borderBottom={"1px solid"}
            borderColor="grey.light"
            backgroundColor={"grey.ultralight"}
            mb={-3}
            position="sticky"
            top={0}
            zIndex="level2"
        >
            <Cell
                width={CELL_WIDTHS_PERCENT.index}
                minWidth={CELL_WIDTHS.index}
                position="sticky"
                left={0}
                backgroundColor={"grey.ultralight"}
            ></Cell>
            {(isPreparedTrip || isComplexTransport) && (
                <Cell width={CELL_WIDTHS_PERCENT.activities} minWidth={CELL_WIDTHS.activities}>
                    <Text variant="caption" ellipsis>
                        {t("common.activities")}
                    </Text>
                </Cell>
            )}
            <Cell width={CELL_WIDTHS_PERCENT.address} minWidth={CELL_WIDTHS.address}>
                <Text variant="caption" ellipsis>
                    {t("common.address")}
                </Text>
            </Cell>
            {isTripStarted && (
                <Cell width={CELL_WIDTHS_PERCENT.realDates} minWidth={CELL_WIDTHS.realDates}>
                    <Text variant="caption" ellipsis>
                        {t("common.actualDates")}
                    </Text>
                </Cell>
            )}
            <Cell width={CELL_WIDTHS_PERCENT.date} minWidth={CELL_WIDTHS.date}>
                <Text variant="caption" ellipsis>
                    {t("common.plannedDates")}
                </Text>
            </Cell>
            <Cell width={CELL_WIDTHS_PERCENT.alertDate} minWidth={CELL_WIDTHS.alertDate}>
                <Text variant="caption" ellipsis>
                    {t("common.askedDates")}
                </Text>
            </Cell>
            <Cell width={CELL_WIDTHS_PERCENT.loads} minWidth={CELL_WIDTHS.loads}>
                <Text variant="caption" ellipsis>
                    {t("common.loads")}
                </Text>
            </Cell>
            {isPreparedTrip && (
                <Cell width={CELL_WIDTHS_PERCENT.shipper} minWidth={CELL_WIDTHS.shipper}>
                    <Text variant="caption" ellipsis>
                        {t("common.shipper")}
                    </Text>
                </Cell>
            )}
        </Flex>
    );
}

const Cell = styled(Box)(
    themeAwareCss({
        borderRight: "1px solid",
        borderColor: "grey.light",
        px: 1,
        py: 2,
    })
);
