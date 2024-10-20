import {CompanyName} from "@dashdoc/web-common";
import {FilteringPaginatedListSelector} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {PartialCompany} from "dashdoc-utils";
import React, {useCallback} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";

import {ShippersQuery} from "./shipperFilter.types";

type Props = {
    query: ShippersQuery;
    updateQuery: (query: ShippersQuery) => void;
};

export function ShipperSelector({query, updateQuery}: Props) {
    const {extendedView} = useExtendedView();

    const formatItemLabel = useCallback(
        (company: PartialCompany, searchText: string) => (
            <Flex alignItems="center">
                <CompanyName company={company} highlight={[searchText]} />
            </Flex>
        ),
        []
    );

    return (
        <>
            <FilteringHeader dataTypeLabel={t("common.shipper")} conditionLabel={t("filter.in")} />
            <FilteringPaginatedListSelector<PartialCompany>
                fetchItemsUrl="deliveries/shippers/"
                additionalQueryParams={{extended_view: extendedView}}
                searchQueryKey="text"
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query.shipper__in ?? []}
                onChange={(value) => updateQuery({shipper__in: value})}
            />
        </>
    );
}
