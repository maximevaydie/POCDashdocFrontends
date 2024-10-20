import {getTagFilter} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/tag/tagFilter.service";
import {FilteringBar} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {UnifiedFleetQuery} from "dashdoc-utils";
import React, {useMemo} from "react";

import {getFleetPlatesFilter} from "app/features/filters/badges-and-selectors/fleet/plates/platesFilter.service";
import {getFuelTypeFilter} from "app/features/filters/badges-and-selectors/fuel-type/fuelTypeFilter.service";
import {SIDEBAR_FLEET_QUERY} from "app/features/sidebar/constants";
import {FleetSettingsSchema, FleetSettings} from "app/screens/fleet/filter/fleetFiltering.types";
import {SidebarTabNames} from "app/types/constants";

type Props = {
    currentQuery: UnifiedFleetQuery;
    updateQuery: (newQuery: Partial<UnifiedFleetQuery>) => void;
};

const RESET_FLEET_QUERY: UnifiedFleetQuery = {
    ...SIDEBAR_FLEET_QUERY[SidebarTabNames.FLEET],
    tags__in: [],
    license_plate__in: [],
    text: [],
    fuel_type__in: [],
    page: undefined,
};

export function FleetFilteringBar({currentQuery, updateQuery}: Props) {
    const filters = useMemo(() => {
        return [getTagFilter(), getFleetPlatesFilter(), getFuelTypeFilter()];
    }, []);

    return (
        <Box flex={1} minWidth="50%">
            <FilteringBar<FleetSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={RESET_FLEET_QUERY}
                parseQuery={FleetSettingsSchema.parse}
                size="medium"
                data-testid="fleet-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("common.search")}
            />
        </Box>
    );
}
