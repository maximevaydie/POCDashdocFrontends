import {FilteringBar} from "@dashdoc/web-common";
import {ReportType} from "@dashdoc/web-common/src/types/reportsTypes";
import {ReportFiltersData, ReportWidgetFull} from "@dashdoc/web-common/src/types/reportsTypes";
import {i18nReportService} from "@dashdoc/web-core";
import {Badge, Box, Flex} from "@dashdoc/web-ui";
import {Area} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getAreaFilter} from "app/features/filters/badges-and-selectors/reports/area/areaFilter.service";
import {getDateRangeFilter} from "app/features/filters/badges-and-selectors/reports/date-range/dateRangeFilter.service";
import {getRequestedVehicleTypeFilter} from "app/features/filters/badges-and-selectors/reports/requested-vehicle-type/requestedVehicleTypeFilter.service";
import {getShipperFilter} from "app/features/filters/badges-and-selectors/shipper/shipperFilter.service";
import {getTransportStatusFilter} from "app/features/filters/badges-and-selectors/transport-statuses/transportStatusFilter.service";

import {
    getReportFiltersDisplaySettings,
    getReportQueryFromWidget,
    getWidgetFromReportQuery,
    ReportQuery,
    staticRanges,
} from "./utils";

type ReportFiltersProps = {
    widget: ReportWidgetFull;
    onChange: (newArgs: {
        parameters?: ReportFiltersData;
        origin_area?: Area | null;
        destination_area?: Area | null;
    }) => void;
};

export const ReportFilters: FunctionComponent<ReportFiltersProps> = ({widget, onChange}) => {
    const filtersDisplaySettings = getReportFiltersDisplaySettings(widget.type as ReportType);

    const filters = [
        getGraphTypeBadge(widget?.type),
        ...(filtersDisplaySettings.origin_area ? [getAreaFilter("origin")] : []),
        ...(filtersDisplaySettings.destination_area ? [getAreaFilter("destination")] : []),
        ...(filtersDisplaySettings.period
            ? [getDateRangeFilter({staticRanges}, false, "last_month")]
            : []),
        ...(filtersDisplaySettings.shippers ? [getShipperFilter()] : []),
        ...(filtersDisplaySettings.vehicle_type ? [getRequestedVehicleTypeFilter()] : []),
        ...(filtersDisplaySettings.transport_status ? [getTransportStatusFilter()] : []),
    ];

    const widgetQuery: ReportQuery = getReportQueryFromWidget(widget);

    function handleQueryChange(query: Partial<ReportQuery>) {
        onChange(getWidgetFromReportQuery(query));
    }

    return (
        <Box>
            <FilteringBar<ReportQuery>
                filters={filters}
                query={widgetQuery}
                resetQuery={RESET_QUERY}
                updateQuery={handleQueryChange}
                data-testid={"report-filtering-bar"}
            />
        </Box>
    );
};

function getGraphTypeBadge(widgetType?: string) {
    return {
        key: `graph-type`,
        selector: null,
        getBadges: () => [
            {
                count: widgetType ? 1 : 0,
                badge: (
                    <Badge shape="squared" noWrap ml={2} variant="neutral">
                        {widgetType && (
                            <Flex minHeight="22px" alignItems="center">
                                {i18nReportService.getReportLabel(widgetType)}
                            </Flex>
                        )}
                    </Badge>
                ),
            },
        ],
    };
}

const RESET_QUERY: ReportQuery = {
    origin_area: null,
    destination_area: null,

    start_date: undefined,
    end_date: undefined,
    period: "last_month",

    loading_start_date: undefined,
    loading_end_date: undefined,
    loading_period: undefined,

    unloading_start_date: undefined,
    unloading_end_date: undefined,
    unloading_period: undefined,

    transport_status__in: [],
    shipper__in: [],
    requested_vehicle__in: [],
};
