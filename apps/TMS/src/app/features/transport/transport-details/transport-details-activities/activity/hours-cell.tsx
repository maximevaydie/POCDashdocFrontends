import {getConnectedCompanyId, getConnectedManager} from "@dashdoc/web-common";
import {Manager} from "dashdoc-utils";
import * as React from "react";
import {useSelector} from "react-redux";

import {DateLimits} from "app/features/transport/transport-details/transport-details-activities/SiteDateAndTime.service";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {amendActivityService} from "app/services/transport/amendActivity.service";

import SiteDateAndTime from "../SiteDateAndTime";

import ActivityCell from "./activity-cell";

import type {Activity, Transport} from "app/types/transport";

type Props = {
    activity: Activity;
    updatesAllowed: boolean;
    transport: Transport;
    isCarrier: boolean;
    beforeLaterStartDate?: string;
    afterEarlierEndDate?: string;
    dateLimits: DateLimits;
    onAskedDateModalShown: (index: number) => any;
    onScheduledDateModalShown?: (index: number) => any;
    onRealDateModalShown?: (index: number) => any;
};

function HoursCell({
    activity,
    transport,
    updatesAllowed,
    dateLimits,
    onAskedDateModalShown,
    onScheduledDateModalShown,
    onRealDateModalShown,
}: Props) {
    let scheduled = null;
    const {extendedView} = useExtendedView();
    const {isCarrier} = useTransportViewer(transport);

    const connectedManager = useSelector(getConnectedManager);
    const connectedCompanyId = useSelector(getConnectedCompanyId);
    if (isCarrier || extendedView) {
        if (activity.siteType == "origin" && activity.segment) {
            scheduled = activity.segment.scheduled_start_range;
        } else if (activity.siteType == "destination" && activity.segment) {
            scheduled = activity.segment.scheduled_end_range;
        }
    }

    const allowAmendRealDate = amendActivityService.canAmendRealDate(
        activity,
        transport,
        connectedManager?.role as Manager["role"],
        connectedCompanyId as number
    );

    const updatesScheduledAllowed =
        !!(activity.segment?.trucker || activity.segment?.vehicle || scheduled) &&
        updatesAllowed &&
        activity.site?.trip?.is_prepared !== true;

    return (
        <ActivityCell data-testid={`activity-${activity.index}-hours`}>
            <SiteDateAndTime
                site={activity.site}
                updatesAskedAllowed={updatesAllowed}
                updatesRealAllowed={allowAmendRealDate}
                onAskedHoursClick={() => onAskedDateModalShown(activity.index)}
                onSchedulerHoursClick={() => onScheduledDateModalShown?.(activity.index)}
                onRealHoursClick={() => onRealDateModalShown?.(activity.index)}
                scheduledStartRange={scheduled ?? undefined}
                updatesScheduledAllowed={updatesScheduledAllowed}
                statuses={activity.statusUpdates}
                dateLimits={dateLimits}
            />
        </ActivityCell>
    );
}

HoursCell.displayName = "HoursCell";

export default HoursCell;
