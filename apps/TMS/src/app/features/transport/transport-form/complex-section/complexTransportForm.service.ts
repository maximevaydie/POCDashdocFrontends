import {
    TransportFormDelivery,
    TransportFormActivity,
    tagColors,
} from "app/features/transport/transport-form/transport-form.types";

function getOrderedActivities(
    activities: TransportFormActivity[],
    orderedActivitiesUids: string[],
    groupSimilarActivities = false
) {
    const orderedActivities = [...activities];

    let orderedUids = orderedActivitiesUids.filter((uid) =>
        orderedActivities.some((a) => a.uid === uid)
    );
    // Init ordered activities list with first delivery activities if none set before
    if (orderedUids.length === 0) {
        orderedUids = [orderedActivities[0].uid, orderedActivities[1].uid];
    }

    if (groupSimilarActivities) {
        // Regroup similar activities : Add missing uids in ordered activities list trying to have similar activities next to each other
        orderedActivities.map((activity, index) => {
            // Check if uid not already in ordered activities list
            if (activity.uid && orderedUids.indexOf(activity.uid) === -1) {
                // Identify the similar activity group indexes
                const indexesOfSimilarActivities = orderedActivities.map((a) =>
                    a.uid && a.uid !== activity.uid && isSimilarActivity(a, activity)
                        ? orderedUids.indexOf(a.uid)
                        : -1
                );
                const firstSimilarActivityIndex = Math.min(
                    ...indexesOfSimilarActivities.filter((v) => v !== -1)
                );
                const lastSimilarActivityIndex = Math.max(...indexesOfSimilarActivities);

                if (lastSimilarActivityIndex > -1) {
                    // If similar activity group - exists, add activity just after
                    orderedUids.splice(lastSimilarActivityIndex + 1, 0, activity.uid);
                    // Ensure that loading is before unloading
                    if (activity.type === "unloading") {
                        // if not move loading activity just before the similar activity group
                        const loadingUid = orderedActivities[index - 1].uid as string;
                        const loadingIndex = orderedUids.indexOf(loadingUid);

                        if (lastSimilarActivityIndex + 1 <= loadingIndex) {
                            orderedUids.splice(loadingIndex, 1);
                            orderedUids.splice(firstSimilarActivityIndex, 0, loadingUid);
                        }
                    }
                } else {
                    // if no similar activity found just add activities at the end
                    orderedUids.push(activity.uid);
                }
            }
        });
    }

    // Sort according activities ordering
    return orderedActivities.sort((a: TransportFormActivity, b: TransportFormActivity) => {
        if (!a.uid || !b.uid) {
            return 1;
        }
        let aIndex = orderedUids.indexOf(a.uid);
        let bIndex = orderedUids.indexOf(b.uid);
        return aIndex >= bIndex || aIndex === -1 || bIndex === -1 ? 1 : -1;
    });
}

function isSimilarActivity(a: TransportFormActivity, b: TransportFormActivity) {
    // activities are similar if they have same type and same address
    return Boolean(
        a.uid &&
            b.uid &&
            a.address &&
            b.address &&
            a.type === b.type &&
            a.address.name === b.address.name &&
            a.address.address === b.address.address &&
            a.address.postcode === b.address.postcode &&
            a.address.city === b.address.city &&
            a.address.country === b.address.country
    );
}
function getColorByDeliveryIndex(deliveryIndex: number) {
    return tagColors[deliveryIndex % tagColors.length];
}

function getActivityDeliveryColor(
    activity: TransportFormActivity,
    deliveries: TransportFormDelivery[]
) {
    const deliveryIndex = deliveries.findIndex(
        (d) => d.loadingUid === activity.uid || d.unloadingUid === activity.uid
    );

    return getColorByDeliveryIndex(deliveryIndex);
}

export const complexTransportForm = {
    isSimilarActivity,
    getOrderedActivities,
    getActivityDeliveryColor,
    getColorByDeliveryIndex,
};
