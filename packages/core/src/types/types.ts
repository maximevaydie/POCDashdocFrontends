import {DateRangePickerProps} from "@dashdoc/web-ui";
import {ManagerRole} from "dashdoc-utils";

export type ManagerCompany = {
    pk: number;
    name: string;
    group_view_id: number | null;
    // The current user role in the company
    role: ManagerRole;
    managed_by_name: string | null;
    last_switch_date: string;
};

export type PeriodFilterProps = Partial<DateRangePickerProps> & {
    isDeletable?: boolean;
};

export const periodOptions = [
    "today",
    "tomorrow",
    "until_today",
    "today_and_tomorrow",
    "last_week",
    "last_month",
    "around_today",
    "short_week",
    "long_week",
    "week",
    "last_week",
    "month",
    "last_month",
] as const;
export type Period = (typeof periodOptions)[number];
