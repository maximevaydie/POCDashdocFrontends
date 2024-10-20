import {parseDate} from "dashdoc-utils";

import type {Activity} from "app/types/transport";

type ActivityDateError = "start-before-end" | "unloading-start-before-loading-end";

/**Tells wether  the proposed start and end date for a given activity are correct.  */
export const setActivityDateError = (
    activity: Activity,
    proposedStartDate: Date,
    proposedEndDate: Date
): ActivityDateError | null => {
    if (proposedEndDate < proposedStartDate) {
        return "start-before-end";
    }

    if (activity.type !== "unloading") {
        return null;
    }

    if (
        !activity.deliveries.every((delivery) => {
            const delivery_real_end = parseDate(delivery.origin.real_end);

            return delivery_real_end === null ? true : delivery_real_end <= proposedStartDate;
        })
    ) {
        return "unloading-start-before-loading-end";
    }

    return null;
};
