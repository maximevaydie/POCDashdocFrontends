import {Box} from "@dashdoc/web-ui";
import {zoneService} from "features/profile-portal/manager/zone/zone-column/zone.service";
import {ZoneColumn} from "features/profile-portal/manager/zone/zone-column/ZoneColumn";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useSelector} from "react-redux";
import {selectBookingStatus} from "redux/reducers/flow/bookingStatus.slice";
import {selectZones} from "redux/reducers/flow/zone.slice";
import {BookingStatus, Zone} from "types";

export function Zones() {
    const zones = useSelector(selectZones);
    const bookingStatus = useSelector(selectBookingStatus);
    const timezone = useSiteTimezone();
    const {startDate, endDate} = zoneService.getDayDensityTimeRange(bookingStatus, timezone);
    return (
        <>
            <Box
                overflowX="auto"
                p={4}
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${zones.length}, minmax(320px, 400px))`,
                    gap: "16px",
                }}
            >
                {zones.map((zone) => {
                    return (
                        <ZoneColumn
                            key={zone.id}
                            zone={zone}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    );
                })}
            </Box>
        </>
    );
}
export function getStatus(zone: Zone, bookingStatus: BookingStatus[]): BookingStatus {
    const status = bookingStatus.find((status) => zone.id === status.id);
    if (!status) {
        // In any case, we should never have a zone without a BookingStatus
        return {id: zone.id, availability_status: [], unavailabilities: [], scheduled_slots: []};
    }
    return status;
}
