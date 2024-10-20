import {GridSlotValue} from "features/profile-portal/manager/zone/zone-column/types";
import {addHours, getWeekday, isAfter, isBefore, isSameHour, tz} from "services/date";
import {metricsService} from "services/metrics.service";
import {slotServices} from "services/slot.service";
import {BookingStatus, DayOpeningHours, PartialBookingStatus, TzDate, Weekday, Zone} from "types";

function getGridSlots(
    zone: Zone,
    status: BookingStatus,
    weekday: Weekday,
    timezone: string
): {[hour: number]: GridSlotValue} {
    const {opening_hours} = zone;
    const result: {[hour: number]: GridSlotValue} = {};
    if (weekday in opening_hours) {
        const dayOpeningHours = opening_hours[weekday];
        let closed = true;
        let atLeastOneOpenedVisited = false;

        const {scheduled_slots, availability_status, unavailabilities} = status;
        for (let hour = 0; hour < 24; hour++) {
            let slots = scheduled_slots
                .filter((slot) => {
                    const startTime = tz.convert(slot.start_time, timezone);
                    return startTime?.getHours() === hour;
                })
                // A slot under several days should appear only once
                .filter((slot) => {
                    const startTime = tz.convert(slot.start_time, timezone);
                    const startTimeWeekday = getWeekday(startTime);
                    return startTimeWeekday === weekday;
                });

            const relevantAvailabilities = availability_status.filter((availability) => {
                const startTime = tz.convert(availability.start_time, timezone);
                const endTime = tz.convert(availability.end_time, timezone);
                return (
                    startTime.getHours() === hour ||
                    (startTime.getHours() < hour && endTime.getHours() > hour)
                );
            });
            const realMax = metricsService.realMax(
                {
                    availability_status: relevantAvailabilities,
                    unavailabilities,
                },
                zone,
                timezone
            );

            slots = slotServices.sort(slots, timezone);
            const opened = realMax > 0 && isOpen(hour, dayOpeningHours);

            if (opened) {
                const opening = closed;
                closed = false;
                const closing = false;
                const inOpeningHours = true;
                const value: GridSlotValue = {slots, opening, closing, inOpeningHours};
                result[hour] = value;
                atLeastOneOpenedVisited = true;
            } else {
                let closing = false;
                const opening = false;
                if (atLeastOneOpenedVisited && closed === false) {
                    closed = true;
                    closing = true;
                    const inOpeningHours = false;
                    const value: GridSlotValue = {
                        slots,
                        opening,
                        closing,
                        inOpeningHours,
                    };
                    result[hour] = value;
                } else {
                    if (slots.length > 0) {
                        const inOpeningHours = false;
                        const value: GridSlotValue = {
                            slots,
                            opening,
                            closing,
                            inOpeningHours,
                        };
                        result[hour] = value;
                    }
                }
            }
        }
    }
    return result;
}

function isOpen(hour: number, dayOpeningHours: DayOpeningHours) {
    if (isAlwaysOpen(dayOpeningHours)) {
        return true;
    } // Check for open all day

    return dayOpeningHours.some(([start, end]) => {
        const [startHour] = start.split(":");
        const [endHour] = end.split(":");
        return hour >= parseInt(startHour) && hour < parseInt(endHour);
    });
}

function isAlwaysOpen(dayOpeningHours: DayOpeningHours) {
    return dayOpeningHours.some(([start, end]) => start === "00:00" && end === "00:00");
}

/**
 * @deprecated only available for testing
 */
function getDayDensitySamples(
    startRange: TzDate | null,
    endRange: TzDate | null,
    bookingStatus: PartialBookingStatus,
    zone: Zone
): DayDensitySample[] {
    const result: DayDensitySample[] = [];
    if (startRange === null || endRange === null) {
        return result;
    }
    let time = tz.clone(startRange);
    while (isBefore(time, endRange) || isSameHour(time, endRange)) {
        const sample = getDayDensitySample(time, bookingStatus, zone);
        result.push(sample);
        time = addHours(time, 1);
    }
    return result;
}

function getDayDensitySample(
    time: TzDate,
    {availability_status, unavailabilities}: PartialBookingStatus,
    zone: Zone
): DayDensitySample {
    const availabilitiesOnTime = availability_status.filter((availability) => {
        const startTime = tz.convert(availability.start_time, time.timezone);
        const endTime = tz.convert(availability.end_time, time.timezone);
        return (
            isSameHour(time, startTime) || (isBefore(startTime, time) && isAfter(endTime, time))
        );
    });
    const realMax = metricsService.realMax(
        {availability_status: availabilitiesOnTime, unavailabilities},
        zone,
        time.timezone
    );
    if (realMax > 0) {
        const bookedSum = availabilitiesOnTime
            .map((availability) => availability.booked)
            .reduce((acc, value) => {
                return acc + value;
            }, 0);
        return bookedSum;
    } else {
        return "unavailable";
    }
}

function getDayDensityTimeRange(bookingStatus: BookingStatus[], timezone: string) {
    // find the first and last available time to build the samples with same length across all zones
    const startDate = bookingStatus
        .flatMap((status) =>
            status.availability_status.length > 0 ? status.availability_status[0].start_time : null
        )
        .filter((start_time) => start_time !== null)
        .map((start_time) => tz.convert(start_time as string, timezone))
        .reduce((a, b) => {
            if (a === null) {
                return b;
            }
            return isBefore(a, b) ? a : b;
        }, null);

    const endDate = bookingStatus
        .flatMap((status) =>
            status.availability_status.length > 0
                ? status.availability_status[status.availability_status.length - 1].start_time
                : null
        )
        .filter((start_time) => start_time !== null)
        .map((start_time) => tz.convert(start_time as string, timezone))
        .reduce((a, b) => {
            if (a === null) {
                return b;
            }
            return isAfter(a, b) ? a : b;
        }, null);
    return {startDate, endDate};
}

export type DayDensitySample = number | "unavailable";

export const zoneService = {
    getGridSlots,
    getDayDensityTimeRange,
    getDayDensitySample,
    getDayDensitySamples,
};
