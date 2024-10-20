import type {DayOpeningHours, Weekday} from "./misc";

export type Zone = {
    id: number;
    site: number;
    name: string;
    description: string;
    max_visibility: number | null;
    notice_period_mode: "rolling_hours_window" | "relative_datetime" | null;
    notice_period: number | null; // Relative hours
    notice_period_days_before_booking: number | null;
    notice_period_time_of_day: string | null;
    concurrent_slots: number;
    slot_duration: number;
    opening_hours: Record<Weekday, DayOpeningHours>;
    delegable: boolean;
    booking_in_turns: boolean;
    custom_fields: CustomField[] | null;
};

export type CustomField = {
    id: number;
    label: string;
    required: boolean;
    visible_on_card?: boolean;
};

export const defaultNoticePeriodMode = "rolling_hours_window";
