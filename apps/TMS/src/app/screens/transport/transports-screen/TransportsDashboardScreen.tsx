import {apiService, useBaseUrl, useQueryFromUrl, useTimezone} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Flex,
    FullHeightMinWidthScreen,
    ListEmptyNoResultsWithFilters,
    LoadingWheel,
    ScrollableTableContainer,
    ScrollableTableFixedHeader,
    TabTitle,
    Text,
} from "@dashdoc/web-ui";
import {formatNumber, DeliveriesStats} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import {toast} from "react-toastify";

import {getTabTranslations} from "app/common/tabs";
import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {SIDEBAR_DASHBOARD_QUERY} from "app/features/sidebar/constants";
import {TransportsDashboard} from "app/features/transport/transports-dashboard";
import {DEFAULT_TRANSPORTS_DASHBOARD_SETTINGS} from "app/features/transport/transports-list/constant";
import {TransportsFilteringBar} from "app/features/transport/transports-list/TransportsFilteringBar";
import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";
import {transportScreenService} from "app/screens/transport/transports-screen/transportScreen.service";
import {SidebarTabNames} from "app/types/constants";

export const TransportsDashboardScreen: FunctionComponent = () => {
    const timezone = useTimezone();
    const baseUrl = useBaseUrl();

    const {currentQuery, updateQuery} = useQueryFromUrl<TransportsScreenQuery>(parseQueryString);

    const resetQuery = useCallback(
        () => updateQuery(DEFAULT_TRANSPORTS_DASHBOARD_SETTINGS),
        [updateQuery]
    );
    //#endregion

    const [dashboardData, setDashboardData] = useState<DeliveriesStats | null>(null);

    useEffect(() => {
        // fetch stats on mount and as soon as the query change
        const fetchDashboardData = async () => {
            setDashboardData(null);
            try {
                const data = await apiService.Deliveries.getStats({
                    query: getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true),
                });
                setDashboardData(data);
            } catch (error) {
                Logger.error(error);
                toast.error(t("transportStats.error.couldNotFetch"));
            }
        };
        fetchDashboardData();
    }, [currentQuery, timezone]);

    const numberOfTransports = dashboardData?.meta.transport_count;

    return (
        <FullHeightMinWidthScreen pt={3}>
            {/* Header */}
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3} alignItems="center">
                    {/* Tab title */}
                    <TabTitle
                        title={getTabTranslations(SidebarTabNames.DASHBOARD)}
                        detailText={`- ${formatNumber(numberOfTransports)} ${t(
                            "common.transports",
                            {smart_count: numberOfTransports ?? 2}
                        )}`}
                    />
                </Flex>

                <TransportsFilteringBar currentQuery={currentQuery} updateQuery={updateQuery} />
            </ScrollableTableFixedHeader>
            {/* Dashboard */}
            <ScrollableTableContainer>
                <TransportsDashboard
                    updateQuery={updateQuery}
                    renderLoading={renderLoading}
                    renderNoResults={() => (
                        <ListEmptyNoResultsWithFilters
                            resetQuery={resetQuery}
                            title={t("screens.transports.filters.noResults")}
                            data-testid="transport-list-render-no-results"
                        />
                    )}
                    data={dashboardData}
                    baseUrl={baseUrl}
                />
            </ScrollableTableContainer>
        </FullHeightMinWidthScreen>
    );
};

const renderLoading = () => (
    <Flex flexDirection="column" alignItems="center" justifyContent="flex-start" py={8}>
        <LoadingWheel noMargin />
        <Text mt={4}>{t("screens.transports.searchInProgress")}</Text>
    </Flex>
);

function parseQueryString(queryString: string) {
    return {
        ...SIDEBAR_DASHBOARD_QUERY[SidebarTabNames.DASHBOARD],
        ...transportScreenService.baseParseQuery(queryString, false),
    } as TransportsScreenQuery;
}
