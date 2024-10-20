import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {Pricing} from "dashdoc-utils";
import React from "react";

import {useCompaniesInGroupViews} from "app/hooks/useCompaniesInGroupViews";
import {useSelector} from "app/redux/hooks";
import {transportRightService} from "app/services/transport";
import {activityService} from "app/services/transport/activity.service";
import {getTransportSegmentsBySiteUid} from "app/services/transport/transport.service";

import {ActivityListByMeans} from "./ActivityListByMeans";

import type {
    Activity,
    Segment,
    Site,
    Transport,
    TransportActivitiesByMeans,
} from "app/types/transport";

type ActivityListProps = {
    activitiesByMeans: TransportActivitiesByMeans;
    transport: Transport;
    pricing: Pricing | null;
    onClickOnActivityDistance: () => void;
};
export function ActivityList({
    activitiesByMeans,
    transport,
    pricing,
    onClickOnActivityDistance,
}: ActivityListProps) {
    const activitiesByMeansEntries = Array.from(activitiesByMeans.entries());
    const transportHasOnlyOneMean = activitiesByMeansEntries.length === 1;

    const connectedCompany = useSelector(getConnectedCompany);
    const companiesInGroupViews = useCompaniesInGroupViews();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const updatesAllowed = transportRightService.canEditTransport(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled,
        companiesInGroupViews
    );
    const meansUpdatesAllowed = transportRightService.canEditMeans(
        transport,
        connectedCompany?.pk,
        companiesInGroupViews,
        hasInvoiceEntityEnabled
    );
    const breaksAllowed = transportRightService.canEditBreaks(
        transport,
        connectedCompany?.pk,
        companiesInGroupViews,
        hasInvoiceEntityEnabled
    );
    const transportStructureUpdatesAllowed = transportRightService.canEditTransportStructure(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const firstActivity = activitiesByMeansEntries[0][1][0]; // first entry, activities value , first activity
    const lastActivitiesByMeansEntry =
        activitiesByMeansEntries[activitiesByMeansEntries.length - 1];
    const lastActivity = lastActivitiesByMeansEntry[1][lastActivitiesByMeansEntry[1].length - 1]; // last entry, activities value, last activity

    const isFirstActivityDone = activityService.isActivityComplete(firstActivity);
    const isLastActivityStarted = activityService.isActivityStarted(lastActivity);

    const addingLoadingActivityAllowed =
        transportStructureUpdatesAllowed &&
        (transport.shape === "simple" || transport.shape === "grouping") &&
        !isLastActivityStarted;
    const addingUnloadingActivityAllowed =
        transportStructureUpdatesAllowed &&
        (transport.shape === "simple" || transport.shape === "ungrouping") &&
        !isFirstActivityDone;

    const deletingLoadingActivityAllowed =
        transportStructureUpdatesAllowed && transport.shape === "grouping";
    const deletingUnloadingActivityAllowed =
        transportStructureUpdatesAllowed && transport.shape === "ungrouping";

    const reversedTransportStatusUpdates = transport.status_updates.slice().reverse();

    const allowedActions = {
        breaksAllowed,
        addingLoadingActivityAllowed,
        addingUnloadingActivityAllowed,
        deletingLoadingActivityAllowed,
        deletingUnloadingActivityAllowed,
        updatesAllowed,
        meansUpdatesAllowed,
    };

    const _getActivitiesByMeansMetaData = ([means, activities]: [
        {breakSite?: Site},
        Activity[],
    ]) => {
        const segmentsBySiteUid = getTransportSegmentsBySiteUid(transport);

        const {breakSite} = means;

        let breakIsDone = false,
            resumeIsDone = false,
            segmentToBreakSite: Segment | undefined = undefined,
            segmentFromBreakSite: Segment | undefined = undefined;

        if (breakSite) {
            // For now, we have no way to know if departed statuses are from breaking or resuming site,
            // and so if it corresponds to bulking_break_started or bulking_break_complete.
            // For best effort, we will assume it is a bulking_break_complete only if we have two departed statuses and it is the second one.
            let breakSiteDepartedStatuses = transport.status_updates.filter(
                ({category, site}) => category === "departed" && site === breakSite.uid
            );
            breakIsDone = !!transport.status_updates.find(
                ({category, site}) =>
                    ["bulking_break_started", "departed"].includes(category) &&
                    site === breakSite.uid
            );
            resumeIsDone = !!transport.status_updates.find(
                (status) =>
                    (status.category === "bulking_break_complete" &&
                        status.site === breakSite.uid) ||
                    (status.category === "departed" &&
                        status.site === breakSite.uid &&
                        breakSiteDepartedStatuses.indexOf(status) === 1)
            );
            segmentToBreakSite = (segmentsBySiteUid[breakSite.uid]?.destination ?? undefined) as
                | Segment
                | undefined; // destination here is a segment for which the site of destination is the break site
            segmentFromBreakSite = (segmentsBySiteUid[breakSite.uid]?.origin ?? undefined) as
                | Segment
                | undefined; // origin here is a segment for which the site of origin is the break site
        }

        const firstActivityOfBlock = activities[0];

        // if the block is empty then it's a break followed by an other break
        const firstBreakableSegmentOfBlock = firstActivityOfBlock
            ? firstActivityOfBlock.previousSegment
            : segmentFromBreakSite;

        const firstSiteOfBlock = firstActivityOfBlock
            ? firstActivityOfBlock.previousSegment?.destination ||
              firstActivityOfBlock.segment?.origin
            : segmentFromBreakSite?.destination;

        const isFirstActivityOfBlockStarted =
            firstActivityOfBlock && activityService.isActivityStarted(firstActivityOfBlock);

        return {
            breakSite,
            breakIsDone,
            resumeIsDone,
            segmentToBreakSite,
            segmentFromBreakSite,
            firstActivityOfBlock,
            firstBreakableSegmentOfBlock,
            firstSiteOfBlock,
            isFirstActivityOfBlockStarted,
        };
    };

    return (
        <>
            {activitiesByMeansEntries.map((entry, meansIndex) => (
                <ActivityListByMeans
                    key={meansIndex}
                    meansIndex={meansIndex}
                    means={entry[0]}
                    activities={entry[1]}
                    isTheOnlyTransportMean={transportHasOnlyOneMean}
                    nextActivity={
                        meansIndex < activitiesByMeansEntries.length - 1
                            ? activitiesByMeansEntries[meansIndex + 1][1][0]
                            : null
                    }
                    isLastMeansGroup={meansIndex === activitiesByMeansEntries.length - 1}
                    // @ts-ignore
                    metaData={_getActivitiesByMeansMetaData(entry)}
                    nextResumeIsDone={
                        activitiesByMeansEntries[meansIndex + 1]
                            ? _getActivitiesByMeansMetaData(
                                  // @ts-ignore
                                  activitiesByMeansEntries[meansIndex + 1]
                              )?.resumeIsDone
                            : undefined
                    }
                    // @ts-ignore
                    allowedActions={allowedActions}
                    transport={transport}
                    isFirstActivityDone={isFirstActivityDone}
                    reversedTransportStatusUpdates={reversedTransportStatusUpdates}
                    onClickOnActivityDistance={onClickOnActivityDistance}
                    pricing={pricing}
                />
            ))}
        </>
    );
}
