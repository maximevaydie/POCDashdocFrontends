import {DayDensity} from "features/day-density/DayDensity";
import {zoneService} from "features/profile-portal/manager/zone/zone-column/zone.service";
import React from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectBookingStatusByZoneId} from "redux/reducers/flow/bookingStatus.slice";
import {TzDate, Zone} from "types";

type Props = {
    zone: Zone;
    startRange: TzDate | null;
    endRange: TzDate | null;
};
export function DayDensityContainer({zone, startRange, endRange}: Props) {
    const status = useSelector((state: RootState) => selectBookingStatusByZoneId(state, zone.id));
    const max = Math.ceil(60 / Math.max(1, zone.slot_duration)) * zone.concurrent_slots;
    const dayDensitySamples = zoneService.getDayDensitySamples(startRange, endRange, status, zone);
    return <DayDensity samples={dayDensitySamples} max={max} loading={false} />;
}
