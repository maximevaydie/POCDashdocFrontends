import {
    CompanyName,
    FilterData,
    FilteringHeader,
    FilteringListBadge,
    FilteringPaginatedListSelector,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {InvoiceableCompany} from "dashdoc-utils";
import React, {useCallback} from "react";

import {DebtorsQuery} from "app/features/filters/badges-and-selectors/shipper/shipperFilter.types";

export function getCustomerFilter(
    key: keyof DebtorsQuery = "customer__in"
): FilterData<DebtorsQuery> {
    return {
        key: "customer",
        testId: "customer",
        selector: {
            label: t("common.customerToInvoice"),
            icon: "instructions",
            getFilterSelector: (query, updateQuery) => (
                <DebtorSelector query={query} updateQuery={updateQuery} queryKey={key} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query[key]?.length ?? 0,
                badge: (
                    <FilteringListBadge
                        queryKey={key}
                        query={query}
                        updateQuery={updateQuery}
                        getLabel={(count) => t("common.customersToInvoice", {smart_count: count})}
                    />
                ),
            },
        ],
    };
}

type Props = {
    query: DebtorsQuery;
    updateQuery: (query: Partial<DebtorsQuery>) => void;
    queryKey: keyof DebtorsQuery;
};

function DebtorSelector({query, updateQuery, queryKey}: Props) {
    const formatItemLabel = useCallback(
        (company: InvoiceableCompany, searchText: string) => (
            <Flex alignItems="center">
                <CompanyName company={company} highlight={[searchText]} />
            </Flex>
        ),
        []
    );

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("common.customerToInvoice")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<InvoiceableCompany>
                fetchItemsUrl="invoiceable-companies/"
                apiVersion="web"
                searchQueryKey="search"
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query[queryKey] ?? []}
                onChange={(value) => updateQuery({[queryKey]: value})}
            />
        </>
    );
}
