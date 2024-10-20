import {Box, DeprecatedIcon} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import React from "react";

import {RawCarrierCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {CardAddressText} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/CardAddressText";

/**
 * Display origin and destination information of a segment.
 */
export function SegmentSummary({segment}: {segment: RawCarrierCharteringSchedulerSegment}) {
    return (
        <Box>
            <Box as="span" mr={1}>
                <CardAddressText address={segment.origin.address} maxLength={5} />
            </Box>
            <DeprecatedIcon
                name="long-arrow-alt-right"
                css={css`
                    line-height: 1.5;
                `}
            />
            <Box as="span" ml={1}>
                <CardAddressText address={segment.destination.address} maxLength={5} />
            </Box>
        </Box>
    );
}
