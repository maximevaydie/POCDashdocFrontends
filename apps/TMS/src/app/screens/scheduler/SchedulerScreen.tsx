import {parseQueryString} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {RouteComponentProps, useLocation} from "react-router";

import {SidebarTabNames} from "app/types/constants";

import {CarrierSchedulerScreen} from "./CarrierSchedulerScreen";
import {SiteSchedulerScreen} from "./SiteSchedulerScreen";

type SchedulerTab = SidebarTabNames.SITE_SCHEDULER | SidebarTabNames.CARRIER_SCHEDULER;

type SchedulerScreensQuery = {
    tab?: SchedulerTab;
};

const parseQuery = (queryString: string): SchedulerScreensQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
    });

    return {
        tab: SidebarTabNames.CARRIER_SCHEDULER,
        ...parsedParams,
    };
};

type SchedulerScreensProps = RouteComponentProps;

export const SchedulerScreen: FunctionComponent<SchedulerScreensProps> = () => {
    const location = useLocation();
    const currentQuery = parseQuery(location.search);

    switch (currentQuery?.tab) {
        case SidebarTabNames.CARRIER_SCHEDULER:
            return <CarrierSchedulerScreen />;
        case SidebarTabNames.SITE_SCHEDULER:
            return <SiteSchedulerScreen />;
        default:
            return null;
    }
};
