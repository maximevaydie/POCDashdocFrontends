import {getCarrierFilter, useFeatureFlag} from "@dashdoc/web-common";
import {getTagFilter} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/tag/tagFilter.service";
import {
    FilteringBar,
    FilteringBarProps,
} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {
    ORDERS_BUSINESS_STATUSES,
    TRANSPORTS_BUSINESS_STATUSES,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {TabName} from "app/common/tabs";
import {getAddressFilter} from "app/features/filters/badges-and-selectors/address/addressFilter.service";
import {getAddressByCriteriaFilter} from "app/features/filters/badges-and-selectors/address-by-criteria/AddressByCriteriaFilter.service";
import {getDurationOnSiteFilter} from "app/features/filters/badges-and-selectors/duration-on-site/durationOnSite.service";
import {getTruckerFilter} from "app/features/filters/badges-and-selectors/fleet/trucker/truckerFilter.service";
import {getCustomerFilter} from "app/features/filters/badges-and-selectors/invoice/customer/customerFilter";
import {getParentShipperFilter} from "app/features/filters/badges-and-selectors/shipper/ParentShipperFilter";
import {getShipperFilter} from "app/features/filters/badges-and-selectors/shipper/shipperFilter.service";
import {getSubcontractedCarrierFilter} from "app/features/filters/badges-and-selectors/subcontracting/SubcontractedCarrier";
import {getSubcontractedTransportsFilter} from "app/features/filters/badges-and-selectors/subcontracting/SubcontractedTransports";
import {getHasDangerousGoodsFilter} from "app/features/filters/badges-and-selectors/transport/has-dangerous-goods/hasDangerousGoodsFilter";
import {getTransportArchivedFilter} from "app/features/filters/badges-and-selectors/transport-archived/transportArchivedFilter.service";
import {getTransportCreatorFilter} from "app/features/filters/badges-and-selectors/transport-creator/transportCreatorFilter.service";
import {getTransportAlertFilterBadges} from "app/features/filters/badges-and-selectors/transport-custom/transportAlertFilterBadges.service";
import {getTransportDashboardFilterBadges} from "app/features/filters/badges-and-selectors/transport-custom/transportDashboardFilterBadges.service";
import {getTransportTypesFilterBadges} from "app/features/filters/badges-and-selectors/transport-custom/transportTypesFilterBadges.service";
import {getTransportDateRangeFilter} from "app/features/filters/badges-and-selectors/transport-date-range/transportDateRangeFilter.service";
import {getOrderStatusFilter} from "app/features/filters/badges-and-selectors/transport-statuses/orderStatusFilter.service";
import {getTransportInvoicingStatusFilter} from "app/features/filters/badges-and-selectors/transport-statuses/transportInvoicingStatusFilter.service";
import {getTransportStatusFilter} from "app/features/filters/badges-and-selectors/transport-statuses/transportStatusFilter.service";
import {getTransportKeysToIgnore} from "app/features/filters/deprecated/utils";
import {
    DEFAULT_TRANSPORTS_AND_ORDERS_SETTINGS,
    DEFAULT_TRANSPORTS_DASHBOARD_SETTINGS,
    DEFAULT_TRANSPORTS_SETTINGS,
} from "app/features/transport/transports-list/constant";
import {
    TranportsSettingsViewCategory,
    TransportsAndOrdersSettings,
    TransportsAndOrdersSettingsSchema,
    TransportsSettings,
    TransportsSettingsSchema,
} from "app/features/transport/transports-list/transportsSettingsView.types";
import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";

type FilteringProps = {
    currentQuery: TransportsScreenQuery;
    updateQuery: (newQuery: Partial<TransportsScreenQuery>, method?: "push" | "replace") => void;
    selectedViewPk?: number | undefined;
    updateSelectedView?: (viewPk: number | undefined) => void;
};

export function TransportsFilteringBar({
    currentQuery,
    updateQuery,
    selectedViewPk,
    updateSelectedView,
}: FilteringProps) {
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasImproveSubcontractingEnabled = useFeatureFlag("improveSubcontracting");
    const {category, schema, DEFAULT_QUERY} = getTransportFiltersDataType(currentQuery.tab);

    const filters = useMemo(() => {
        const keysToIgnore = getTransportKeysToIgnore(currentQuery.tab);

        return [
            getTransportDateRangeFilter(),
            getAddressFilter(true),
            getAddressByCriteriaFilter(),
            getDurationOnSiteFilter(),

            ...(category !== "orders" ? [getCustomerFilter("debtor__in")] : []),

            getShipperFilter(),
            ...(category === "orders" && hasImproveSubcontractingEnabled
                ? [getParentShipperFilter()]
                : []),

            getTruckerFilter(),

            ...(currentQuery.tab !== "orders_to_send_to_carrier"
                ? [
                      getCarrierFilter({
                          isOrderTab: category === "orders",
                      }),
                  ]
                : []),

            ...(category !== "orders" && hasImproveSubcontractingEnabled
                ? [getSubcontractedTransportsFilter(), getSubcontractedCarrierFilter()]
                : []),

            getTransportInvoicingStatusFilter(
                hasInvoiceEntityEnabled,
                keysToIgnore.includes("invoicing_status__in")
            ),
            getTransportStatusFilter(keysToIgnore.includes("transport_status__in")),
            getOrderStatusFilter(keysToIgnore.includes("order_status__in")),
            ...(category === "transports_and_orders" ? [getTransportArchivedFilter()] : []),

            getTransportCreatorFilter(),
            getTagFilter(),
            getHasDangerousGoodsFilter(),
            getTransportAlertFilterBadges(),
            getTransportDashboardFilterBadges(),
            getTransportTypesFilterBadges(),
        ];
    }, [category, currentQuery.tab, hasInvoiceEntityEnabled, hasImproveSubcontractingEnabled]);

    const viewsParams: FilteringBarProps<
        TransportsAndOrdersSettings | TransportsSettings
    >["viewsParams"] = updateSelectedView
        ? {
              selectedViewPk: selectedViewPk,
              setSelectedViewPk: updateSelectedView,
              viewCategory: category,
              addEnabled: true,
              deleteEnabled: true,
          }
        : undefined;

    return (
        <Box pb={2} flex={1}>
            <FilteringBar<TransportsAndOrdersSettings | TransportsSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={DEFAULT_QUERY}
                parseQuery={schema.parse}
                viewsParams={viewsParams}
                size="large"
                data-testid="transports-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("screens.transports.searchBarPlaceholder")}
            />
        </Box>
    );
}

export function getTransportFiltersDataType(tab: TabName) {
    let category: TranportsSettingsViewCategory;
    let schema: typeof TransportsAndOrdersSettingsSchema | typeof TransportsSettingsSchema;
    let DEFAULT_QUERY: TransportsAndOrdersSettings | TransportsSettings;
    if (tab === "dashboard") {
        category = "transports_dashboard";
        schema = TransportsAndOrdersSettingsSchema;
        DEFAULT_QUERY = DEFAULT_TRANSPORTS_DASHBOARD_SETTINGS;
    } else if ((TRANSPORTS_BUSINESS_STATUSES as Readonly<string[]>).includes(tab)) {
        category = "transports";
        schema = TransportsSettingsSchema;

        DEFAULT_QUERY = DEFAULT_TRANSPORTS_SETTINGS;
    } else if ((ORDERS_BUSINESS_STATUSES as Readonly<string[]>).includes(tab)) {
        category = "orders";
        schema = TransportsSettingsSchema;
        DEFAULT_QUERY = DEFAULT_TRANSPORTS_SETTINGS;
    } else {
        category = "transports_and_orders";
        schema = TransportsAndOrdersSettingsSchema;
        DEFAULT_QUERY = DEFAULT_TRANSPORTS_AND_ORDERS_SETTINGS;
    }
    return {
        category,
        schema,
        DEFAULT_QUERY,
    };
}
