import {t} from "@dashdoc/web-core";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectBookingStatusByZoneId} from "redux/reducers/flow/bookingStatus.slice";
import {metricsService} from "services/metrics.service";
import {Zone} from "types";

type Props = {
    zone: Zone;
};

export function ZoneMetrics({zone}: Props) {
    const timezone = useSiteTimezone();
    const status = useSelector((state: RootState) => selectBookingStatusByZoneId(state, zone.id));
    const {bookedSlots, maxSlots, unavailableSlots, freeTime} = metricsService.getMetrics(
        zone,
        status,
        timezone
    );
    const realMaxSlots = maxSlots - unavailableSlots;

    let freeTimeFormated = t("common.notDefined");
    if (freeTime > 0) {
        const hoursLeft = Math.floor(freeTime / 60);
        if (hoursLeft > 0) {
            // we ignore minutes if we have hours
            freeTimeFormated = `${t("common.availableHours", {
                smart_count: hoursLeft,
            })}`;
        } else {
            const minutesLeft = freeTime % 60;
            freeTimeFormated = `${t("common.availableMinutes", {
                smart_count: minutesLeft,
            })}`;
        }
    }

    const placeholder =
        realMaxSlots > 0
            ? `${bookedSlots}/${realMaxSlots} ${t("flow.availableSlots")} - ${freeTimeFormated}`
            : t("flow.noAvailableSlot");

    return <>{placeholder}</>;
}
