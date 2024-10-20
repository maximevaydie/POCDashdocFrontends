import {useTimezone} from "@dashdoc/web-common";
import {useToggle} from "dashdoc-utils";
import {useCallback, useEffect} from "react";

import {selectRows} from "app/redux/actions/selections";
import {useDispatch, useSelector} from "app/redux/hooks";

import {entityService} from "../entity.service";
import {DataStoreBehavior, EntityItem} from "../types";

export default function useDataStore(dataStoreBehavior: DataStoreBehavior, currentQuery: any) {
    const {fetchAction, loadingSelector, model, modelSelector, selectionSelector} =
        dataStoreBehavior;

    const dispatch = useDispatch();
    const timezone = useTimezone();
    const isLoading: boolean = useSelector(loadingSelector);
    const {
        items = [] as EntityItem[],
        page: lastFetchedPage = 1,
        hasNextPage,
        totalCount: allItemsCount,
    } = useSelector(modelSelector);

    const [allRowsSelected, onSelectAllRows, onUnselectAllItems] = useToggle();

    const currentSelection = useSelector(selectionSelector);

    const selectedRows: Record<string, boolean> = currentSelection.reduce(
        (acc, pk) => {
            acc[pk] = true;
            return acc;
        },
        {} as Record<string, boolean>
    );

    // fetch first page of companies on mount and as soon as the query change
    useEffect(() => {
        dispatch(fetchAction(currentQuery, timezone, 1));
    }, [fetchAction, dispatch, timezone, currentQuery]);

    const fetchItems = useCallback(
        (query: any, page = 1) => {
            const action = fetchAction(query, timezone, page);
            dispatch(action);
        },
        [fetchAction, dispatch, timezone]
    );

    const onEndReached = useCallback(() => {
        if (hasNextPage) {
            fetchItems(currentQuery, lastFetchedPage + 1);
        }
    }, [hasNextPage, fetchItems, currentQuery, lastFetchedPage]);

    const onSelectRow = useCallback(
        (item: EntityItem, selected: boolean) => {
            const identifier = entityService.getIdentifier(item);
            // @ts-ignore
            dispatch(selectRows(selected, model, [identifier]));
            onUnselectAllItems();
        },
        [dispatch, onUnselectAllItems, model]
    );

    const onSelectAllVisibleRows = useCallback(
        (selected: boolean) => {
            dispatch(
                selectRows(
                    selected,
                    model,
                    items?.map((item: EntityItem) => {
                        const identifier = entityService.getIdentifier(item);
                        return identifier;
                    }) ?? []
                )
            );
            onUnselectAllItems();
        },
        [items, dispatch, onUnselectAllItems, model]
    );

    return {
        isLoading,
        allRowsSelected,
        selectedRows,
        items,
        hasNextPage,
        allItemsCount,
        loadedItemsCount: items.length,
        totalCount: allItemsCount,
        onEndReached,
        onSelectRow,
        onSelectAllVisibleRows,
        onSelectAllRows,
    };
}
