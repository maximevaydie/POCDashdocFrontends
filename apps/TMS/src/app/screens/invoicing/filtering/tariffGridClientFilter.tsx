import {
    CompanyName,
    FilterData,
    FilteringHeader,
    FilteringListBadge,
    FilteringPaginatedListSelector,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React, {useCallback} from "react";

import {TariffGridsFilteringClientQuery} from "app/screens/invoicing/filtering/tariffGridFiltering.types";

export function getClientFilter(): FilterData<TariffGridsFilteringClientQuery> {
    return {
        key: "client",
        testId: "client",
        selector: {
            label: t("tariffGrids.clientOrCarrier"),
            icon: "instructions",
            getFilterSelector: (query, updateQuery) => (
                <ClientSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query.client__in?.length ?? 0,
                badge: (
                    <FilteringListBadge
                        queryKey={"client__in"}
                        query={query}
                        updateQuery={updateQuery}
                        getLabel={(count) =>
                            t("tariffGrids.clientsOrCarriersFilter", {smart_count: count})
                        }
                        data-testid="badge-client"
                    />
                ),
            },
        ],
    };
}

type Props = {
    query: TariffGridsFilteringClientQuery;
    updateQuery: (query: Partial<TariffGridsFilteringClientQuery>) => void;
};

function ClientSelector({query, updateQuery}: Props) {
    const formatItemLabel = useCallback(
        (company: Company, searchText: string) => (
            <Flex alignItems="center">
                <CompanyName company={company} highlight={[searchText]} />
            </Flex>
        ),
        []
    );

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("tariffGrids.clientOrCarrier")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<Company>
                fetchItemsUrl="companies/"
                searchQueryKey="text"
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query.client__in ?? []}
                onChange={(value) => updateQuery({client__in: value})}
            />
        </>
    );
}
