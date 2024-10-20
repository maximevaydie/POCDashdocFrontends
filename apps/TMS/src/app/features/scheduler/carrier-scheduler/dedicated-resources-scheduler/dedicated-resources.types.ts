import {
    Company,
    RequestedVehicle,
    SiteSlot,
    Tag,
    TransportAddress,
    TransportStatusCategory,
} from "dashdoc-utils";

import {Delivery} from "app/types/transport";

export type DedicatedResourcesView = "dedicated_resources";

export type DedicatedResourceType = "trucker" | "vehicle" | "trailer";

export type DedicatedResourceForCharteringScheduler = {
    pk: number;
    label: string;
    resource_type: DedicatedResourceType;
    carrier_name: string;
};

export type SegmentStatus =
    | "unplanned"
    | "planned_but_not_sent"
    | "draft_assigned_to_charter"
    | "planned_and_sent"
    | "acknowledged"
    | "on_loading_site"
    | "loading_complete"
    | "on_unloading_site"
    | "unloading_complete"
    | "done"
    | "invoiced"
    | "declined"
    | "sent_to_charter"
    | "assigned"
    | "accepted_by_charter"
    | "cancelled"
    | "on_going";

export interface AddressForScheduler {
    pk: number;
    original: number;
    name: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    company?: Partial<Company>;
}
export interface SiteForScheduler {
    uid: string;
    address: AddressForScheduler | null;
    real_start: string | null;
    real_end: string | null;
    slots?: SiteSlot[];
    is_booking_needed?: boolean;
    loading_instructions?: string;
    unloading_instructions?: string;
    instructions?: string;
    eta: string;
    eta_tracking: boolean;
    punctuality_status: "untracked" | "probably_late" | "probably_on_time" | "late" | "on_time";
    category?: "" | "loading" | "unloading" | "breaking" | "resuming";
    deliveries_from?: Delivery[];
    deliveries_to?: Delivery[];
}

// Type returned by /api/web/dedicated-resources-scheduler/
export type DedicatedResourcesCharteringSchedulerSegment = {
    uid: string;
    created: string;
    origin: SiteForScheduler;
    destination: SiteForScheduler;
    status: SegmentStatus;
    agreed_price?: number;
    transport: {
        uid: string;
        shipper: {
            pk?: number;
            name: string;
        };
        shipper_address?: TransportAddress;
        is_order?: boolean;
        status?: TransportStatusCategory;
        sequential_id: number;
        requested_vehicle: RequestedVehicle | null;
        tags: Array<Tag>;
        instructions?: string;
    };
    scheduler_datetime_range: {
        start: string;
        end: string;
    };
    trucker_id: number | null;
};
