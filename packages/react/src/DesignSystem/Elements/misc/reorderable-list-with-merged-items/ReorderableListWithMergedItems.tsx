import {BadgeColorVariant, Box, ReorderEditableItemList} from "@dashdoc/web-ui";
import React, {ReactNode, useMemo, useState} from "react";

import {MergedItemSection} from "./MergedItem";
import {
    ExtendedAndMergedItem,
    ExtendedItem,
    MergedItem,
    mergeItemsService,
} from "./mergeItems.service";

type Props<TItem> = {
    items: TItem[];
    getItemId: (item: TItem) => string;
    areItemsSimilar: (itemA: TItem, itemB: TItem) => boolean;
    onReorderItems: (movedItems: TItem[], oldIndex: number, newIndex: number) => void;
    getOrderError: (item: TItem, beforeItems: TItem[], afterItems: TItem[]) => string | null;
    getItemContent: (
        item: TItem,
        index: number | "similar",
        isInsideGroup: boolean,
        isLastItemOfGroup: boolean
    ) => ReactNode;
    getMergedItemContent: (
        items: TItem[],
        index: number,
        isCollapsed: boolean,
        onExpandCollapse?: () => void
    ) => ReactNode;
    isItemDraggable?: (item: TItem) => boolean;
    // display options
    collapsedByDefault?: boolean;
    showCollapsedIcon?: boolean;
    displayMode?: "table" | "list";
};

export const itemsBadgeVariants: Array<BadgeColorVariant> = [
    "blue",
    "success",
    "warning",
    "error",
    "purple",
    "turquoise",
];

