import {Item, ItemGroup} from "@dashdoc/web-ui";

import {ColumnsSpec} from "../../types";

/**
 * Retrieve the items in the columnsSpec according to the column array
 */
function retrieveItems(columnsSpec: ColumnsSpec, columns: string[]): Item[] {
    const allItems = getFlatItems(columnsSpec);
    const columnItems = columns
        .map((id) => allItems.find((item) => item.id === id))
        .filter((item) => item !== undefined) as Item[];
    return columnItems;
}

/**
 * Get a filtered array of ItemGroup from the columnsSpec.
 */
function getItemGroups(columnsSpec: ColumnsSpec, filter: string): ItemGroup[] {
    return Object.entries(columnsSpec.all_columns)
        .map(([groupLabel, groupContents], index) => {
            const groupItems = groupContents
                .map(([id, label]) => ({
                    id,
                    label,
                }))
                .filter((item) => item.label.toLowerCase().includes(filter.toLowerCase()));
            return {
                id: `group-${index}`,
                label: groupLabel,
                items: groupItems,
            };
        })
        .filter((group) => group.items.length > 0);
}

/**
 * Get a flat array of Item from the columnsSpec.
 */
function getFlatItems(columnsSpec: ColumnsSpec): Item[] {
    const allItems: Item[] = Object.entries(columnsSpec.all_columns).flatMap(
        ([, groupContents]) => {
            return groupContents.map(([id, label]) => ({
                id,
                label,
            }));
        }
    );
    return allItems;
}

export const itemService = {
    retrieveItems,
    getItemGroups,
    getFlatItems,
};
