import {Box, Flex, BoxProps, LoadingWheel} from "@dashdoc/web-ui";
import React from "react";

import {Item, ItemGroup} from "../types";

import {FlatItemList, ItemSelectionDisplayMode} from "./components/FlatItemList";
import {GroupedItemList} from "./components/GroupedItemList";
import {useItemsScroll} from "./useItemsScroll";

export type SyncItemsSelectorProps = {
    items: Item[] | ItemGroup[]; // selectable items

    values: string[]; // ids of selected items
    onChange: (newValues: string[]) => void; // update current selection
    displayMode?: ItemSelectionDisplayMode;
    listContainerStyle?: BoxProps;
};

export type AsyncItemsSelectorProps = SyncItemsSelectorProps & {
    hasMore: boolean; // can load more items
    loadNext: () => void; // asking for load
    isLoading: boolean;
};

export type ItemsSelectorProps = SyncItemsSelectorProps | AsyncItemsSelectorProps;

export function ItemsSelector(props: ItemsSelectorProps) {
    const {values, items, onChange, displayMode = "checkbox", listContainerStyle} = props;

    // Async behavior
    const ref = React.useRef<HTMLDivElement>(null);
    const onScroll = useItemsScroll(onEndReached);
    let isLoadingItems = false;
    let hasMoreItems = false;
    let loadNextItems: null | (() => void) = null;
    if ("loadNext" in props) {
        const {hasMore, loadNext, isLoading} = props;
        hasMoreItems = hasMore;
        isLoadingItems = isLoading;
        loadNextItems = loadNext;
    }
    return (
        <Box ref={ref} onScroll={onScroll} overflowY={"auto"} {...listContainerStyle}>
            {isGrouped() ? (
                <GroupedItemList
                    items={items as ItemGroup[]}
                    values={values}
                    onClick={handleClick}
                    displayMode={displayMode}
                />
            ) : (
                <FlatItemList
                    items={items as Item[]}
                    values={values}
                    onClick={handleClick}
                    displayMode={displayMode}
                />
            )}
            {isLoadingItems && (
                <Flex justifyContent="center">
                    <LoadingWheel small data-testid="loading-items" />
                </Flex>
            )}
        </Box>
    );

    function handleClick(id: string) {
        if (values.includes(id)) {
            onChange(values.filter((value) => value !== id));
        } else {
            onChange([...values, id]);
        }
    }

    function isGrouped(): boolean {
        return items && items[0] && "items" in props.items[0];
    }

    function onEndReached() {
        if (hasMoreItems) {
            loadNextItems?.();
        }
    }
}
