import {Flex, NoWrap} from "@dashdoc/web-ui";
import {SchedulerCardSettingsData, SiteSlot} from "dashdoc-utils";
import React from "react";

import {SchedulerActivitiesForCard} from "../cardActivity.types";
import {CardAddressName, CardAddressText} from "../CardAddressText";

import {ActivityIcon} from "./ActivityIcon";
import {SiteDate} from "./SiteDate";

/**
 * Display origin and destination information of a segment.
 */
export function SiteDateAndAddress({
    activity,
    cardDateRange,
    schedulerStartDate,
    schedulerEndDate,
    color,
    displayActivityType,
    inconsistentOrder,
    labelMode,
}: {
    activity: SchedulerActivitiesForCard;
    cardDateRange: SiteSlot;
    schedulerStartDate?: Date;
    schedulerEndDate?: Date;
    color: string;
    displayActivityType: boolean;
    inconsistentOrder?: boolean;
    labelMode: SchedulerCardSettingsData["activity_label_mode"];
}) {
    const showName = labelMode.includes("name");
    const showCity = labelMode.includes("city");
    return (
        <Flex alignItems="center" lineHeight="18px">
            {displayActivityType && <ActivityIcon activity={activity} color={color} />}
            <Flex flexShrink={0}>
                <SiteDate
                    activity={activity}
                    cardDateRange={cardDateRange}
                    schedulerStartDate={schedulerStartDate}
                    schedulerEndDate={schedulerEndDate}
                    inconsistentOrder={inconsistentOrder}
                />
            </Flex>
            <NoWrap>
                &nbsp;
                {showName && (
                    <CardAddressName
                        name={activity.address?.name}
                        maxLength={showCity ? 20 : undefined}
                    />
                )}
                &nbsp;
                {showCity && (
                    <CardAddressText address={activity.address} maxLength={showName ? 15 : 25} />
                )}
            </NoWrap>
        </Flex>
    );
}
