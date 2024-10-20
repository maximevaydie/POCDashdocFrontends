import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {getLocaleData} from "dashdoc-utils";
import {differenceInSeconds, formatDistance, formatDuration, intervalToDuration} from "date-fns";
import React from "react";

import ActivityCell from "app/features/transport/transport-details/transport-details-activities/activity/activity-cell";
import {activityService} from "app/services/transport/activity.service";

import type {Activity} from "app/types/transport";

type Props = {
    activity: Activity;
};

export function ActivityDuration({activity}: Props) {
    if (!activity.site.real_end || !activity.site.real_start) {
        return null;
    }
    const shouldDisplayDuration = activityService.isActivityComplete(activity);
    const startDate = new Date(activity.site.real_start);
    const endDate = new Date(activity.site.real_end);
    const durationText = getDurationText(startDate, endDate);

    return (
        shouldDisplayDuration &&
        durationText && (
            <ActivityCell>
                <Text variant="captionBold" mb={1}>
                    {t("filter.durationOnSite")}
                </Text>
                <Text>{durationText}</Text>
            </ActivityCell>
        )
    );
}

function getDurationText(startDate: Date, endDate: Date): string | null {
    const diffInSeconds = differenceInSeconds(endDate, startDate);

    // If duration < 1 second we assume activity start and end are equal (e.g. rental activity).
    // We don't want to display the duration in this case
    if (diffInSeconds === 0) {
        return null;
    }

    // If duration is less than 1 minute, we display an approximation (e.g. Less than 1 minute)
    if (diffInSeconds < 60) {
        return formatDistance(endDate, startDate, {
            locale: getLocaleData(),
        });
    }

    const activityDuration = intervalToDuration({
        start: startDate,
        end: endDate,
    });

    return formatDuration(
        {
            ...activityDuration,
            seconds: 0,
        },
        {
            locale: getLocaleData(),
        }
    );
}
