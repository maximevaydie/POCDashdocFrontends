import {usePrevious} from "dashdoc-utils";

import {SideSwipeType} from "../schedulerByDay.types";

export function useCalendarAnimation(startDate: Date) {
    const previousStartDate = usePrevious(startDate);
    const animation = previousStartDate
        ? getCalendarAnimationSide(previousStartDate, startDate)
        : "top";
    return animation;
}

export function getCalendarAnimationSide(prevDate: Date, newDate: Date): SideSwipeType {
    if (prevDate < newDate) {
        return "right";
    }
    if (prevDate > newDate) {
        return "left";
    }
    return "top";
}
