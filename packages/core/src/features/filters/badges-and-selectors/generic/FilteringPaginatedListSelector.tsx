import {SearchableItemsSelector} from "@dashdoc/web-ui";
import {APIVersion} from "dashdoc-utils";
import React, {ReactNode, useState} from "react";

import {usePaginatedFetch} from "../../../../hooks/usePaginatedFetch";

type FilteringListSelectorPaginatedFetchProps<TItem> = {
    fetchItemsUrl: string;
    apiVersion?: APIVersion;
    getItemId: (item: TItem) => string;
    getItemLabel: (item: TItem, searchText: string) => string | ReactNode;
    additionalQueryParams?: Record<string, any>;

    values: string[];
    onChange: (newValues: string[]) => void;

    searchQueryKey?: string;
    enableSelectAll?: boolean;
    dataTestId?: string;
};
export function FilteringPaginatedListSelector<TItem>({
    fetchItemsUrl,
    apiVersion = "v4",
    additionalQueryParams = {},
    searchQueryKey,
    getItemId,
    getItemLabel,
    values,
    onChange,
    enableSelectAll = true,
}: FilteringListSelectorPaginatedFetchProps<TItem>) {
    const [searchText, setSearchText] = useState("");
    const searchQuery = searchQueryKey ? {[searchQueryKey]: searchText} : {};

    const {items, hasNext, loadNext, loadAll, isLoading} = usePaginatedFetch<TItem>(
        fetchItemsUrl,
        {
            ...additionalQueryParams,
            ...searchQuery,
        },
        {apiVersion}
    );

    return (
        <SearchableItemsSelector
            items={items}
            getItemId={getItemId}
            getItemLabel={getItemLabel}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            values={values}
            onChange={onChange}
            enableSelectAll={enableSelectAll}
            hasMore={hasNext}
            loadAll={loadAll}
            loadNext={loadNext}
            isLoading={isLoading}
            listContainerStyle={{maxHeight: "300px"}}
        />
    );
}
