import {getCarrierFilter} from "@dashdoc/web-common/src/features/filters/badges-and-selectors";
import {getTagFilter} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/tag/tagFilter.service";
import {FilteringBar} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {getTruckerFilter} from "app/features/filters/badges-and-selectors/fleet/trucker/truckerFilter.service";
import {
    TruckersSettings,
    TruckersSettingsSchema,
} from "app/features/fleet/trucker/filter/truckerFilters.types";
import {SIDEBAR_FLEET_QUERY} from "app/features/sidebar/constants";
import {TruckersScreenQuery} from "app/screens/fleet/truckers/TruckersScreen";
import {SidebarTabNames} from "app/types/constants";

type Props = {
    currentQuery: TruckersScreenQuery;
    updateQuery: (newQuery: Partial<TruckersScreenQuery>) => void;
};

const RESET_TRUCKER_QUERY: TruckersScreenQuery = {
    ...SIDEBAR_FLEET_QUERY[SidebarTabNames.TRUCKERS],
    text: [],
    carrier__in: [],
    trucker__in: [],
    trucker_tags__in: [],
    tags__in: [],
};
export function TruckerFilteringBar({currentQuery, updateQuery}: Props) {
    const filters = useMemo(() => {
        return [
            getTagFilter(),
            getTruckerFilter(),
            getCarrierFilter({
                fetchParams: {
                    url: "manager-truckers/list-carriers/",
                    searchQueryKey: "carrier_name",
                    apiVersion: "web",
                },
            }),
        ];
    }, []);

    return (
        <Box flex={1} minWidth="50%">
            <FilteringBar<TruckersSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={RESET_TRUCKER_QUERY}
                parseQuery={TruckersSettingsSchema.parse}
                size="medium"
                data-testid="truckers-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("common.search")}
            />
        </Box>
    );
}
