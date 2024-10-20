import {getCarrierFilter} from "@dashdoc/web-common";
import {FilteringBar} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {Box} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React, {useMemo} from "react";
import {z} from "zod";

import {getShipperFilter} from "app/features/filters/badges-and-selectors/shipper/shipperFilter.service";
import {getDateFilter} from "app/screens/scheduler/site-scheduler-filtering-bar/DateFilter";
import {SiteSchedulerQuery} from "app/screens/scheduler/SiteSchedulerScreen";

type Props = {
    query: SiteSchedulerQuery;
    updateQuery: (newQuery: Partial<SiteSchedulerQuery>) => void;
};

const SiteSchedulerSettingsSchema = z.object({
    date: z.string().nullable().optional(),
    shipper__in: z.array(z.string()).optional(),
    carrier__in: z.array(z.string()).optional(),
});

const RESET_SITE_SCHEDULER_QUERY: SiteSchedulerQuery = {
    date: formatDate(new Date(), "yyyy-MM-dd"),
    shipper__in: [],
    carrier__in: [],
};

type SiteSchedulerSettings = z.infer<typeof SiteSchedulerSettingsSchema>;

export function SiteSchedulerFilteringBar({query, updateQuery}: Props) {
    const filters = useMemo(() => {
        return [getDateFilter(), getShipperFilter(), getCarrierFilter()];
    }, []);

    if (!query.date) {
        updateQuery({date: formatDate(new Date(), "yyyy-MM-dd")});
    }
    return (
        <Box flex={1} minWidth="50%">
            <FilteringBar<SiteSchedulerSettings>
                filters={filters}
                query={query}
                updateQuery={updateQuery}
                resetQuery={RESET_SITE_SCHEDULER_QUERY}
                parseQuery={SiteSchedulerSettingsSchema.parse}
                data-testid="site-scheduler-filtering-bar"
            />
        </Box>
    );
}
