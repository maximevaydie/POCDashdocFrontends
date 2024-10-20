import {fetchSearch} from "@dashdoc/web-common";

import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";
import {SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME} from "app/types/constants";

import {siteSchedulerSharedActivitySchema} from "../schemas";

export function fetchSiteSchedulerActivities(query: SiteSchedulerQuery) {
    return fetchSearch(
        "site-scheduler/activities",
        "site-scheduler",
        siteSchedulerSharedActivitySchema,
        SITE_SCHEDULER_SHARED_ACTIVITIES_QUERY_NAME,
        query,
        // @ts-ignore
        null,
        "v4"
    );
}
