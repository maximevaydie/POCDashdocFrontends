import {
    FilteringBar,
    FilteringBarProps,
} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import useCompanyIsQualimat from "app/hooks/useCompanyIsQualimat";
import {getClientFilter} from "app/screens/invoicing/filtering/tariffGridClientFilter";
import {tariffGridFilteringService} from "app/screens/invoicing/filtering/tariffGridFiltering.service";
import {
    DEFAULT_TARIFF_GRIDS_FILTERING_QUERY,
    TARIFF_GRIDS_VIEW_CATEGORY,
    TariffGridsFilteringQuery,
} from "app/screens/invoicing/filtering/tariffGridFiltering.types";
import {getLoadCategoryFilter} from "app/screens/invoicing/filtering/tariffGridLoadCategoryFilter";
import {getOwnerTypeFilter} from "app/screens/invoicing/filtering/tariffGridOwnerTypeFilter";
import {getStatusFilter} from "app/screens/invoicing/filtering/tariffGridStatusFilter";

type Props = {
    currentQuery: TariffGridsFilteringQuery;
    selectedViewPk: number | undefined;
    updateQuery: (
        newQuery: Partial<TariffGridsFilteringQuery>,
        method?: "push" | "replace"
    ) => void;
    updateSelectedViewPk: (viewPk: number | null | undefined) => void;
};

export function TariffGridFilteringBar({
    currentQuery,
    selectedViewPk,
    updateQuery,
    updateSelectedViewPk,
}: Props) {
    const isQualimat = useCompanyIsQualimat();

    const filters = useMemo(() => {
        return [
            getClientFilter(),
            getOwnerTypeFilter(),
            getStatusFilter(),
            getLoadCategoryFilter(isQualimat),
        ];
    }, [isQualimat]);

    const viewsParams: FilteringBarProps<TariffGridsFilteringQuery>["viewsParams"] = {
        selectedViewPk: selectedViewPk,
        setSelectedViewPk: updateSelectedViewPk,
        viewCategory: TARIFF_GRIDS_VIEW_CATEGORY,
        addEnabled: true,
        deleteEnabled: true,
    };

    return (
        <Box flex={1} minWidth="50%">
            <FilteringBar<TariffGridsFilteringQuery>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={DEFAULT_TARIFF_GRIDS_FILTERING_QUERY}
                parseQuery={tariffGridFilteringService.parseQuerySchema}
                viewsParams={viewsParams}
                size="large"
                data-testid="tariff-grid-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("common.search")}
            />
        </Box>
    );
}