export function ReorderableListWithMergedItems<TItem>({
    items,
    getItemId,
    areItemsSimilar,
    onReorderItems,
    getOrderError,
    getItemContent,
    getMergedItemContent,
    isItemDraggable,
    collapsedByDefault,
    showCollapsedIcon,
    displayMode = "list",
}: Props<TItem>) {
    const itemsWithFakedMerged = useMemo(
        () =>
            mergeItemsService.getItemsWithFakedMerged(
                mergeItemsService.getItemsGroupedBySimilar(items, areItemsSimilar),
                getItemId
            ),
        [areItemsSimilar, getItemId, items]
    );
    const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>(
        collapsedByDefault
            ? itemsWithFakedMerged.reduce((result: Record<string, boolean>, item) => {
                  if (item.fakeMerged) {
                      result[getItemId(item.items[0])] = true;
                  }
                  return result;
              }, {})
            : {}
    );

    const isItemCollapsed = (item: ExtendedAndMergedItem<TItem>) => {
        if (item.fakeMerged) {
            return collapsedItems[getItemId(item.items[0])];
        }
        return collapsedItems[(item as ExtendedItem<TItem>).similarItemsIds[0]];
    };
    const setCollapsedSimilarGroup = (mergedItem: MergedItem<TItem>, value?: boolean) => {
        const firstItemId = getItemId(mergedItem.items[0]);
        setCollapsedItems((prev) => ({
            ...prev,
            [firstItemId]: value === undefined ? !prev[firstItemId] : value,
        }));
    };

    const getItemContentToDisplay = (item: ExtendedAndMergedItem<TItem>, index: number) => {
        const itemIndex = mergeItemsService.getItemGlobalIndex(index, item, itemsWithFakedMerged);

        if (item.fakeMerged) {
            return (
                <MergedItemSection
                    isCollapsed={isItemCollapsed(item)}
                    setCollapsed={() => setCollapsedSimilarGroup(item)}
                    showCollapsedIcon={showCollapsedIcon}
                >
                    {getMergedItemContent(
                        item.items,
                        itemIndex as number,
                        isItemCollapsed(item),
                        () => setCollapsedSimilarGroup(item)
                    )}
                </MergedItemSection>
            );
        }
        const similarItems = (item as ExtendedItem<TItem>).similarItemsIds;
        const isLastItemOfGroup = similarItems[similarItems.length - 1] == getItemId(item);
        return getItemContent(item, itemIndex, similarItems.length > 1, isLastItemOfGroup);
    };

    const getItemContentUnder = (item: ExtendedAndMergedItem<TItem>) => {
        if (displayMode === "table") {
            return <Box mb={-3} />;
        }
        if (item.fakeMerged) {
            return !isItemCollapsed(item) ? <Box mb={-3} /> : null;
        }
        const similarItems = (item as ExtendedItem<TItem>).similarItemsIds;
        const isLastItemOfGroup = similarItems[similarItems.length - 1] == getItemId(item);
        return !isLastItemOfGroup && !isItemCollapsed(item) ? <Box mb={-3} /> : null;
    };

    const onBeforeDragStart = (sourceIndex: number) => {
        const draggedItem = itemsWithFakedMerged[sourceIndex];
        if (draggedItem.fakeMerged) {
            setCollapsedSimilarGroup(draggedItem, true);
        }
    };

    const reorderItems = (
        newList: Array<ExtendedAndMergedItem<TItem>>,
        movedItem: ExtendedAndMergedItem<TItem>,
        newIndex: number,
        oldIndex: number
    ) => {
        // exclude fake items in the computed index send to API
        let numberOfFakeItemsToIgnore = newList
            .slice(0, newIndex)
            .filter((item) => item.fakeMerged).length;

        if (newIndex > oldIndex && movedItem.fakeMerged) {
            // we need to count moved fakeMerged item in numberOfFakeItemsToIgnore if it is moved after other items
            numberOfFakeItemsToIgnore += 1;
        }

        // Fix when drop just after a fakedMerge collapsed item to be sure it is drop after the all group of similar items
        if (newIndex > 0) {
            const previousItem = newList[newIndex - 1];
            if (previousItem.fakeMerged && isItemCollapsed(previousItem)) {
                newIndex = newIndex + previousItem.items.length;
            }
        }
        newIndex = newIndex - numberOfFakeItemsToIgnore;

        oldIndex =
            oldIndex -
            itemsWithFakedMerged
                .filter((item) => item)
                .slice(0, oldIndex)
                .filter((item) => item.fakeMerged).length;

        if (movedItem.fakeMerged) {
            // if move a fake merged (resume of similar items),
            // we need to move all similar items and keep same order
            // if we move after other items: we start to move items from the 1st
            // if we move before other items: we start to move items from the last
            onReorderItems(
                movedItem.items,
                oldIndex,
                oldIndex < newIndex ? newIndex - movedItem.items.length + 1 : newIndex
            );
        } else {
            onReorderItems([movedItem], oldIndex, newIndex);
        }
    };

    const getDropPositionError = (
        sourceIndex: number,
        destinationIndex: number
    ): string | null => {
        const movedItem = itemsWithFakedMerged[sourceIndex];
        const movedItems = movedItem.fakeMerged ? movedItem.items : [movedItem];
        let beforeItems: TItem[] = [];
        let afterItems: TItem[] = [];
        if (destinationIndex > sourceIndex) {
            beforeItems = [...itemsWithFakedMerged]
                .slice(sourceIndex + movedItems.length - 1, destinationIndex + 1)
                .filter((item) => !item.fakeMerged) as TItem[];
        } else {
            afterItems = [...itemsWithFakedMerged]
                .slice(destinationIndex, sourceIndex)
                .filter((item) => !item.fakeMerged) as TItem[];
        }

        return (
            movedItems
                .map((item) => getOrderError(item, beforeItems, afterItems))
                .find((err) => err !== null) ?? null
        );
    };

    const getDraggingItemWarning = (
        index: number,
        draggingState?: {
            sourceIndex?: number;
            destinationIndex?: number;
        }
    ) => {
        if (
            draggingState?.sourceIndex != null &&
            draggingState?.destinationIndex != null &&
            index === draggingState.sourceIndex
        ) {
            return getDropPositionError(draggingState.sourceIndex, draggingState.destinationIndex);
        }
        return null;
    };

    return (
        <ReorderEditableItemList
            items={[...itemsWithFakedMerged]}
            isItemHidden={(item) => !item.fakeMerged && isItemCollapsed(item)}
            getItemContentToDisplay={getItemContentToDisplay}
            getItemContentUnder={getItemContentUnder}
            getItemWarning={getDraggingItemWarning}
            getDraggableItemId={getDraggableItemId}
            droppableId={`droppable-items`}
            onBeforeDragStart={onBeforeDragStart}
            onReorderItems={reorderItems}
            getDropPositionError={getDropPositionError}
            canDeleteItem={() => false}
            itemContainerStyle={
                displayMode === "table" ? tableDisplayModeContainerStyle : undefined
            }
            isItemDraggable={isItemDraggable}
        />
    );

    function getDraggableItemId(item: ExtendedAndMergedItem<TItem>) {
        return item.fakeMerged ? item.items.map((i) => getItemId(i)).join("-") : getItemId(item);
    }
}

const tableDisplayModeContainerStyle = {
    border: "none",
};
