import {CompanyName, FilteringHeader, FilteringPaginatedListSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {APIVersion, Company} from "dashdoc-utils";
import React, {useCallback} from "react";

import {SubcontractedCarrierQuery} from "app/features/filters/badges-and-selectors/subcontracting/SubcontractedCarrier";

type FetchParams = {
    url?: string;
    searchQueryKey?: string;
    apiVersion?: APIVersion;
};

type SubcontractedCarrierSelectorProps = {
    query: SubcontractedCarrierQuery;
    updateQuery: (query: SubcontractedCarrierQuery) => void;
    fetchParams?: FetchParams;
};

export function SubcontractedCarrierSelector({
    query,
    updateQuery,
    fetchParams,
}: SubcontractedCarrierSelectorProps) {
    const formatItemLabel = useCallback(
        (company: Company, searchText: string) => (
            <CompanyName company={company} highlight={[searchText]} />
        ),
        []
    );
    const {url = "deliveries/carriers/", searchQueryKey = "text", apiVersion} = fetchParams ?? {};
    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("charteredCarrier.title")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<Company>
                fetchItemsUrl={url}
                searchQueryKey={searchQueryKey}
                apiVersion={apiVersion}
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query.subcontracted_carrier__in ?? []}
                onChange={(value) => updateQuery({subcontracted_carrier__in: value})}
            />
        </>
    );
}
