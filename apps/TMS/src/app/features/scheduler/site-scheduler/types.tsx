import type {Transport} from "app/types/transport";

export type SiteStatus =
    | "cancelled"
    | "late"
    | "on_site"
    | "trucker_arrived"
    | "done"
    | "activity_done"
    | "departed"
    | "created"
    | "updated"
    | "unassigned"
    | "confirmed"
    | "acknowledged"
    | "assigned"
    | "sent_to_trucker"
    | "planned_and_sent"
    | "loading_complete"
    | "unloading_complete"
    | "on_loading_site"
    | "on_unloading_site";

export type ActivityCategory = "loading" | "unloading" | "breaking" | "resuming";
export type ActivityStatus =
    | "created"
    | "on_site"
    | "trucker_arrived"
    | "departed"
    | "activity_done";

export interface SiteSchedulerAddress {
    pk: number;
    original: number;
    name: string;
    city: string;
    postcode: string;
    country: string;
}

export interface SiteSchedulerTransportCarrierAddress {
    name: string;
    country: string;
}

export interface SiteSchedulerTransport {
    id: number;
    uid: string;
    status: Transport["status"];
    carrier: number;
    carrier_address: SiteSchedulerTransportCarrierAddress;
    shipper: number;
}

export interface SiteSchedulerDeliveryPlannedLoad {
    uid: string;
    description: string;
    category: string;
}

export interface SiteSchedulerDelivery {
    uid: string;
    sequential_id: number;
    origin: {
        address: SiteSchedulerAddress;
    };
    destination: {
        address: SiteSchedulerAddress;
    };
    planned_loads: SiteSchedulerDeliveryPlannedLoad[];
}

export interface SiteSchedulerActivity {
    id: number;
    uid: string;
    status: ActivityStatus;
    category: ActivityCategory;
    address: SiteSchedulerAddress;
    real_start: string;
    real_end: string;
    slots: {start: string; end: string}[];
    eta_tracking: boolean;
    eta: string;
    transport: SiteSchedulerTransport;
    punctuality_status: "untracked" | "probably_late" | "probably_on_time" | "late" | "on_time";
    deliveries_from?: SiteSchedulerDelivery[];
    deliveries_to?: SiteSchedulerDelivery[];
    break_or_resume_activity_deliveries?: SiteSchedulerDelivery[];
}

export interface SiteSchedulerSharedActivity {
    id: number;
    activities: SiteSchedulerActivity[];
    status: ActivityStatus;
}
