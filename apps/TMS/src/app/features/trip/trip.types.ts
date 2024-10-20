import {BadgeColorVariant} from "@dashdoc/web-ui";
import {
    RequestedVehicle,
    SiteSlot,
    Tag,
    Trailer,
    TransportAddress,
    TransportGlobalStatus,
    TransportInvoicingStatus,
    Trucker,
    Vehicle,
} from "dashdoc-utils";

import type {Load, TransportStatusValue} from "app/types/transport";

export type Trip = GenericTrip<TripActivity>;
export type CompactTrip = GenericTrip<SimilarActivity>;
export type TripWithTransportData = GenericTrip<SimilarActivityWithTransportData>;
interface GenericTrip<TActivity> {
    activities: TActivity[];
    turnover: string | null;
    carrier?:
        | {
              // for extended view
              pk?: number;
              name: string;
          }
        | number;
    created: string;
    estimated_distance?: number | null;
    estimated_driving_time?: number | null;
    estimated_carbon_footprint?: number | null;
    inconsistentOrder?: boolean; // computed from frontend
    is_prepared: boolean;
    last_transport_address?: TransportAddress;
    name?: string;
    owned_by_company: boolean;
    scheduled_order: number;
    scheduler_datetime_range: SiteSlot;
    status?: TripStatus;
    trailer?: Trailer;
    trucker_status?: TruckerStatus;
    trucker?: Trucker;
    uid: string;
    vehicle?: Vehicle;
    child_transport: TripChildTransport | null;
}

export type TripStatus =
    | "unstarted"
    | "ongoing"
    | "done"
    | "verified"
    | "invoiced"
    | "declined"
    | "sent_to_charter"
    | "assigned"
    | "accepted_by_charter"
    | "cancelled";

export type TruckerStatus =
    | "unassigned"
    | "trucker_assigned"
    | "mission_sent_to_trucker"
    | "acknowledged";

export type DeliveryTrip = {
    uid: string;
    sequential_id: number;
    origin_loads: Array<Load>;
    destination_loads: Array<Load>;
    planned_loads: Array<Load>;
    multiple_rounds: boolean;
};

export type TripActivityCategory =
    | ""
    | "loading"
    | "unloading"
    | "breaking"
    | "resuming"
    | "trip_start"
    | "trip_end";
export type ActivityStatus = "created" | "approaching" | "on_site" | "activity_done" | "departed";
export type TripTransport = {
    business_privacy: boolean;
    carrier_id: number;
    id: number;
    instructions?: string;
    is_multiple_compartments: boolean;
    is_order: boolean;
    requires_acceptance: boolean;
    requested_vehicle: RequestedVehicle | null;
    sequential_id: number;
    shipper: {
        pk?: number;
        name: string;
    };
    shipper_address?: {
        name: string;
        address: string;
        city: string;
        postcode: string;
        country: string;
    };
    global_status: TransportGlobalStatus;
    invoicing_status: TransportInvoicingStatus;
    tags: Tag[];
    uid: string;
    deleted: string | null;
    carrier_reference: string;
    shipper_reference: string;
};

export type TripActivity = {
    address: TransportAddress | null;
    category?: TripActivityCategory;
    deliveries_from: DeliveryTrip[];
    deliveries_to: DeliveryTrip[];
    estimated_distance_to_next_trip_activity?: number | null;
    estimated_driving_time_to_next_trip_activity?: number | null;
    eta_tracking?: boolean;
    eta?: string | null;
    is_booking_needed?: boolean;
    locked_requested_times?: boolean;
    punctuality_status?: "untracked" | "probably_late" | "probably_on_time" | "late" | "on_time";
    real_end?: string | null;
    real_start?: string | null;
    scheduled_range?: SiteSlot | null;
    transport: TripTransport | null;
    slots?: SiteSlot[];
    status: ActivityStatus;
    uid: string;
    reference: string;
    cancelled_status: "cancelled" | "deleted" | null;
};

export type SimilarActivity = Omit<TripActivity, "transport"> & {
    similarUids: string[];
    transports: TripTransport[];
    fakeMerged: boolean;
};

export type SimilarActivityWithTransportData = SimilarActivity &
    (
        | {
              fakeMerged: true;
              slots: (SiteSlot & AdditionalTransportData)[] | undefined;
              deliveries_from: (DeliveryTrip & AdditionalTransportData)[];
              deliveries_to: (DeliveryTrip & AdditionalTransportData)[];
          }
        | {fakeMerged: false}
    );

export type AdditionalTransportData = {transportUid: string | null; transportId: number | null};
export type TransportBadgeVariant = BadgeColorVariant;

export type InvalidTripType = "round" | "rental" | "multiCompartments" | "businessPrivacy";

export type TripsSortCriterion =
    | "transport_id"
    | "origin_site_start"
    | "origin_site_start_date"
    | "origin_site_address"
    | "origin_site_address_name"
    | "origin_site_company_name"
    | "destination_site_address"
    | "destination_site_start"
    | "destination_site_start_date"
    | "destination_site_address_name"
    | "destination_site_company_name"
    | "requested_vehicle_label"
    | "vehicle_type_complementary_information"
    | "shipper_name"
    | "carrier__name"
    | "name"
    | "loads_weight"
    | "loads_linear_meters"
    | "loads_volume"
    | "loads_quantity"
    | "loads_category"
    | "loads_description"
    | "estimated_distance"
    | "estimated_driving_time";

export type TripChildTransport = {
    uid: string;
    sequential_id: number;
    carrier_name: string;
    sent_to_carrier: boolean;
    price: string;
    instructions: string;
    chartering_confirmation_document_url: string;
    status: TransportStatusValue;
};

export type TripMeans = {
    vehicle: Trip["vehicle"];
    trailer: Trip["trailer"];
    trucker: Trip["trucker"];
};
