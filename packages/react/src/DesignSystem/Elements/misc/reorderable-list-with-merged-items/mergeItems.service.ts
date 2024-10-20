export type ExtendedItem<TItem> = TItem & {similarItemsIds: string[]; fakeMerged: false};
export type MergedItem<TItem> = {items: TItem[]; fakeMerged: true};
export type ExtendedAndMergedItem<TItem> = ExtendedItem<TItem> | MergedItem<TItem>;

function getItemsGroupedBySimilar<TItem>(
    items: TItem[],
    areItemsSimilar: (itemA: TItem, itemB: TItem) => boolean
): TItem[][] {
    return items.reduce((acc: TItem[][], item: TItem) => {
        if (acc.length && areItemsSimilar(acc[acc.length - 1][0], item)) {
            acc[acc.length - 1].push(item);
        } else {
            acc.push([item]);
        }
        return acc;
    }, []);
}

function getItemsWithFakedMerged<TItem>(
    groupBySimilarItems: TItem[][],
    getItemId: (item: TItem) => string
): ExtendedAndMergedItem<TItem>[] {
    // return a list of items  where we included a fake merged item
    // at the beginning of similar items
    // eg: L1, L2, U1, U2 where L1 and L2 are similars becomes Lmerged, L1, L2, U1, U2
    return groupBySimilarItems.reduce((acc: ExtendedAndMergedItem<TItem>[], items: TItem[]) => {
        if (items.length > 1) {
            const mergedItem: MergedItem<TItem> = {
                fakeMerged: true,
                items: items,
            };
            acc.push(mergedItem);
        }
        const extendedItems: ExtendedItem<TItem>[] = items.map((item) => ({
            ...item,
            fakeMerged: false,
            similarItemsIds: items.map((item) => getItemId(item)),
        }));
        acc.push(...extendedItems);

        return acc;
    }, []);
}

function getItemGlobalIndex<TItem>(
    index: number,
    item: ExtendedAndMergedItem<TItem>,
    itemsWithFakeMergedSimilar: ExtendedAndMergedItem<TItem>[]
): number | "similar" {
    if (!item.fakeMerged && item.similarItemsIds.length > 1) {
        return "similar";
    }
    let numberOfSimilarActivitiesBefore = itemsWithFakeMergedSimilar
        .slice(0, index)
        .filter((item) => !item.fakeMerged && item.similarItemsIds.length > 1).length;
    return index - numberOfSimilarActivitiesBefore;
}

export const mergeItemsService = {
    getItemsGroupedBySimilar,
    getItemsWithFakedMerged,
    getItemGlobalIndex,
};
