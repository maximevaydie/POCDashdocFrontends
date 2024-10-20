import {RequestedVehicle, SiteSlot, Manager, Tag} from "dashdoc-utils";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";
import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {SchedulerActivitiesForCard} from "./card-sections/activities/cardActivity.types";

export type SchedulerCardProps = {
    decoration: Decoration;
    name?: string;
    activities: SchedulerActivitiesForCard[];
    means: {
        trucker?: {pk: number; display_name?: string};
        vehicle?: {license_plate: string; fleet_number?: string};
        trailer?: {license_plate: string; fleet_number?: string};
    };
    requestedVehicles: RequestedVehicle[];
    instructions: string;
    cardDateRange: SiteSlot;
    schedulerStartDate?: Date;
    schedulerEndDate?: Date;
    isPreparedTrip: boolean;
    height?: number;
    viewMode?: TripSchedulerView | CharteringView | DedicatedResourcesView;
    isSelected?: boolean;
    isFiltered?: boolean;
    width?: string;
    "data-testid"?: string;
    children?: React.ReactNode;
    settings?: Manager["scheduler_card_display_settings"];
    inconsistentOrder?: boolean;
    tags: Array<Tag>;
    stickyContent?: boolean;
    minutesScale?: number;
    onActivityHovered?: (value: {uid: string; count: number} | null) => void;
};
