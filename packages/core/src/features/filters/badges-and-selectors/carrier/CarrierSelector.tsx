import {t} from "@dashdoc/web-core";
import {APIVersion, Company} from "dashdoc-utils";
import React, {useCallback} from "react";

import {CompanyName} from "../../../address-book/company/CompanyName";
import {FilteringPaginatedListSelector} from "../generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "../generic/FilteringSelectorHeader";

import {CarriersQuery} from "./carrierFilter.types";

type CarrierSelectorProps = {
    isOrderTab: boolean;
    query: CarriersQuery;
    updateQuery: (query: CarriersQuery) => void;
    fetchParams?: {
        url?: string;
        searchQueryKey?: string;
        apiVersion?: APIVersion;
    };
};

export function CarrierSelector({
    query,
    updateQuery,
    fetchParams,
    isOrderTab = false,
}: CarrierSelectorProps) {
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
                dataTypeLabel={isOrderTab ? t("charteredCarrier.title") : t("common.carrier")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<Company>
                fetchItemsUrl={url}
                searchQueryKey={searchQueryKey}
                apiVersion={apiVersion}
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query.carrier__in ?? []}
                onChange={(value) => updateQuery({carrier__in: value})}
            />
        </>
    );
}
