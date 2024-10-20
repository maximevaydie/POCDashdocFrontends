import {t} from "@dashdoc/web-core";
import {Tag} from "@dashdoc/web-ui";
import {Tag as TagData} from "dashdoc-utils";
import React, {useCallback} from "react";

import {FilteringPaginatedListSelector} from "../generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "../generic/FilteringSelectorHeader";

import type {TagsQuery} from "./tagFilter.types";

type Props = {
    query: TagsQuery;
    updateQuery: (query: TagsQuery) => void;
    activeQueryKey?: keyof TagsQuery;
    sortAndFilters?: {
        id__in?: string[];
    };
    hideHeader?: boolean;
};

export function TagSelector({
    query,
    updateQuery,
    activeQueryKey = "tags__in",
    sortAndFilters = {},
    hideHeader = false,
}: Props) {
    const formatItemLabel = useCallback((tag: TagData) => <Tag tag={tag} mb={2} />, []);

    return (
        <>
            {!hideHeader && (
                <FilteringHeader
                    dataTypeLabel={t("common.tags")}
                    conditionLabel={t("filter.in")}
                />
            )}
            <FilteringPaginatedListSelector<TagData>
                fetchItemsUrl="tags/"
                apiVersion="web"
                searchQueryKey="text"
                additionalQueryParams={{ordering: "name", ...sortAndFilters}}
                getItemId={(item) => `${item.pk}`}
                getItemLabel={formatItemLabel}
                values={query[activeQueryKey] ?? []}
                onChange={(value) => updateQuery({[activeQueryKey]: value})}
            />
        </>
    );
}
