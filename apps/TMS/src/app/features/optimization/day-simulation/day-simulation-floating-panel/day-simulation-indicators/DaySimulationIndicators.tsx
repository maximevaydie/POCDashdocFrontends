import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {differenceInMinutes, differenceInSeconds} from "date-fns";
import React, {FunctionComponent} from "react";

import {formatMinutesDuration} from "app/features/trip/trip.service";
import {formatEstimatedDrivingTime} from "app/features/trip/trip.service";

import {daySimulationService} from "../../day-simulation.service";
import {DaySimulationTrip} from "../../day-simulation.types";

import {DaySimulationIndicator} from "./DaySimulationIndicator";

interface DaySimulationIndicatorsProps {
    trips: DaySimulationTrip[];
}

export const DaySimulationIndicators: FunctionComponent<DaySimulationIndicatorsProps> = ({
    trips,
}) => {
    const timezone = useTimezone();

    const activities = trips.map(({activities}) => activities).flat();

    const distance = getDistance();
    const emptyKm = getEmptyKm();
    const drivingTime = getDrivingTime();
    const dayDuration = getDayDuration();

    return (
        <Flex backgroundColor="grey.light" py={3} px={3}>
            <DaySimulationIndicator
                iconName="truck"
                label={t("trip.estimatedDistance")}
                value={
                    distance !== null
                        ? `${distance} ${t("pricingMetrics.unit.distance.short")}`
                        : null
                }
                testid="distance"
            />
            <DaySimulationIndicator
                iconName="truck"
                label={t("optimization.emptyKm")}
                value={
                    emptyKm !== null
                        ? `${emptyKm} ${t("pricingMetrics.unit.distance.short")}`
                        : null
                }
                testid="empty-km"
            />
            <DaySimulationIndicator
                iconName="clock"
                label={t("optimization.driving")}
                value={drivingTime !== null ? formatEstimatedDrivingTime(drivingTime) : null}
                testid="driving-time"
            />
            <DaySimulationIndicator
                iconName="person"
                label={t("optimization.day")}
                value={dayDuration !== null ? formatMinutesDuration(dayDuration) : null}
                testid="day-duration"
            />
        </Flex>
    );

    function getDistance(): number | null {
        let distance: number = 0;
        for (const activity of activities.slice(0, -1)) {
            if (activity.estimated_distance_to_next_activity === null) {
                return null;
            }
            distance += activity.estimated_distance_to_next_activity;
        }
        return distance;
    }

    function getEmptyKm(): number | null {
        let emptyKm: number = 0;
        for (const activity of activities.slice(0, -1)) {
            if (!activity.is_distance_to_next_activity_empty_km) {
                continue;
            }
            if (activity.estimated_distance_to_next_activity === null) {
                return null;
            }
            emptyKm += activity.estimated_distance_to_next_activity;
        }
        return emptyKm;
    }

    function getDrivingTime(): number | null {
        const MAXIMUM_DRIVING_TIME_WITHOUT_BREAK_IN_SECONDS = (4 * 60 + 30) * 60;
        const BREAK_TIME_IN_MINUTES = 45;

        let drivingTime = 0; // s

        const lastActivityWithRealStartIndex = activities
            .map((activity) => activity.real_datetime_range !== null)
            .lastIndexOf(true);

        // If day has already started, use real times to calculate driving time on the already done part
        if (lastActivityWithRealStartIndex > 0) {
            // First get real part total duration
            const lastActivityWithRealStartStart = daySimulationService.getActivityStart(
                activities[lastActivityWithRealStartIndex],
                timezone
            );
            if (lastActivityWithRealStartStart === null) {
                return null;
            }

            const firstActivityStart = daySimulationService.getActivityStart(
                activities[0],
                timezone
            );
            if (firstActivityStart === null) {
                return null;
            }

            const totalRealDuration = differenceInSeconds(
                lastActivityWithRealStartStart,
                firstActivityStart
            );

            // Then get the driving and break real time (ie remove activities time)
            let drivingAndBreakRealDuration = totalRealDuration;
            for (const activity of activities.slice(0, lastActivityWithRealStartIndex)) {
                const activityDuration = daySimulationService.getActivityDuration(
                    activity,
                    timezone
                );
                if (activityDuration === null) {
                    return null;
                }
                drivingAndBreakRealDuration -= activityDuration * 60;
            }

            if (drivingAndBreakRealDuration < 0) {
                return null;
            }

            // Calculate driving time
            const fullBreaksCount = Math.floor(
                drivingAndBreakRealDuration /
                    (MAXIMUM_DRIVING_TIME_WITHOUT_BREAK_IN_SECONDS + BREAK_TIME_IN_MINUTES * 60)
            );
            const afterLastFullBreakRealDuration =
                drivingAndBreakRealDuration %
                (MAXIMUM_DRIVING_TIME_WITHOUT_BREAK_IN_SECONDS + BREAK_TIME_IN_MINUTES * 60);
            const afterLastFullBreakDrivingTime = Math.min(
                afterLastFullBreakRealDuration,
                MAXIMUM_DRIVING_TIME_WITHOUT_BREAK_IN_SECONDS
            );

            drivingTime =
                fullBreaksCount * MAXIMUM_DRIVING_TIME_WITHOUT_BREAK_IN_SECONDS +
                afterLastFullBreakDrivingTime;
        }

        // Get driving time for the simulated part
        for (const activity of activities.slice(Math.max(lastActivityWithRealStartIndex, 0), -1)) {
            if (activity.estimated_driving_time_to_next_activity === null) {
                return null;
            }
            drivingTime += activity.estimated_driving_time_to_next_activity;
        }
        return drivingTime;
    }

    function getDayDuration(): number | null {
        if (activities.length === 0) {
            return 0;
        }

        const firstActivityStart = daySimulationService.getActivityStart(activities[0], timezone);
        if (firstActivityStart === null) {
            return null;
        }

        const lastActivityEnd = daySimulationService.getActivityEnd(
            activities[activities.length - 1],
            timezone
        );
        if (lastActivityEnd === null) {
            return null;
        }

        return differenceInMinutes(lastActivityEnd, firstActivityStart);
    }
};
