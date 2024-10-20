import {Brick, BrickLine} from "@dashdoc/web-ui";
import {tz} from "services/date";
import {unavailabilitiesService} from "services/unavailabilities.service";
import {AvailabilityStatus, PartialBookingStatus, Zone} from "types";

function toBrickLines(
    {availability_status, unavailabilities}: PartialBookingStatus,
    zone: Zone,
    timezone: string
): BrickLine[] {
    const lines: BrickLine[] = availability_status.map((availability) => {
        const bricks: Brick[] = [];
        [...Array(availability.max)].forEach((_, i) => {
            bricks.push({
                empty: i < availability.booked,
                selected: false,
            });
        });

        const startTime = tz.convert(availability.start_time, timezone);
        const endTime = tz.convert(availability.end_time, timezone);
        const nbUnavailableSlots = unavailabilitiesService.countUnavailableSlots(
            startTime,
            endTime,
            unavailabilities,
            zone
        );
        return toBrickLine(availability, nbUnavailableSlots, timezone);
    });
    return lines;
}

function toBrickLine(
    availability: AvailabilityStatus,
    nbUnavailableSlots: number,
    timezone: string
): BrickLine {
    const result: BrickLine = {
        label: `${tz.format({date: availability.start_time, timezone}, "HH:mm")}`,
        bricks: [...Array(availability.max)].map((_, i) =>
            toBrick(i, availability, nbUnavailableSlots)
        ),
    };
    return result;
}

function toBrick(
    index: number,
    {booked, max}: AvailabilityStatus,
    nbSlotUnavailable: number
): Brick {
    const empty = index >= booked;

    const selected = index >= max - nbSlotUnavailable;
    const result: Brick = {empty, selected};
    return result;
}

export const brickService = {toBrickLines};
