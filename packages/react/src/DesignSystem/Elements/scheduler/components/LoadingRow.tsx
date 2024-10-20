import React from "react";

import {Box} from "../../layout";
import {
    CarrierRevenueCell,
    CarrierSchedulerBodyRow,
    CarrierSchedulerRowHeadingCell,
    LoadingTextPlaceholder,
} from "../gridStyles";

export const LoadingRow = React.memo(function LoadingRow({rowNumber}: {rowNumber: number}) {
    return (
        <CarrierSchedulerBodyRow key={`loading-${rowNumber}`} isOddRow={rowNumber % 2 === 0}>
            <CarrierSchedulerRowHeadingCell>
                <LoadingTextPlaceholder />
            </CarrierSchedulerRowHeadingCell>
            <CarrierRevenueCell isOddRow={rowNumber % 2 === 0}>
                <LoadingTextPlaceholder />
            </CarrierRevenueCell>
            <Box flex={1} borderBottom={"1px solid"} borderColor="grey.light" />
        </CarrierSchedulerBodyRow>
    );
});
