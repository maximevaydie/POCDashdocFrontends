import {Period} from "@dashdoc/web-common";

export type TransportPeriodQuery = {
    period?: Period | null;
    start_date?: string | null;
    end_date?: string | null;

    loading_period?: Period | null;
    loading_start_date?: string | null;
    loading_end_date?: string | null;

    unloading_period?: Period | null;
    unloading_start_date?: string | null;
    unloading_end_date?: string | null;
};
export type CreatedTransportPeriodQuery = {
    created_period?: Period | null;
    created_start_date?: string | null;
    created_end_date?: string | null;
};
