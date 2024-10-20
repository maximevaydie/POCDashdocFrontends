import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    IconButton,
    Table,
    BaseColumnProps,
    BaseRowProps,
    TableProps,
    ColumnDirection,
} from "@dashdoc/web-ui";
import {ScrollableTableFixedHeader} from "@dashdoc/web-ui";
import React, {FunctionComponent, useMemo} from "react";

import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

import {entityService} from "../entity.service";
import {EntityItem, TableBehavior} from "../types";

import {DefaultCell} from "./default-cell";

type ListProps = {
    currentQuery: any;
    loadedItemsCount: number;
    totalCount: number;
    tableBehavior: TableBehavior;
    isLoading: boolean;
    allRowsSelected: boolean;
    selectedRows: Record<string, boolean>;
    items: EntityItem[];
    hasNextPage: any;
    onEndReached: () => void;
    onSelectRow: (item: any, selected: any) => void;
    onSelectAllVisibleRows: (selected: any) => void;
    onSelectAllRows: () => void;
    onDelete?: (items: EntityItem[]) => unknown;
    onClick: (item: EntityItem) => unknown;
    onOrderingChange?: (newOrdering: Record<string, ColumnDirection> | null) => void;
    ["data-testid"]: string;
};
export const List: FunctionComponent<ListProps & Partial<TableProps>> = ({
    currentQuery,
    loadedItemsCount,
    totalCount,
    tableBehavior,
    onDelete,
    onClick,
    items,
    ...props
}) => {
    const {getI18n, getRowCellContent, getColumns, getSortableColumns} = tableBehavior;

    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    let columns = getColumns();
    if (hasDashdocInvoicingEnabled) {
        columns = columns.filter((c) => c.name !== "invoicing_remote_id");
    } else {
        columns = columns.filter(
            (c) => c.name !== "account_code" && c.name !== "side_account_code"
        );
    }

    const getColumnWidth = ({width}: {width: string}) => {
        return width ? width : "auto";
    };
    const getRowCellIsClickable = (_: any, columnName: string) => {
        const columns = getColumns();
        const column = columns.find((column) => column.name === columnName);
        const isClickable = column?.clickable === undefined || column?.clickable === true;
        return isClickable;
    };
    const {
        allVisibleRowsSelectedMessage,
        allRowsSelectedMessage,
        selectAllRowsMessage,
        getDeleteConfirmationMessage,
    } = getI18n(loadedItemsCount, totalCount);
    const getRowTestId = (_: BaseRowProps, index: number) => `item-row-${index}`;

    const memoizedGetRowCellContent = useMemo(
        () => (row: any, columnName: string) => {
            const cellContent = getRowCellContent
                ? getRowCellContent(row, columnName, currentQuery)
                : null;
            if (cellContent) {
                return cellContent;
            } else {
                const defaultCell = React.createElement(DefaultCell, {
                    item: row as EntityItem,
                    columnName: columnName,
                    currentQuery,
                });
                return defaultCell;
            }
        },
        [getRowCellContent, currentQuery]
    );
    const rows = useMemo(() => items.map((item) => item as BaseRowProps), [items]);

    const selectedItems = useMemo(
        () =>
            items.filter((item) => {
                const key = entityService.getIdentifier(item)?.toString();
                return key && props.selectedRows[key];
            }),
        [items, props.selectedRows]
    );

    const listActionButtons = useMemo(() => {
        if (!onDelete) {
            return null;
        }
        if (selectedItems.length <= 0) {
            return null;
        }
        return (
            <IconButton
                name="bin"
                label={t("common.delete")}
                key="deleteItem"
                withConfirmation
                confirmationMessage={
                    getDeleteConfirmationMessage
                        ? getDeleteConfirmationMessage(selectedItems.length)
                        : t("components.confirmDeleteItem")
                }
                onClick={() => onDelete(selectedItems)}
                ml={2}
            />
        );
    }, [selectedItems, onDelete, getDeleteConfirmationMessage]);

    return (
        <>
            {listActionButtons && (
                <ScrollableTableFixedHeader>
                    <Flex justifyContent="space-between" mb={3}>
                        <Box />
                        <Box>{listActionButtons}</Box>
                    </Flex>
                </ScrollableTableFixedHeader>
            )}
            <Flex overflow="hidden" flexDirection="column">
                <Table
                    mt={3}
                    fontSize={1}
                    rows={rows}
                    withSelectableRows={true}
                    allVisibleRowsSelectedMessage={allVisibleRowsSelectedMessage}
                    allRowsSelectedMessage={allRowsSelectedMessage}
                    selectAllRowsMessage={selectAllRowsMessage}
                    // @ts-ignore
                    getRowId={(row) => entityService.getIdentifier(row)?.toString()}
                    onClickOnRow={onClick}
                    columns={columns as BaseColumnProps[]}
                    sortableColumns={getSortableColumns?.()}
                    getRowTestId={getRowTestId}
                    getColumnWidth={getColumnWidth}
                    getRowCellIsClickable={getRowCellIsClickable}
                    getRowCellContent={memoizedGetRowCellContent}
                    {...props}
                />
            </Flex>
        </>
    );
};
