import {getCompanyAndAddressName, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Flex,
    Text,
    ReorderableListWithMergedItems,
    SwitchInput,
} from "@dashdoc/web-ui";
import {DateAndTime} from "@dashdoc/web-ui";
import {Address, ExtractedNewAddress, parseAndZoneDate} from "dashdoc-utils";
import {useFormikContext} from "formik";
import {max, min} from "lodash";
import React, {useContext} from "react";

import {complexTransportForm} from "app/features/transport/transport-form/complex-section/complexTransportForm.service";
import {TransportFormContext} from "app/features/transport/transport-form/transport-form-context";

import {InconsistentDatesIcon} from "../../dates/InconsistentDatesIcon";
import {TransportFormActivity, TransportFormValues} from "../transport-form.types";

import {ActivityIndex} from "./ActivityIndex";

export function ActivitiesOrdering() {
    const {groupSimilarActivities, setGroupSimilarActivities} = useContext(TransportFormContext);
    const {values, setFieldValue} = useFormikContext<TransportFormValues>();
    const timezone = useTimezone();
    const activities = complexTransportForm.getOrderedActivities(
        Object.values(values.activities),
        values.orderedActivitiesUids ?? [],
        groupSimilarActivities
    );

    return (
        <Box data-testid="transport-form-activities-ordering">
            <Flex justifyContent="space-between" alignItems="center" paddingX={3} paddingTop={3}>
                <Text variant="h1">{t("transportForm.activityOrder")}</Text>
                <SwitchInput
                    labelLeft={t("transportForm.groupActivitiesSwitchLabel")}
                    value={!!groupSimilarActivities}
                    onChange={setGroupSimilarActivities!}
                />
            </Flex>

            <Box pr={6} pl={5}>
                <ReorderableListWithMergedItems<TransportFormActivity>
                    items={activities}
                    getItemId={(activity) => activity.uid ?? ""}
                    areItemsSimilar={(activityA, activityB) =>
                        complexTransportForm.isSimilarActivity(activityA, activityB)
                    }
                    onReorderItems={reorderActivities}
                    getOrderError={getOrderError}
                    getItemContent={getItemContent}
                    getMergedItemContent={getMergedItemContent}
                    showCollapsedIcon
                />
            </Box>
        </Box>
    );

    function reorderActivities(
        movedActivities: Array<TransportFormActivity>,
        oldIndex: number,
        newIndex: number
    ) {
        const reorderedActivities = [...activities];
        const removed = reorderedActivities.splice(oldIndex, movedActivities.length);
        reorderedActivities.splice(newIndex, 0, ...removed);
        setFieldValue(
            "orderedActivitiesUids",
            reorderedActivities.map((a) => a.uid)
        );
    }

    function getOrderError(
        movedActivity: TransportFormActivity,
        beforeActivities: TransportFormActivity[],
        afterActivities: TransportFormActivity[]
    ) {
        if (
            movedActivity.type === "loading" &&
            beforeActivities.findIndex(
                (activity) =>
                    values.deliveries.findIndex(
                        (delivery) =>
                            delivery.loadingUid === movedActivity.uid &&
                            delivery.unloadingUid === activity.uid
                    ) > -1
            ) > -1
        ) {
            return t("transportDetails.loadingCannotBeMovedAfterUnloading");
        }
        if (
            movedActivity.type === "unloading" &&
            afterActivities.findIndex(
                (activity) =>
                    values.deliveries.findIndex(
                        (delivery) =>
                            delivery.unloadingUid === movedActivity.uid &&
                            delivery.loadingUid === activity.uid
                    ) > -1
            ) > -1
        ) {
            return t("transportDetails.unloadingCannotBeMovedBeforeLoading");
        }
        return null;
    }

    function getItemContent(
        activity: TransportFormActivity,
        index: number | "similar",
        isInsideGroup: boolean,
        isLastItemOfGroup: boolean
    ) {
        const addressName = activity.address
            ? getCompanyAndAddressName(activity.address)
            : undefined;
        const cityName = getAddressCity(activity.address);

        const color = complexTransportForm.getActivityDeliveryColor(activity, values.deliveries);
        const activityIndex = activities.findIndex((a) => a.uid === activity.uid);
        const isInconsistent =
            activity.slots?.[0]?.end &&
            activities
                .slice(0, activityIndex)
                .some((a) => a.slots?.[0]?.start > activity.slots?.[0]?.end);

        return (
            <Flex alignItems="center" justifyContent="space-between" width="100%">
                <Flex flex={1}>
                    <ActivityIndex
                        index={index}
                        linkedToNext={!isLastItemOfGroup}
                        linkedToPrevious={isInsideGroup}
                    />
                    <Flex ml={2} flexDirection="column" justifyContent="center" flex={1}>
                        <Text
                            fontStyle={addressName ? undefined : "italic"}
                            color={addressName ? undefined : "grey.dark"}
                            ellipsis
                        >
                            {addressName ?? t("generic.notSpecified")}
                        </Text>
                        {cityName && (
                            <Text ellipsis variant="subcaption">
                                {cityName}
                            </Text>
                        )}
                        {activity.slots?.[0] && (
                            <Flex alignItems="center">
                                <Text variant="subcaption" ellipsis mr={1}>
                                    <DateAndTime
                                        zonedDateTimeMin={parseAndZoneDate(
                                            activity.slots?.[0]?.start,
                                            timezone
                                        )}
                                        zonedDateTimeMax={parseAndZoneDate(
                                            activity.slots?.[0]?.end,
                                            timezone
                                        )}
                                        wrap={false}
                                    />
                                </Text>
                                {isInconsistent && <InconsistentDatesIcon />}
                            </Flex>
                        )}
                    </Flex>
                </Flex>
                <Badge
                    size="small"
                    variant="none"
                    backgroundColor={`${color}.ultralight`}
                    color={`${color}.dark`}
                    height="fit-content"
                    shape="squared"
                    noWrap
                >
                    {t(getActivityTypeLabelKey(activity.type))}
                </Badge>
            </Flex>
        );
    }
    function getMergedItemContent(
        activities: TransportFormActivity[],
        index: number,
        isCollapsed: boolean
    ) {
        const addressName = activities[0].address
            ? getCompanyAndAddressName(activities[0].address as Address)
            : undefined;
        const cityName = getAddressCity(activities[0].address);

        return (
            <Flex alignItems="center" justifyContent="space-between" width="100%">
                <Flex flex={1}>
                    <ActivityIndex
                        index={index}
                        linkedToNext={!isCollapsed}
                        linkedToPrevious={false}
                    />
                    <Flex ml={2} flexDirection="column" justifyContent="center" flex={1}>
                        <Text ellipsis>{addressName}</Text>
                        {cityName && (
                            <Text ellipsis variant="subcaption">
                                {cityName}
                            </Text>
                        )}
                        {activities.findIndex((activity) => !!activity.slots?.[0]) > -1 && (
                            <Text ellipsis variant="subcaption">
                                <DateAndTime
                                    zonedDateTimeMin={parseAndZoneDate(
                                        min(
                                            activities.map(
                                                (activity) => activity.slots?.[0]?.start
                                            )
                                        ) ?? null,
                                        timezone
                                    )}
                                    zonedDateTimeMax={parseAndZoneDate(
                                        max(
                                            activities.map((activity) => activity.slots?.[0]?.end)
                                        ) ?? null,
                                        timezone
                                    )}
                                    wrap={false}
                                />
                            </Text>
                        )}
                    </Flex>
                </Flex>
                <Badge
                    size="small"
                    variant="neutral"
                    height="fit-content"
                    shape="squared"
                    flexWrap="nowrap"
                >
                    <Flex alignItems="center">
                        {t(getActivitiesTypeLabelKey(activities[0].type), {
                            smart_count: activities.length,
                        })}
                        {activities.map((a, idx) => {
                            const color = complexTransportForm.getActivityDeliveryColor(
                                a,
                                values.deliveries
                            );
                            return (
                                <Box
                                    ml={1}
                                    key={idx}
                                    width="10px"
                                    height="10px"
                                    backgroundColor={`${color}.light`}
                                    borderColor={`${color}.default`}
                                    borderRadius="50%"
                                    border="1px solid"
                                />
                            );
                        })}
                    </Flex>
                </Badge>
            </Flex>
        );
    }
}

function getActivityTypeLabelKey(type: TransportFormActivity["type"]) {
    switch (type) {
        case "loading":
            return "common.pickup";
        case "unloading":
            return "common.delivery";
        default:
            return "common.activity";
    }
}
function getActivitiesTypeLabelKey(type: TransportFormActivity["type"]) {
    switch (type) {
        case "loading":
            return "common.XPickup";
        case "unloading":
            return "common.XDelivery";
        default:
            return "common.activities";
    }
}
function getAddressCity(address: Address | ExtractedNewAddress | undefined) {
    if (!address) {
        return null;
    }
    const city = address.city;
    const postcode = address.postcode?.slice(0, 2);
    const country = address.country;

    return city + " (" + postcode + ") - " + country;
}
