import {HasFeatureFlag} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, Flex, Icon, MenuSeparator, Popover, Text} from "@dashdoc/web-ui";
import React from "react";

import {CompactTrip, SimilarActivity} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchBulkUpdateActivitites, fetchPartialTripUpdateAction} from "app/redux/actions/trips";
import {useDispatch} from "app/redux/hooks";

type Props = {
    trip: CompactTrip;
};

export function LockRequestedTimesActionButton({trip}: Props) {
    const tripUid = trip.uid;
    const activitiesUids = trip.activities.flatMap((a) =>
        a.similarUids.length > 0 ? a.similarUids : [a.uid]
    );
    const lockMode = getLockMode(trip.activities);
    const {extendedView} = useExtendedView();
    const dispatch = useDispatch();

    return (
        <HasFeatureFlag flagName="schedulerByTimeUseAskedDates">
            <Popover>
                <Popover.Trigger>
                    <Button variant="secondary" px={2} height="100%">
                        <Icon
                            name={lockMode === LockMode.UNLOCKED ? "unlock" : "lock"}
                            color="blue.default"
                        />
                    </Button>
                </Popover.Trigger>
                <Popover.Content>
                    <Text variant="caption" mb={2}>
                        {getLockLabel()}
                    </Text>
                    <MenuSeparator />
                    {lockMode !== LockMode.LOCKED && (
                        <Button variant="plain" onClick={lockRequestedTimes} width="100%">
                            <Flex alignItems="flex-start" width="100%">
                                <Icon name="lock" color="grey.default" mr={2} />
                                <Text>{t("trip.plan.lockRequestedTimes")}</Text>
                            </Flex>
                        </Button>
                    )}
                    {lockMode !== LockMode.UNLOCKED && (
                        <Button variant="plain" onClick={unlockRequestedTimes} width="100%">
                            <Flex alignItems="flex-start" width="100%">
                                <Icon name="unlock" mr={2} color="grey.default" />
                                <Text>{t("trip.plan.unlockRequestedTimes")}</Text>
                            </Flex>
                        </Button>
                    )}
                </Popover.Content>
            </Popover>
        </HasFeatureFlag>
    );

    function lockRequestedTimes() {
        setLockedRequestedTimes(true);
    }
    function unlockRequestedTimes() {
        setLockedRequestedTimes(false);
    }

    async function setLockedRequestedTimes(value: boolean) {
        try {
            await dispatch(
                fetchPartialTripUpdateAction(activitiesUids, {
                    locked_requested_times: value,
                })
            );
            await dispatch(
                fetchBulkUpdateActivitites(
                    tripUid,
                    activitiesUids,
                    {locked_requested_times: value},
                    extendedView
                )
            );
        } catch (error) {
            Logger.error("Error during submit", error);
        }
    }

    function getLockLabel() {
        switch (lockMode) {
            case LockMode.LOCKED:
                return t("trip.plan.lockedRequestedTimes");
            case LockMode.UNLOCKED:
                return t("trip.plan.unlockedRequestedTimes");
            case LockMode.PARTIALLY_LOCKED:
                return t("trip.plan.partiallyLockedRequestedTimes");
        }
    }
}

enum LockMode {
    LOCKED = "locked",
    UNLOCKED = "unlocked",
    PARTIALLY_LOCKED = "partiallyLocked",
}
function getLockMode(activities: SimilarActivity[]) {
    const numberOfLockedActivities = activities.filter(
        (activity) => activity.locked_requested_times
    ).length;
    if (numberOfLockedActivities === activities.length) {
        return LockMode.LOCKED;
    }
    if (numberOfLockedActivities === 0) {
        return LockMode.UNLOCKED;
    }
    return LockMode.PARTIALLY_LOCKED;
}
