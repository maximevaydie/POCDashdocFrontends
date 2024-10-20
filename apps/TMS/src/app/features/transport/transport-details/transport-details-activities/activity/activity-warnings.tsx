import {t} from "@dashdoc/web-core";
import {Icon, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {activityService} from "app/services/transport/activity.service";

import type {Activity} from "app/types/transport";

export type ActivityWarningsProps = {
    activity: Activity;
};

const ActivityWarnings: FunctionComponent<ActivityWarningsProps> = ({activity}) => {
    const activityCompleteStatus = activityService.getActivityCompleteStatus(activity);
    const signatoryObservations =
        activityCompleteStatus?.update_details?.signatory_observations?.content ||
        activityCompleteStatus?.content_signatory;

    // In old app version, trucker observations are stored in event content field.
    // So we have to display this field.
    let truckerObservations = activityCompleteStatus?.content;
    // But for retro compatibility for our api users (see BUG-2134),
    // we copy the load trucker observations in this content field.
    // In this second case, trucker observations are duplicated,
    // so we should not display them here.
    // To check this, we will check if there is any load trucker observation
    // N.B: with this behavior,
    // we will not be able to display both content and load trucker observations
    // in the case where content does not match load trucker observations.
    // But for now, it seems that the feature to use both content and load trucker observations
    // has not been implemented.
    if (truckerObservations) {
        if (
            activity.deliveries.some((delivery) =>
                (activity.type === "loading"
                    ? delivery.origin_loads
                    : delivery.destination_loads
                )?.some((load) => load.trucker_observations)
            )
        ) {
            truckerObservations = undefined;
        }
    }

    if (
        !activityCompleteStatus ||
        !(truckerObservations || signatoryObservations || activity.electronicSignatureRequired)
    ) {
        return null;
    }

    return (
        <Text color="red.default">
            <Icon name="warning" mr={2} />
            {activity.electronicSignatureRequired && `${t("components.awaitingSignature")} `}
            {truckerObservations &&
                `${t("activityStatus.truckerObservations")} ${truckerObservations} `}

            {signatoryObservations &&
                `${
                    activityCompleteStatus.category === "loading_complete"
                        ? t("activityStatus.senderObservations")
                        : t("activityStatus.consigneeObservations")
                } ${signatoryObservations}`}
        </Text>
    );
};

export default ActivityWarnings;
