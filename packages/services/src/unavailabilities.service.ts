import {isAfter, isBefore, isSameSecond, tz} from "services/date";
import {TzDate, PartialUnavailability, Zone} from "types";

function getRelevantUnavailabilities(
    startTime: TzDate,
    endTime: TzDate,
    unavailabilities: PartialUnavailability[]
): PartialUnavailability[] {
    const result = unavailabilities.filter((unavailability) => {
        return isRelevant(startTime, endTime, unavailability);
    });
    return result;
}

/**
 * @deprecated only for tests
 */
function isRelevant(startTime: TzDate, endTime: TzDate, unavailability: PartialUnavailability) {
    const startUnavailability = tz.convert(unavailability.start_time, startTime.timezone);
    const endUnavailability = tz.convert(unavailability.end_time, startTime.timezone);
    return (
        (isBefore(startUnavailability, startTime) ||
            isSameSecond(startUnavailability, startTime)) &&
        (isAfter(endUnavailability, endTime) || isSameSecond(endUnavailability, endTime))
    );
}

function countUnavailableSlots(
    startTime: TzDate,
    endTime: TzDate,
    unavailabilities: PartialUnavailability[],
    zone: Zone
) {
    const relevantUnavailabilities = getRelevantUnavailabilities(
        startTime,
        endTime,
        unavailabilities
    );
    const result = relevantUnavailabilities.reduce((acc, unavailability) => {
        // infer the slot count when it's not provided
        const slot_count =
            unavailability.slot_count !== null ? unavailability.slot_count : zone.concurrent_slots;
        return acc + slot_count;
    }, 0);
    return result;
}

export const unavailabilitiesService = {countUnavailableSlots, isRelevant};
