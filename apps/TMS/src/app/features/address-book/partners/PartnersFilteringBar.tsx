import {
    FilteringBar,
    FilteringBarProps,
} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {getDateRangeFilter} from "app/features/filters/badges-and-selectors/logistic-point/date/dateRangeFilter.service";
import {getInvitationStatusFilter} from "app/features/filters/badges-and-selectors/partner/invitation-status/invitationStatusFilter.service";
import {getInvoicingRemoteIdFilter} from "app/features/filters/badges-and-selectors/partner/invoicing-remote-id/invoicingRemotId.service";
import {getRoleFilter} from "app/features/filters/badges-and-selectors/partner/role/roleFilter.service";
import {getTradeNumberFilter} from "app/features/filters/badges-and-selectors/partner/trade-number/tradeNumberFilter.service";
import {getVatNumberFilter} from "app/features/filters/badges-and-selectors/partner/vat-number/vatNumberFilter.service";

import {RESET_PARTNER_SETTINGS} from "./constants";
import {
    PARTNER_VIEW_CATEGORY,
    PartnersScreenQuery,
    PartnersSettings,
    PartnersSettingsSchema,
} from "./types";

type FilteringProps = {
    currentQuery: PartnersScreenQuery;
    updateQuery: (newQuery: Partial<PartnersScreenQuery>, method?: "push" | "replace") => void;
    selectedViewPk: number | undefined;
    updateSelectedView: (viewPk: number | null | undefined) => void;
};

export function PartnersFilteringBar({
    currentQuery,
    updateQuery,
    selectedViewPk,
    updateSelectedView,
}: FilteringProps) {
    const filters = useMemo(() => {
        return [
            getRoleFilter(),
            getDateRangeFilter(),
            getVatNumberFilter(),
            getTradeNumberFilter(),
            getInvoicingRemoteIdFilter(),
            getInvitationStatusFilter(),
        ];
    }, []);

    const viewsParams: FilteringBarProps<PartnersSettings>["viewsParams"] = {
        selectedViewPk: selectedViewPk,
        setSelectedViewPk: updateSelectedView,
        viewCategory: PARTNER_VIEW_CATEGORY,
        addEnabled: true,
        deleteEnabled: true,
    };

    return (
        <Box pb={2} flex={1}>
            <FilteringBar<PartnersSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={RESET_PARTNER_SETTINGS}
                parseQuery={PartnersSettingsSchema.parse}
                viewsParams={viewsParams}
                size="large"
                data-testid="partner-filtering-bar"
                searchEnabled={true}
                searchPlaceholder={t("screens.transports.searchBarPlaceholder") /* TODO */}
            />
        </Box>
    );
}
