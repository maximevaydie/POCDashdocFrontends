import {CustomField} from "types";

export interface OpeningHours {
    monday: string[][];
    tuesday: string[][];
    wednesday: string[][];
    thursday: string[][];
    friday: string[][];
    saturday: string[][];
    sunday: string[][];
}

export interface ZoneRawData {
    name: string;
    description: string;
    delegable: boolean;
    booking_in_turns: boolean;
    concurrent_slots: number;
    max_visibility: number | null;
    notice_period: number | null; // Floating hours
    notice_period_mode: "rolling_hours_window" | "relative_datetime" | null;
    notice_period_days_before_booking: number | null;
    notice_period_time_of_day: string | null;
    slot_duration: number;
    opening_hours: OpeningHours;
    custom_fields: CustomField[];
}
