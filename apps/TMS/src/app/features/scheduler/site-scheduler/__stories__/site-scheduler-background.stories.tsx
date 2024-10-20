import React from "react";

import SiteScheduler from "../site-scheduler";

export default {
    title: "app/features/scheduler/Site Scheduler/Background",
};

export const Default = () => (
    <SiteScheduler
        currentDate={new Date()}
        siteActivities={[]}
        slotsPerRow={2}
        currentSiteId={1234}
        onCardSelected={() => {
            alert("Click!");
        }}
        updateQuery={() => {}}
        hasNoInvitedSites={false}
        filters={{}}
    />
);
