import React from "react";

import SiteScheduler from "../site-scheduler";
import {SiteSchedulerSharedActivity} from "../types";

export default {
    title: "app/features/scheduler/Site Scheduler/With transports",
};

export const WithATransportAndNoCategories = () => (
    <SiteScheduler
        currentDate={new Date()}
        currentSiteId={1234}
        siteActivities={[]}
        slotsPerRow={2}
        onCardSelected={function (activity: SiteSchedulerSharedActivity) {
            alert(JSON.stringify(activity));
        }}
        updateQuery={() => {}}
        hasNoInvitedSites={false}
        filters={{}}
    />
);

export const WithMultipleTransportsAndNoCategories = () => (
    <SiteScheduler
        currentDate={new Date()}
        currentSiteId={1234}
        siteActivities={[]}
        slotsPerRow={2}
        onCardSelected={function (activity: SiteSchedulerSharedActivity) {
            alert(JSON.stringify(activity));
        }}
        updateQuery={() => {}}
        hasNoInvitedSites={false}
        filters={{}}
    />
);
