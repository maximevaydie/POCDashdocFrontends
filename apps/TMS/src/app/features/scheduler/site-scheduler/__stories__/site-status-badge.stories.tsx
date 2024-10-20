import React from "react";

import SiteStatusBadge from "../site-status-badge";

export default {
    title: "app/features/scheduler/Site Scheduler/Site status badge",
};

export const Cancelled = () => <SiteStatusBadge status="cancelled" />;
export const ActivityDone = () => <SiteStatusBadge status="activity_done" />;
export const Late = () => <SiteStatusBadge status="late" />;
export const OnSite = () => <SiteStatusBadge status="on_site" />;
export const Created = () => <SiteStatusBadge status="created" />;
export const Updated = () => <SiteStatusBadge status="updated" />;
export const Unassigned = () => <SiteStatusBadge status="unassigned" />;
export const Confirmed = () => <SiteStatusBadge status="confirmed" />;
export const Assigned = () => <SiteStatusBadge status="assigned" />;
export const SentToTrucker = () => <SiteStatusBadge status="sent_to_trucker" />;
export const PlannedAndSent = () => <SiteStatusBadge status="planned_and_sent" />;
export const Acknowledged = () => <SiteStatusBadge status="acknowledged" />;
export const LoadingComplete = () => <SiteStatusBadge status="loading_complete" />;
export const UnloadingComplete = () => <SiteStatusBadge status="unloading_complete" />;
