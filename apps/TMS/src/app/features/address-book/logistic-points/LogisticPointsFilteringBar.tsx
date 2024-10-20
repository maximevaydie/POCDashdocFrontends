import {useFeatureFlag} from "@dashdoc/web-common";
import {
    FilteringBar,
    FilteringBarProps,
} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {getCreationMethodFilter} from "app/features/filters/badges-and-selectors/logistic-point/creation-method/creationMethodFilter.service";
import {getDateRangeFilter} from "app/features/filters/badges-and-selectors/logistic-point/date/dateRangeFilter.service";
import {getHasCoordsValidatedFilter} from "app/features/filters/badges-and-selectors/logistic-point/hasCoordinatesValidatedFilter";
import {getHasInstructionsFilter} from "app/features/filters/badges-and-selectors/logistic-point/hasInstructionsFilter";
import {getHasSecurityProtocolFilter} from "app/features/filters/badges-and-selectors/logistic-point/hasSecurityProtocolFilter";

import {RESET_LOGISTIC_POINTS_FILTER} from "./constants";
import {
    LOGISTIC_POINTS_VIEW_CATEGORY,
    LogisticPointsFilterSchema,
    type LogisticPointsFilter,
} from "./types";

type FilteringProps = {
    currentQuery: LogisticPointsFilter;
    updateQuery: (newQuery: Partial<LogisticPointsFilter>, method?: "push" | "replace") => void;
    selectedViewPk: number | undefined;
    updateSelectedView: (viewPk: number | null | undefined) => void;
};

export function LogisticPointsFilteringBar({
    currentQuery,
    updateQuery,
    selectedViewPk,
    updateSelectedView,
}: FilteringProps) {
    const hasLogisticPointsHaveNoRoleEnabled = useFeatureFlag("logisticPointsHaveNoRole");
    const filters = useMemo(() => {
        if (hasLogisticPointsHaveNoRoleEnabled) {
            return [
                getCreationMethodFilter(),
                getHasSecurityProtocolFilter(),
                getHasCoordsValidatedFilter(),
                getHasInstructionsFilter(),
                getDateRangeFilter(),
            ];
        }
        return [getCreationMethodFilter(), getDateRangeFilter()];
    }, [hasLogisticPointsHaveNoRoleEnabled]);

    const viewsParams: FilteringBarProps<LogisticPointsFilter>["viewsParams"] = {
        selectedViewPk: selectedViewPk,
        setSelectedViewPk: updateSelectedView,
        viewCategory: LOGISTIC_POINTS_VIEW_CATEGORY,
        addEnabled: true,
        deleteEnabled: true,
    };

    return (
        <Box pb={2} flex={1}>
            <FilteringBar<LogisticPointsFilter>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={RESET_LOGISTIC_POINTS_FILTER}
                parseQuery={LogisticPointsFilterSchema.parse}
                viewsParams={viewsParams}
                size="large"
                data-testid="logistic-point-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("screens.transports.searchBarPlaceholder") /* TODO */}
            />
        </Box>
    );
}
