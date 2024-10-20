import {getTagFilter} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/tag/tagFilter.service";
import {
    FilteringBar,
    FilteringBarProps,
} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {Box} from "@dashdoc/web-ui";
import React, {useContext, useMemo} from "react";

import {getAddressFilter} from "app/features/filters/badges-and-selectors/address/addressFilter.service";
import {getAddressByCriteriaFilter} from "app/features/filters/badges-and-selectors/address-by-criteria/AddressByCriteriaFilter.service";
import {getPoolDateRangeFilter} from "app/features/filters/badges-and-selectors/pool-date-range/poolDateRangeFilter.service";
import {getShipperFilter} from "app/features/filters/badges-and-selectors/shipper/shipperFilter.service";
import {usePoolDefaultDateStaticRanges} from "app/features/scheduler/carrier-scheduler/components/filters/usePoolDefaultDateStaticRanges";
import {
    PoolOfUnplannedSettings,
    PoolOfUnplannedSettingsSchema,
} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import {DEFAULT_POOL_SETTINGS} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/constant";
import {PoolViewContext} from "app/screens/scheduler/hook/view/usePoolViewContext";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

export function PoolFilteringBar({filteringBarId}: {filteringBarId: string}) {
    const {currentQuery, updateQuery} = useContext(PoolCurrentQueryContext);
    const poolViewContext = useContext(PoolViewContext);

    const poolDefaultDateStaticRanges = usePoolDefaultDateStaticRanges();

    const filters = useMemo(
        () => [
            getPoolDateRangeFilter(poolDefaultDateStaticRanges),
            getTagFilter(),
            getAddressFilter(true),
            getAddressByCriteriaFilter(),
            getShipperFilter(),
        ],
        [poolDefaultDateStaticRanges]
    );

    const viewsParams: FilteringBarProps<PoolOfUnplannedSettings>["viewsParams"] = useMemo(
        () => ({
            selectedViewPk: poolViewContext.viewPk,
            setSelectedViewPk: poolViewContext.selectViewPk,
            viewCategory: "pool_of_unplanned",
            addEnabled: true,
            deleteEnabled: true,
        }),
        [poolViewContext]
    );

    return (
        <Box py={2}>
            <FilteringBar<PoolOfUnplannedSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={DEFAULT_POOL_SETTINGS}
                parseQuery={PoolOfUnplannedSettingsSchema.parse}
                viewsParams={viewsParams}
                data-testid={filteringBarId}
                searchEnabled
            />
        </Box>
    );
}
