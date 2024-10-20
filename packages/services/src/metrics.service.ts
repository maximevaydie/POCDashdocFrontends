import {tz} from "services/date";
import {unavailabilitiesService} from "services/unavailabilities.service";
import {PartialBookingStatus, Zone} from "types";

export type DayDensitySample = number | "unavailable";

export type Metrics = {
    /**
     * Number of booked Slots
     */
    bookedSlots: number;
    /**
     * Number of overloaded Slots
     */
    overloadedSlots: number /**
     * Number of available Slots
     */;
    availableSlots: number;
    /**
     * Number of unavailable Slots
     */
    unavailableSlots: number;
    /**
     * Number of slots available
     */
    maxSlots: number;

    /**
     * Total free time in minutes
     */
    freeTime: number;
};

function getMetrics(
    zone: Zone,
    {availability_status, unavailabilities}: PartialBookingStatus,
    timezone: string,
    hour?: number // filter on a specific hour
): Metrics {
    const result: Metrics = {
        bookedSlots: 0,
        maxSlots: 0,
        freeTime: 0,
        availableSlots: 0,
        unavailableSlots: 0,
        overloadedSlots: 0,
    };
    const relevantAvailabilityStatus =
        hour === undefined
            ? availability_status
            : availability_status.filter((availability) => {
                  const startTime = tz.convert(availability.start_time, timezone);
                  return startTime.getHours() === hour;
              });
    for (const availability of relevantAvailabilityStatus) {
        // Current availability state
        const bookedSlots = availability.booked;
        const maxSlots = availability.max;
        const realMaxSlot = realMax(
            {availability_status: [availability], unavailabilities},
            zone,
            timezone
        );
        const availableSlots = Math.max(0, realMaxSlot - bookedSlots);
        const freeTime = availableSlots * zone.slot_duration;
        const startTime = tz.convert(availability.start_time, timezone);
        const endTime = tz.convert(availability.end_time, timezone);
        const unavailableSlots = unavailabilitiesService.countUnavailableSlots(
            startTime,
            endTime,
            unavailabilities,
            zone
        );
        const overloadedSlots = Math.max(0, bookedSlots + unavailableSlots - availability.max);
        // Increment result
        result.bookedSlots += bookedSlots;
        result.maxSlots += maxSlots;
        result.freeTime += freeTime;
        result.availableSlots += availableSlots;
        result.unavailableSlots += unavailableSlots;
        result.overloadedSlots += overloadedSlots;
    }
    return result;
}

/**
 * Count the real number of max slot (theoretical max - unavailable slots)
 */
function realMax(
    {availability_status, unavailabilities}: PartialBookingStatus,
    zone: Zone,
    timezone: string
) {
    const result = availability_status.reduce((acc, availability) => {
        const startTime = tz.convert(availability.start_time, timezone);
        const endTime = tz.convert(availability.end_time, timezone);
        const unavailableSlots = unavailabilitiesService.countUnavailableSlots(
            startTime,
            endTime,
            unavailabilities,
            zone
        );
        const max = Math.max(0, availability.max - unavailableSlots);
        return acc + max;
    }, 0);
    return result;
}

export const metricsService = {
    getMetrics,
    realMax,
};
