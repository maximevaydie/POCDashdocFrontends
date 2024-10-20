import {Box} from "@dashdoc/web-ui";
import {SchedulerCardSettingsData} from "dashdoc-utils";
import React from "react";

import {CardLineHeight} from "../../../cardLineHeights.constants";
import {SchedulerCardProps} from "../../../schedulerCardContent.types";

import {CollapsedActivities} from "./CollapsedActivities";
import {SiteDateAndAddress} from "./SiteDateAndAddress";

type Props = {schedulerCardSettings: SchedulerCardSettingsData} & Pick<
    SchedulerCardProps,
    | "activities"
    | "decoration"
    | "cardDateRange"
    | "schedulerStartDate"
    | "schedulerEndDate"
    | "inconsistentOrder"
>;
export function ActivityList({
    schedulerCardSettings,
    activities,
    decoration,
    cardDateRange,
    schedulerStartDate,
    schedulerEndDate,
    inconsistentOrder,
}: Props) {
    return schedulerCardSettings.activity_list_mode === "collapsed" && activities.length > 2 ? (
        <Box height={`${CardLineHeight.activity * 3}px`}>
            <SiteDateAndAddress
                activity={activities[0]}
                cardDateRange={cardDateRange}
                schedulerStartDate={schedulerStartDate}
                schedulerEndDate={schedulerEndDate}
                color={decoration.color}
                displayActivityType={schedulerCardSettings.display_activity_type}
                inconsistentOrder={inconsistentOrder}
                labelMode={schedulerCardSettings.activity_label_mode}
            />
            <CollapsedActivities
                activities={activities.slice(1, -1)}
                color={decoration.color}
                displayActivityType={schedulerCardSettings.display_activity_type}
            />

            <SiteDateAndAddress
                activity={activities[activities.length - 1]}
                cardDateRange={cardDateRange}
                schedulerStartDate={schedulerStartDate}
                schedulerEndDate={schedulerEndDate}
                color={decoration.color}
                displayActivityType={schedulerCardSettings.display_activity_type}
                labelMode={schedulerCardSettings.activity_label_mode}
            />
        </Box>
    ) : (
        <Box height={`${CardLineHeight.activity * activities.length}px`}>
            {activities.map((activity, index) => (
                <SiteDateAndAddress
                    key={index}
                    activity={activity}
                    cardDateRange={cardDateRange}
                    schedulerStartDate={schedulerStartDate}
                    schedulerEndDate={schedulerEndDate}
                    color={decoration.color}
                    displayActivityType={schedulerCardSettings.display_activity_type}
                    inconsistentOrder={inconsistentOrder && index === 0}
                    labelMode={schedulerCardSettings.activity_label_mode}
                />
            ))}
        </Box>
    );
}
