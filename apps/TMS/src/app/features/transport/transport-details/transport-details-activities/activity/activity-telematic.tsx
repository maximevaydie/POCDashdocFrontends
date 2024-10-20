import {t} from "@dashdoc/web-core";
import {ClickableUpdateRegion, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import EtaTracking from "app/features/transport/eta/eta-tracking/eta-tracking";
import {useSelector} from "app/redux/hooks";
import {activityService} from "app/services/transport/activity.service";

import ActivityCell from "./activity-cell";

import type {Activity, Segment} from "app/types/transport";

const getDistanceDisplay = (segment: Segment) => {
    if (segment.user_distance !== null) {
        return t("distance.userDistanceKm", {
            distance: formatNumber(segment.user_distance, {maximumFractionDigits: 0}),
        });
    } else if (segment.telematic_distance !== null) {
        return t("distance.telematicDistanceKm", {
            distance: formatNumber(segment.telematic_distance, {maximumFractionDigits: 0}),
        });
    } else if (segment.estimated_distance !== null) {
        return t("distance.estimatedDistanceKm", {
            distance: formatNumber(segment.estimated_distance, {maximumFractionDigits: 0}),
        });
    }
    return "";
};
export type ActivityDistanceCellProps = {
    activity: Activity;
    showActivateETAButton: boolean;
    updatesAllowed: boolean;
    displayDistance: boolean;
    onDistanceClick: () => void;
};

const ActivityDistanceCell: FunctionComponent<ActivityDistanceCellProps> = ({
    activity,
    displayDistance,
    showActivateETAButton,
    updatesAllowed,
    onDistanceClick,
}) => {
    const segmentId = activity?.previousSegment?.uid;
    const segmentData = useSelector((state) =>
        segmentId ? state.entities.segments[segmentId] : null
    );

    return (
        <ActivityCell>
            <Text variant="captionBold" mb={1}>
                {t("activity.distanceSubtitle")}
            </Text>
            {displayDistance && segmentData && (
                <ClickableUpdateRegion clickable={updatesAllowed} onClick={onDistanceClick}>
                    <Text data-testid="distance-label">{getDistanceDisplay(segmentData)}</Text>
                </ClickableUpdateRegion>
            )}
            {!activityService.isActivityStarted(activity) && (
                <EtaTracking site={activity.site} showActivateETAButton={showActivateETAButton} />
            )}
        </ActivityCell>
    );
};

export default ActivityDistanceCell;
