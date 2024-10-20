import {Period} from "@dashdoc/web-common";

export type DateRangeQuery = {
    period?: Period;
    start_date?: string;
    end_date?: string;
};
