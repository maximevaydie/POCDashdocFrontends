import {Box, Flex, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "app/features/trip/trip.types";

import {CELL_WIDTHS, CELL_WIDTHS_PERCENT} from "../constants";

import {Address} from "./components/Address";
import {
    RealDates,
    ScheduledDates,
    AlertAskedDatesOnMergedActivity,
    AlertAskedDates,
} from "./components/Dates";
import {DeliveryLink} from "./components/DeliveryLink";
import {IndexAndStatus} from "./components/IndexAndStatus";
import {Loads} from "./components/Loads";
import {ShipperName} from "./components/ShipperName";

type Props = {
    tripUid: string;
    activity: SimilarActivityWithTransportData;
    index: number | "similar";
    decoration: Decoration;
    isPreparedTrip: boolean;
    isTripStarted: boolean;
    isComplexTransport: boolean;
    badgeVariantByUid: Record<string, TransportBadgeVariant>;
    isLastItemOfGroup: boolean;
    isCollapsed: boolean;
    onExpandCollapse?: () => void;
    editable: boolean;
    draggable: boolean;
};

export function ActivityRow({
    tripUid,
    activity,
    index,
    decoration,
    isPreparedTrip,
    isTripStarted,
    isComplexTransport,
    badgeVariantByUid,
    isLastItemOfGroup,
    isCollapsed,
    onExpandCollapse,
    editable,
    draggable,
}: Props) {
    const isMergedActivity = activity.similarUids.length > 1;
    const linkedToNextActivity =
        (isMergedActivity && !isCollapsed) || (index === "similar" && !isLastItemOfGroup);
    return (
        <Flex
            borderBottom={linkedToNextActivity ? "1px dashed" : "1px solid"}
            borderColor="grey.light"
            backgroundColor={index === "similar" ? "grey.ultralight" : "grey.white"}
            width="100%"
            css={{
                "&:hover #draggable-icon": {
                    display: draggable ? "flex" : "none",
                },
                "&:hover #activity-index": {
                    display: draggable ? "none" : "flex",
                },
            }}
            data-testid={`activity-row`}
        >
            <Cell
                minWidth={CELL_WIDTHS.index}
                width={CELL_WIDTHS_PERCENT.index}
                position="sticky"
                left={0}
                backgroundColor={"grey.white"}
                zIndex="level1"
                style={draggable ? {cursor: "grab"} : undefined}
            >
                <IndexAndStatus
                    activity={activity}
                    index={index}
                    decoration={decoration}
                    linkToNextActivity={linkedToNextActivity}
                />
            </Cell>
            {(isPreparedTrip || isComplexTransport) && (
                <Cell minWidth={CELL_WIDTHS.activities} width={CELL_WIDTHS_PERCENT.activities}>
                    <DeliveryLink
                        activity={activity}
                        badgeVariantByUid={badgeVariantByUid}
                        isCollapsed={isCollapsed}
                        onExpandCollapse={onExpandCollapse}
                        isPreparedTrip={isPreparedTrip}
                    />
                </Cell>
            )}
            <Cell minWidth={CELL_WIDTHS.address} width={CELL_WIDTHS_PERCENT.address}>
                <Address
                    activity={activity}
                    isMergedActivity={isMergedActivity}
                    editable={editable}
                />
            </Cell>
            {isTripStarted && (
                <Cell minWidth={CELL_WIDTHS.realDates} width={CELL_WIDTHS_PERCENT.realDates}>
                    <RealDates activity={activity} />
                </Cell>
            )}
            <Cell minWidth={CELL_WIDTHS.date} width={CELL_WIDTHS_PERCENT.date}>
                <ScheduledDates tripUid={tripUid} activity={activity} editable={editable} />
            </Cell>
            <Cell minWidth={CELL_WIDTHS.alertDate} width={CELL_WIDTHS_PERCENT.alertDate}>
                {isMergedActivity ? (
                    <AlertAskedDatesOnMergedActivity activity={activity} />
                ) : (
                    <AlertAskedDates tripUid={tripUid} activity={activity} editable={editable} />
                )}
            </Cell>
            <Cell minWidth={CELL_WIDTHS.loads} width={CELL_WIDTHS_PERCENT.loads}>
                <Loads activity={activity} isMergedActivity={isMergedActivity} />
            </Cell>
            {isPreparedTrip && (
                <Cell minWidth={CELL_WIDTHS.shipper} width={CELL_WIDTHS_PERCENT.shipper}>
                    <ShipperName activity={activity} />
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
