import {addDays, isSameDay, isAfter, isSameWeek, tz} from "services/date";
import {Slot, TzDate} from "types";

type Props = {
    slots: Slot[];
    siteDate: TzDate;
};

type SlotGroups = {
    today: Slot[];
    tomorrow: Slot[];
    thisWeek: Slot[];
    later: Slot[];
};

export function groupSlotsByTimeRange({slots, siteDate}: Props): SlotGroups {
    const slotByTimeRange: SlotGroups = {
        today: [],
        tomorrow: [],
        thisWeek: [],
        later: [],
    };

    if (slots != null) {
        slots.forEach((slot) => {
            const {start_time} = slot;
            const startDate = tz.convert(start_time, siteDate.timezone);
            if (isSameDay(siteDate, startDate)) {
                // Today
                slotByTimeRange.today.push(slot);
            } else if (isSameDay(addDays(siteDate, 1), startDate)) {
                // Tomorrow
                slotByTimeRange.tomorrow.push(slot);
            } else if (isSameWeek(siteDate, startDate)) {
                // This week but not today or tomorrow
                slotByTimeRange.thisWeek.push(slot);
            } else if (isAfter(startDate, siteDate)) {
                // Later
                slotByTimeRange.later.push(slot);
            }
        });
    }

    return slotByTimeRange;
}
