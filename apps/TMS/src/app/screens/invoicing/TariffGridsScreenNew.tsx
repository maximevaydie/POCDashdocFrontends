import {useCurrentQueryAndView} from "@dashdoc/web-common";
import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {
    ColumnDirection,
    Flex,
    FullHeightMinWidthScreen,
    ScrollableTableFixedHeader,
    TabTitle,
} from "@dashdoc/web-ui";
import React, {useEffect, useMemo} from "react";
import {useHistory} from "react-router";
import createPersistedState from "use-persisted-state";

import {getTabTranslations} from "app/common/tabs";
import {TariffGridCreateAction} from "app/features/pricing/tariff-grids/TariffGridCreateAction";
import {TariffGrid} from "app/features/pricing/tariff-grids/types";
import {tariffGridFilteringService} from "app/screens/invoicing/filtering/tariffGridFiltering.service";
import {
    DEFAULT_TARIFF_GRIDS_FILTERING_QUERY,
    TARIFF_GRIDS_VIEW_CATEGORY,
    TariffGridOrdering,
    TariffGridsFilteringQuery,
} from "app/screens/invoicing/filtering/tariffGridFiltering.types";
import {TariffGridFilteringBar} from "app/screens/invoicing/filtering/TariffGridFilteringBar";
import {TariffGridsList} from "app/screens/invoicing/TariffGridsList";
import {SidebarTabNames} from "app/types/constants";

const PREDEFINED_ORDERING_STORAGE_KEY = "tariffGrids.predefinedOrdering";
const predefinedOrderingState = createPersistedState(PREDEFINED_ORDERING_STORAGE_KEY);

export function TariffGridsScreenNew() {
    const history = useHistory();

    const [predefinedOrdering, setPredefinedOrdering] = predefinedOrderingState<
        TariffGridOrdering | ""
    >("");

    const {
        currentQuery,
        updateQuery: updateCurrentQuery,
        selectedViewPk,
        updateSelectedViewPk,
    } = useCurrentQueryAndView<TariffGridsFilteringQuery>({
        parseQueryString: tariffGridFilteringService.parseQuery,
        queryValidation: tariffGridFilteringService.parseQuerySchema,
        defaultQuery: DEFAULT_TARIFF_GRIDS_FILTERING_QUERY,
        viewCategory: TARIFF_GRIDS_VIEW_CATEGORY,
    });

    // Use predefined ordering if it is not set in the URL
    if (!currentQuery.ordering && predefinedOrdering) {
        currentQuery.ordering = predefinedOrdering;
    }

    const currentQueryParams =
        tariffGridFilteringService.getQueryParamsFromFiltersQuery(currentQuery);

    const {
        items: tariffGrids,
        hasNext: hasNextPage,
        isLoading,
        loadNext: loadNextPage,
        reload: reloadTariffGrids,
    } = usePaginatedFetch<TariffGrid>("tariff-grids/", currentQueryParams, {apiVersion: "web"});

    const ordering: Record<string, ColumnDirection> | undefined = useMemo(() => {
        const ordering = currentQuery.ordering as string;
        if (!ordering) {
            return undefined;
        }
        const isReverse = ordering.startsWith("-");
        const columnName = isReverse ? ordering.slice(1) : ordering;
        return {[columnName]: isReverse ? "desc" : "asc"};
    }, [currentQuery.ordering]);

    // Refresh the list when the query changes
    useEffect(() => {
        reloadTariffGrids();
    }, [currentQuery]);

    return (
        <FullHeightMinWidthScreen pt={3}>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3} alignItems="center">
                    <TabTitle title={getTabTranslations(SidebarTabNames.TARIFF_GRIDS)} />
                    <TariffGridCreateAction />
                </Flex>

                <TariffGridFilteringBar
                    currentQuery={currentQuery}
                    selectedViewPk={selectedViewPk}
                    updateQuery={updateQuery}
                    updateSelectedViewPk={updateSelectedViewPk}
                />
            </ScrollableTableFixedHeader>

            <Flex overflow="hidden" p={3} flexDirection="column" flexGrow={1}>
                <TariffGridsList
                    tariffGrids={tariffGrids}
                    allTariffGridsCount={tariffGrids.length}
                    isLoading={isLoading}
                    onEndReached={loadNextPage}
                    hasNextPage={hasNextPage}
                    getRowCellIsClickable={(_, columnName) => columnName !== "actions"}
                    onClickOnTariffGrid={(tariffGrid) =>
                        history.push(`/app/tariff-grids/${tariffGrid.uid}`)
                    }
                    searchedTexts={currentQuery.text ?? []}
                    ordering={ordering}
                    onOrderingChange={updateOrdering}
                    refreshList={reloadTariffGrids}
                />
            </Flex>
        </FullHeightMinWidthScreen>
    );

    function updateOrdering(newOrdering: Record<string, ColumnDirection> | null) {
        if (!newOrdering || Object.keys(newOrdering).length === 0) {
            updateQuery({ordering: undefined});
        } else {
            const columnName = Object.keys(newOrdering)[0];
            const isReversed = Object.values(newOrdering)[0] === "desc";

            updateQuery({
                ordering: `${isReversed ? "-" : ""}${columnName}` as TariffGridOrdering,
            });
        }
    }

    function updateQuery(
        newQuery: Partial<TariffGridsFilteringQuery>,
        method?: "push" | "replace"
    ) {
        updateCurrentQuery(newQuery, method);
        if ("ordering" in newQuery) {
            setPredefinedOrdering(() => newQuery.ordering ?? "");
        }
    }
}
