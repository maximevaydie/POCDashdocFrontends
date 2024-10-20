import {Trucker, Trailer, Vehicle, Company} from "dashdoc-utils";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {
    DedicatedResourceForCharteringScheduler,
    DedicatedResourcesView,
} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

export type SchedulerResource =
    | Trucker
    | Trailer
    | Vehicle
    | Company
    | DedicatedResourceForCharteringScheduler;

export type ResourceType = TripSchedulerView | CharteringView | DedicatedResourcesView;
