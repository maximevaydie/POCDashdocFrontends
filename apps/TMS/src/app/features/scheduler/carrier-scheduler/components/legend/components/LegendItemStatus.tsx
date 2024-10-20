import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

import {getTripDecoration} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tripStatus.constants";
import {TripStatus, TruckerStatus} from "app/features/trip/trip.types";

const LegendItemStatusStrippedIcon = styled(Box)<{
    backgroundColor: string;
}>(({backgroundColor}) =>
    themeAwareCss({
        width: "24px",
        height: "24px",
        border: "1px solid",
        borderColor: backgroundColor,
        borderRadius: 1,
        marginLeft: 1,
        background: `linear-gradient(-45deg, transparent 12.5%, white 12.5%, white 37.5%, transparent 37.5%, transparent 62.5%, white 62.5%, white 87.5%, transparent 87.5%)`,
        backgroundSize: "10px 10px",
        backgroundColor: backgroundColor,
    })
);
export function LegendItemStatus({
    status,
    truckerStatus,
}: {
    status: TripStatus;
    truckerStatus: TruckerStatus;
}) {
    const decoration = getTripDecoration({
        status,
        trucker_status: truckerStatus,
    });
    return (
        <Flex alignItems="center" justifyContent="space-between" width="250px">
            <Flex alignItems="center">
                <Flex
                    width="25px"
                    height="25px"
                    fontSize={1}
                    lineHeight={"12px"}
                    backgroundColor={decoration.color}
                    borderRadius="50%"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Icon
                        // @ts-ignore
                        name={decoration.statusIcon}
                        color="grey.white"
                        strokeWidth={decoration.statusIconStrokeWidth ?? 2.2}
                    />
                </Flex>
                {/*
// @ts-ignore */}
                <Box p={2}>{t(decoration.statusLabel)}</Box>
            </Flex>
            {decoration.strippedBackground && (
                <LegendItemStatusStrippedIcon backgroundColor={decoration.backgroundColor} />
            )}
        </Flex>
    );
}
