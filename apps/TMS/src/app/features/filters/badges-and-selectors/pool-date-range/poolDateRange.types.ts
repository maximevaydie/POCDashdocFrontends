import {Period} from "@dashdoc/web-common";

export type PoolDateRangeQuery = {
    pool_period?: Period | null;
    pool_start_date?: string;
    pool_end_date?: string;

    pool_loading_period?: Period | null;
    pool_loading_start_date?: string;
    pool_loading_end_date?: string;

    pool_unloading_period?: Period | null;
    pool_unloading_start_date?: string;
    pool_unloading_end_date?: string;
};
