import {Period} from "@dashdoc/web-common";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {SidebarTabNames} from "app/types/constants";

export type SchedulerFilters = {
    tab?: SidebarTabNames.CARRIER_SCHEDULER;
    period?: Period | null;
    start_date?: string;
    end_date?: string;
    pool_period?: Period | null;
    pool_start_date?: string | null;
    pool_end_date?: string | null;
    pool_loading_period?: Period | null;
    pool_loading_start_date?: string | null;
    pool_loading_end_date?: string | null;
    pool_unloading_period?: Period | null;
    pool_unloading_start_date?: string | null;
    pool_unloading_end_date?: string | null;
    trucker__in?: Array<string>;
    trucker__isnull?: boolean;
    vehicle__in?: Array<string>;
    vehicle__isnull?: boolean;
    trailer__in?: Array<string>;
    trailer__isnull?: boolean;
    carrier__in?: Array<string>;
    custom_id_order?: Array<string>;
    fleet_tags__in?: Array<string>;
    tags__in?: Array<string>;
    shipper__in?: Array<string>;
    address__in?: Array<string>;
    origin_address__in?: Array<string>;
    destination_address__in?: Array<string>;
    ordering?: string;
    ordering_truckers?: string;
    ordering_vehicles?: string;
    ordering_trailers?: string;
    view?: TripSchedulerView | CharteringView | DedicatedResourcesView;
    address_text?: string;
    address_postcode__in?: string;
    address_country__in?: string;
    origin_address_text?: string;
    origin_address_postcode__in?: string;
    origin_address_country__in?: string;
    destination_address_text?: string;
    destination_address_postcode__in?: string;
    destination_address_country__in?: string;
    extended_view?: boolean;
    text?: string[];
};
