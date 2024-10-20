import {Company} from "types/company";

export type SlotState = "planned" | "arrived" | "handled" | "completed" | "cancelled";

export type Slot = {
    id: number;
    zone: number;
    start_time: string;
    end_time: string;
    author: {
        email: string;
        first_name: string;
        last_name: string;
    };
    owner: Company;
    company: Company;
    custom_fields: SlotCustomField[] | null;
    references: string[] | null;
    note: string | null;
    state: SlotState;
    cancelled_at: string | null;
    cancelled_by: number | null; // user id
    cancel_company: number | null; // company id
    cancel_reason: string | null;
    arrived_at: string | null;
    handled_at: string | null;
    completed_at: string | null;
    within_booking_window: boolean;
};

export type SlotCustomField = {
    id: number;
    label: string;
    value: string;
    required: boolean;
};
