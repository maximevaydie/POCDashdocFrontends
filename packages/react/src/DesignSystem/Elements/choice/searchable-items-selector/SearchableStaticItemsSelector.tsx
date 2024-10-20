import React, {ReactNode, useMemo, useState} from "react";

import {SearchableItemsSelector, SearchableItemsSelectorProps} from "./SearchableItemsSelector";

type Props<TItem> = Omit<
    SearchableItemsSelectorProps<TItem>,
    "onSearchTextChange" | "getItemLabel"
> & {
    searchTextMatchItem?: (item: TItem, searchText: string) => boolean;
    getItemLabel: (item: TItem, searchText: string) => string | ReactNode;
};
export function SearchableStaticItemsSelector<TItem>({
    items,
    searchTextMatchItem,
    getItemLabel,
    ...props
}: Props<TItem>) {
    const [searchText, setSearchText] = useState("");

    const isSearchable = searchTextMatchItem !== undefined;

    const filteredItems = useMemo(
        () =>
            isSearchable
                ? items.filter((item) => !searchText || searchTextMatchItem?.(item, searchText))
                : items,
        [isSearchable, items, searchText, searchTextMatchItem]
    );

    return (
        <SearchableItemsSelector
            items={filteredItems}
            searchText={searchText}
            onSearchTextChange={isSearchable ? setSearchText : undefined}
            getItemLabel={getItemLabel}
            {...props}
        />
    );
}
