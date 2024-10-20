import {t} from "@dashdoc/web-core";
import {BROWSER_TIMEZONE} from "@dashdoc/web-core";
import {Flex, Circled, Text} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import {getSiteZonedAskedDateTimes} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {MultipleRoundsLoads} from "app/features/transport/transport-details/transport-details-activities/activity/activity-loads/multiple-rounds-loads";
import {
    getLoadCategoryAndDescription,
    getLoadInformations,
} from "app/features/transport/transport-details/transport-details-activities/activity/activity-loads/utils";
import {getLoadQuantities} from "app/services/transport/load.service";

import {LoadRecap} from "./LoadRecap";

import type {Activity} from "app/types/transport";
type ActivityRecapProps = {
    activity: Activity;
};

export const ActivityRecap: FunctionComponent<ActivityRecapProps> = ({activity}) => {
    const {site, isMultipleRounds, type, deliveries, siteType} = activity;
    const {address} = site;

    let addressText = t("common.unspecified");
    if (address) {
        addressText = `${address.name}, ${address.postcode} ${address.city}, ${address.country}`;
    }

    let content = <Text fontWeight="bold">{t("common.unspecified")}</Text>;
    if (isMultipleRounds) {
        if (
            (siteType !== "bulkingBreak" && !!deliveries[0].planned_loads?.length) ||
            !!deliveries[0].destination_loads?.length
        ) {
            content = (
                <MultipleRoundsLoads
                    activity={activity}
                    realLoadsUpdatesAllowed={false}
                    onLoadClick={() => {}}
                    onEmptyLoadClick={() => {}}
                    clickable={false}
                    canSeeWeightExtraction={false}
                />
            );
        }
    } else {
        if (type === "loading" || type === "unloading") {
            const loads = activity.deliveries.flatMap((d) => d.planned_loads);
            content = (
                <>
                    {loads.map((load) => (
                        <LoadRecap
                            key={load.uid}
                            title={getLoadCategoryAndDescription(load)}
                            info={getLoadInformations(load)}
                            load={getLoadQuantities(load)}
                        />
                    ))}
                </>
            );
        }
    }

    const {zonedStart: zonedAskedStart, zonedEnd: zonedAskedEnd} = getSiteZonedAskedDateTimes(
        activity.site,
        BROWSER_TIMEZONE
    );

    return (
        <>
            <Flex alignItems="baseline">
                <Circled borderColor="blue.dark">
                    <Text variant="h1" color="blue.dark">
                        {activity.index + 1}
                    </Text>
                </Circled>
                <Text fontWeight={600} ml={2}>
                    {addressText}
                </Text>
            </Flex>
            {(zonedAskedStart || zonedAskedEnd) && (
                <Text mt={2}>
                    {t("common.askedDates")}
                    {t("common.colon")}
                    <DateAndTime
                        wrap={false}
                        zonedDateTimeMin={zonedAskedStart}
                        zonedDateTimeMax={zonedAskedEnd}
                    />
                </Text>
            )}
            <Flex pt={3} flexDirection="column">
                {content}
            </Flex>
        </>
    );
};
