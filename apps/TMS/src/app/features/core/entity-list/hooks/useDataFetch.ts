import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {useState} from "react";

import {entityService} from "../entity.service";
import {DataFetchBehavior, EntityItem} from "../types";

export function useDataFetching(dataFetchBehavior: DataFetchBehavior) {
    const {
        items = [],
        hasNext: hasNextPage,
        isLoading,
        totalCount,
        loadNext: onEndReached,
    } = usePaginatedFetch<EntityItem>(dataFetchBehavior.path, dataFetchBehavior.params);

    const [allRowsSelected, setAllRowsSelected] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

    const onSelectAllVisibleRows = (selected: boolean) => {
        setAllRowsSelected(false);
        const newSelectedItems = items.reduce((acc: Record<string, boolean>, item) => {
            const identifier = entityService.getIdentifier(item);
            if (identifier !== null) {
                acc[identifier] = selected;
                return acc;
            }
            return acc;
        }, {});
        setSelectedRows(newSelectedItems);
    };

    const onSelectRow = (item: EntityItem, selected: boolean) => {
        if (!selected) {
            setAllRowsSelected(false);
        }
        setSelectedRows((prev) => {
            const identifier = entityService.getIdentifier(item);
            let result = prev;
            if (identifier) {
                result = {...result, [identifier]: selected};
            }
            return result;
        });
    };

    return {
        isLoading,
        allRowsSelected,
        selectedRows,
        items,
        totalCount,
        loadedItemsCount: items.length,
        hasNextPage,
        onEndReached,
        onSelectRow,
        onSelectAllVisibleRows,
        onSelectAllRows: () => setAllRowsSelected(true),
    };
}
