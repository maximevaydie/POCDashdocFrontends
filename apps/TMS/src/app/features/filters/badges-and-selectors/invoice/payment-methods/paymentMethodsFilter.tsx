import {
    FilterData,
    FilteringHeader,
    FilteringListBadge,
    FilteringPaginatedListSelector,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import React, {useCallback} from "react";
import Highlighter from "react-highlight-words";

import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

export type PaymentMethodsQuery = {
    payment_methods?: Array<string>;
};

export function getPaymentMethodsFilter(ignore = false): FilterData<PaymentMethodsQuery> {
    return {
        key: "payment-methods",
        testId: "payment-methods",
        selector: ignore
            ? null
            : {
                  label: t("invoice.paymentMethod"),
                  icon: "billing",
                  getFilterSelector: (query, updateQuery) => (
                      <PaymentMethodsSelector query={query} updateQuery={updateQuery} />
                  ),
              },
        getBadges: (query, updateQuery) => [
            {
                count: query["payment_methods"]?.length ?? 0,
                badge: (
                    <FilteringListBadge
                        ignore={ignore}
                        queryKey="payment_methods"
                        query={query}
                        updateQuery={updateQuery}
                        getLabel={(count) => t("common.xPaymentMethods", {smart_count: count})}
                    />
                ),
            },
        ],
    };
}

type Props = {
    query: PaymentMethodsQuery;
    updateQuery: (query: Partial<PaymentMethodsQuery>) => void;
};

function PaymentMethodsSelector({query, updateQuery}: Props) {
    const formatItemLabel = useCallback(
        (paymentMethod: PaymentMethod, searchText: string) => (
            <Flex alignItems="center">
                {searchText ? (
                    <Highlighter
                        autoEscape={true}
                        searchWords={[searchText]}
                        textToHighlight={paymentMethod.name || ""}
                    />
                ) : (
                    paymentMethod.name
                )}
            </Flex>
        ),
        []
    );

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("invoice.paymentMethod")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<PaymentMethod>
                fetchItemsUrl="payment-methods/"
                apiVersion="web"
                searchQueryKey="search"
                getItemId={(paymentMethod) => paymentMethod.uid}
                getItemLabel={formatItemLabel}
                values={query.payment_methods ?? []}
                onChange={(value) => updateQuery({payment_methods: value})}
            />
        </>
    );
}
