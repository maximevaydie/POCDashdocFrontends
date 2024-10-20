import {CompanyName} from "@dashdoc/web-common";
import {FilteringPaginatedListSelector} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {PartialCompany} from "dashdoc-utils";
import React, {useCallback} from "react";

import {TransportCreatorsQuery} from "./transportCreatorFilter.types";

type TransportCreatorSelectorProps = {
    query: TransportCreatorsQuery;
    updateQuery: (query: TransportCreatorsQuery) => void;
};

export function TransportCreatorSelector({query, updateQuery}: TransportCreatorSelectorProps) {
    const formatItemLabel = useCallback(
        (company: PartialCompany, searchText: string) => (
            <CompanyName company={company} highlight={[searchText]} />
        ),
        []
    );

    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("transportsColumns.createdBy")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<PartialCompany>
                fetchItemsUrl="deliveries/creators/"
                searchQueryKey="text"
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query.creator__in ?? []}
                onChange={(value) => updateQuery({creator__in: value})}
            />
        </>
    );
}
