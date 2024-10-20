import type {CarrierInTransport} from "@dashdoc/web-common";
import {Company, Pricing, TrackingContact} from "dashdoc-utils";

type TransportAssignationHistoryPlannedLoad = {
    weight: number;
    volume: number;
    linear_meters: number;
    quantity: number;
    steres: number;
    category: string;
    description: string;
    complementary_information: string;
    container_number: string;
    container_seal_number: string;
    idtf_number: string;
};

export type TransportAssignationHistoryDelivery = {
    uid: string;
    planned_loads: TransportAssignationHistoryPlannedLoad[];
    tracking_contacts: TrackingContact[];
};

export type TransportAssignationHistory = {
    uid: string;
    carrier: (
        | Company /* @deprecated to remove with the betterCompanyRoles FF */
        | CarrierInTransport
    ) & {
        logo?: string;
    };
    quotation: Pricing | null;
    first_loading_datetime: string;
    deliveries: TransportAssignationHistoryDelivery[];
    instructions: string;
};
