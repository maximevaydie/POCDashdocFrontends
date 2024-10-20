import {Box} from "@dashdoc/web-ui";
import {GridSlot} from "features/profile-portal/manager/zone/zone-column/GridSlot";
import {HourLine} from "features/profile-portal/manager/zone/zone-column/HourLine";
import {GridSlotValue} from "features/profile-portal/manager/zone/zone-column/types";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectBookingStatusByZoneId} from "redux/reducers/flow/bookingStatus.slice";
import {metricsService} from "services/metrics.service";
import {Zone} from "types";

type Props = {
    hour: number;
    zone: Zone;
    gridSlotValue: GridSlotValue;
};
export function HourSection({hour, zone, gridSlotValue}: Props) {
    const timezone = useSiteTimezone();
    const status = useSelector((state: RootState) => selectBookingStatusByZoneId(state, zone.id));
    const {slots, opening, closing, inOpeningHours} = gridSlotValue;

    const {overloadedSlots} = metricsService.getMetrics(zone, status, timezone, hour);
    return (
        <Box width="100%">
            {(inOpeningHours || closing) && (
                <HourLine hour={hour} opening={opening} closing={closing} />
            )}
            <GridSlot slots={slots} zone={zone} overload={overloadedSlots > 0} />
        </Box>
    );
}
