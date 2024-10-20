import {t} from "@dashdoc/web-core";
import {Box, ItemsSelector, BoxProps, Text} from "@dashdoc/web-ui";
import React, {ReactNode, useMemo} from "react";
import Highlighter from "react-highlight-words";

import {ItemSelectionDisplayMode} from "../items-selector/components/FlatItemList";

import {SearchTextInput} from "./components/SearchTextInput";
import {SelectUnSelectAllItems} from "./components/SelectAndUnselectAllItems";

export type SearchableItemsSelectorProps<TItem> = {
    items: TItem[];
    getItemId: (item: TItem) => string;
    getItemLabel: (item: TItem, searchText: string) => string | ReactNode;

    values: string[];
    onChange: (newValues: string[]) => void;

    searchText?: string;
    onSearchTextChange?: (value: string) => void;
    enableSelectAll: boolean;
    displayMode?: ItemSelectionDisplayMode;
    listContainerStyle?: BoxProps;
};
type SearchableItemsSelectorAsyncProps<TItem> = SearchableItemsSelectorProps<TItem> & {
    hasMore: boolean;
    isLoading: boolean;
    loadAll: () => void;
    loadNext: () => void; // asking for load
};

export function SearchableItemsSelector<TItem>({
    items,
    getItemId,
    getItemLabel,
    values,
    onChange,
    searchText = "",
    onSearchTextChange,
    enableSelectAll,
    displayMode,
    listContainerStyle,
    ...asyncProps
}: SearchableItemsSelectorProps<TItem> | SearchableItemsSelectorAsyncProps<TItem>) {
    const formattedItems = useMemo(
        () =>
            items.map((item) => {
                let label = getItemLabel(item, searchText);
                if (typeof label === "string") {
                    label = <Highlighter searchWords={[searchText]} textToHighlight={label} />;
                }

                return {
                    id: getItemId(item),
                    label,
                };
            }),
        [getItemId, getItemLabel, items, searchText]
    );
    let selectAllAsyncProps = {};
    let itemSelectorAsyncProps = {};
    let isLoadingItems = false;
    if ("hasMore" in asyncProps) {
        const {hasMore, loadAll, loadNext, isLoading} = asyncProps;
        selectAllAsyncProps = {loadAll, hasMore};
        itemSelectorAsyncProps = {loadNext, hasMore, isLoading};
        isLoadingItems = isLoading;
    }

    return (
        <Box px={3} py={1}>
            {onSearchTextChange && (
                <SearchTextInput initialValue={searchText} onChange={onSearchTextChange} />
            )}
            {enableSelectAll && (
                <SelectUnSelectAllItems
                    items={formattedItems}
                    values={values}
                    onChange={onChange}
                    {...selectAllAsyncProps}
                />
            )}
            <ItemsSelector
                items={formattedItems}
                values={values}
                onChange={onChange}
                displayMode={displayMode}
                listContainerStyle={listContainerStyle}
                {...itemSelectorAsyncProps}
            />
            {formattedItems.length === 0 && !isLoadingItems && (
                <Text color="grey.dark" textAlign="center" mt={1}>
                    {t("common.noResultFound")}
                </Text>
            )}
        </Box>
    );
}
