import {useVirtualizer} from "@tanstack/react-virtual";
import {useToggle} from "dashdoc-utils";
import debounce from "lodash.debounce";
import isNil from "lodash.isnil";
import React, {
    ComponentType,
    FunctionComponent,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";

import {IconButton} from "../../button/IconButton";
import {SortCriteriaOption, SortValue} from "../../choice";
import {Checkbox} from "../../choice/Checkbox";
import {Box, BoxProps} from "../../layout/Box";
import {Card} from "../../layout/Card";
import {Flex} from "../../layout/Flex";

import {Column, ColumnCell, ColumnProps, BaseColumnProps} from "./Column";
import {FullWidthCell} from "./FullWidthCell";
import {ListEmptyComponent as DefaultListEmptyComponent} from "./ListEmptyComponent";
import {ListLoadingComponent as DefaultListLoadingComponent} from "./ListLoadingComponent";
import {EmptyRow, Row, BaseRowProps, RowProps} from "./Row";
import {SelectAllRowsButton, SelectAllRowsButtonProps} from "./SelectAllRowsButton";
import {SettingsModal, SettingsModalProps} from "./SettingsModal";

export function getDraggedStyle(isDropAnimating: boolean, style: any) {
    if (!isDropAnimating) {
        return style;
    }
    return {
        ...style,
        opacity: 0,
        transitionDuration: `0.001s`,
    };
}

export type TableProps<
    TSortCriterion extends string,
    TCustomColumn extends BaseColumnProps,
    TCustomRow extends BaseRowProps,
> = Omit<BoxProps, "rows"> & {
    columns: TCustomColumn[];
    rows: TCustomRow[];
    /**
     * To compute the height of the table, we need to know the height of each row.
     * On a virtualized table, we don't know the height of each row, so we need to estimate it to simulate the scroll layout.
     * @see https://tanstack.com/virtual/v3/docs/api/virtualizer
     */
    estimatedHeight: number;
    getColumnKey?: RowProps<TCustomColumn, TCustomRow>["getColumnKey"];
    getColumnName?: RowProps<TCustomColumn, TCustomRow>["getColumnName"];
    getColumnLabel?: ColumnProps<TCustomColumn>["getLabel"];
    getColumnWidth?: ColumnProps<TCustomColumn>["getWidth"];
    setColumnWidth?: (column: TCustomColumn, width: string) => void;
    getRowKey?: (row: TCustomRow, index: number) => string;
    getRowId?: (row: TCustomRow, index: number) => string;
    getRowTestId?: (row: TCustomRow, index: number) => string;
    getRowCellContent?: RowProps<TCustomColumn, TCustomRow>["getCellContent"];
    getRowCellIsClickable?: RowProps<TCustomColumn, TCustomRow>["getCellIsClickable"];
    isLoading?: boolean;
    ListLoadingComponent?: ComponentType<any>;
    ListEmptyComponent?: ComponentType<any>;
    withSelectableRows?: boolean;
    withDraggableRows?: boolean;
    selectedRows?: Record<string, boolean>;
    onSelectRow?: RowProps<TCustomColumn, TCustomRow>["onSelect"];
    onClickOnRow?: RowProps<TCustomColumn, TCustomRow>["onClick"];
    onHoverRow?: RowProps<TCustomColumn, TCustomRow>["onHover"];
    editingRowId?: string;
    onSelectAllVisibleRows?: (selected: boolean) => void;
    hasNextPage?: boolean;
    allRowsSelected?: SelectAllRowsButtonProps["allRowsSelected"];
    onSelectAllRows?: SelectAllRowsButtonProps["onSelectAllRows"];
    allVisibleRowsSelectedMessage?: SelectAllRowsButtonProps["allVisibleRowsSelectedMessage"];
    selectAllRowsMessage?: SelectAllRowsButtonProps["selectAllRowsMessage"];
    allRowsSelectedMessage?: SelectAllRowsButtonProps["allRowsSelectedMessage"];
    withSelectableColumns?: boolean;
    columnsSelectionModalTitle?: string;
    selectedColumnNames?: SettingsModalProps["selectedColumnNames"];
    onSelectColumns?: SettingsModalProps["onSelectColumns"];
    sortableColumns: Record<string, Array<SortCriteriaOption<TSortCriterion>>>;
    initialSort: SortValue<TSortCriterion> | null;
    initialSortCriteria?: Array<SortCriteriaOption<TSortCriterion>>;
    getRowSeparator?: (row: TCustomRow, previousRow: TCustomRow | undefined) => ReactNode;
    ordering?: Record<TSortCriterion, ColumnProps<TCustomColumn>["direction"]>;
    onOrderingChange?: (
        newOrdering: Record<TSortCriterion, ColumnProps<TCustomColumn>["direction"]> | null
    ) => void;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    // Override the default header based on column names
    overrideHeader?: ReactNode | null;
};
const defaultGetColumnKey = (c: BaseColumnProps, i: number) =>
    c.key || c.id || c.name || i.toString();
const defaultGetColumnName = (c: BaseColumnProps) => c.name;
const defaultGetColumnLabel = (c: BaseColumnProps) => c.label || c.getLabel?.();
const defaultGetColumnWidth = (c: BaseColumnProps) => c.width || "auto";
const defaultGetRowKey = (r: BaseRowProps, i: number) => r.key || r.id || i.toString();
const defaultGetRowId = (r: BaseRowProps, i: number) => r.id?.toString() || i.toString();
const defaultGetRowTestId = (r: BaseRowProps) => r.testId || "table-row";
const defaultGetRowCellContent = (r: BaseRowProps, columnName: string) => r[columnName];
const defaultGetRowCellIsClickable = () => true;

/** Experimental virtualized version of Table  */

export const VirtualizedTable = <
    TSortCriterion extends string = string,
    TCustomColumn extends BaseColumnProps = BaseColumnProps,
    TCustomRow extends BaseRowProps = BaseRowProps,
>(
    props: TableProps<TSortCriterion, TCustomColumn, TCustomRow>
): ReturnType<FunctionComponent<TableProps<TSortCriterion, TCustomColumn, TCustomRow>>> => {
    const {
        columns,
        rows,
        estimatedHeight,
        getColumnKey = defaultGetColumnKey,
        getColumnName = defaultGetColumnName,
        getColumnLabel = defaultGetColumnLabel,
        getColumnWidth = defaultGetColumnWidth,
        setColumnWidth,
        getRowKey = defaultGetRowKey,
        getRowId = defaultGetRowId,
        getRowTestId = defaultGetRowTestId,
        getRowCellContent = defaultGetRowCellContent,
        getRowCellIsClickable = defaultGetRowCellIsClickable,
        isLoading,
        ListLoadingComponent = DefaultListLoadingComponent,
        ListEmptyComponent = DefaultListEmptyComponent,
        withSelectableRows,
        withDraggableRows,
        selectedRows,
        onSelectRow,
        onClickOnRow,
        onHoverRow,
        editingRowId,
        onSelectAllVisibleRows,
        onSelectAllRows,
        allRowsSelected,
        hasNextPage,
        allVisibleRowsSelectedMessage,
        selectAllRowsMessage,
        allRowsSelectedMessage,
        withSelectableColumns,
        columnsSelectionModalTitle,
        selectedColumnNames,
        onSelectColumns,
        onEndReached,
        onEndReachedThreshold = 50,
        sortableColumns,
        ordering,
        onOrderingChange,
        overrideHeader,
        initialSort,
        initialSortCriteria,
        getRowSeparator,
        ...containerProps
    } = props;

    //#region values computed from props
    const filteredColumns = useMemo(
        () =>
            withSelectableColumns && selectedColumnNames
                ? (selectedColumnNames
                      .map((columnName) =>
                          columns.find((column) => getColumnName(column) === columnName)
                      )
                      .filter((c) => c != undefined) as TCustomColumn[])
                : columns,
        [columns, getColumnName, selectedColumnNames, withSelectableColumns]
    );

    const isEmpty = !rows.length;
    const allVisibleRowsSelected =
        !isEmpty && Object.values(selectedRows ?? {}).filter(Boolean).length === rows.length;
    //#endregion

    //#region handle select all rows
    const [isSelectAllRowsButtonVisible, displaySelectAllRowsButton, hideSelectAllRowsButton] =
        useToggle();

    useEffect(() => {
        if (withSelectableRows && allVisibleRowsSelected && hasNextPage) {
            displaySelectAllRowsButton();
        } else {
            hideSelectAllRowsButton();
        }
    }, [withSelectableRows, allVisibleRowsSelected, hasNextPage]);

    useEffect(() => {
        if (isLoading) {
            hideSelectAllRowsButton();
        }
    }, [isLoading]);
    //#endregion

    //#region handle end reached
    useEffect(() => {
        // if there is enough space to display more items then automatically trigger onEndReached
        if (
            onEndReached &&
            !isLoading &&
            !isEmpty &&
            // @ts-ignore
            document.getElementById("scroll-table-box")?.scrollHeight <=
                // @ts-ignore
                document.getElementById("scroll-table-box")?.clientHeight
        ) {
            onEndReached();
        }
    }, [isLoading, isEmpty, onEndReached]);

    const debouncedOnScroll = useCallback(
        debounce(({target}) => {
            if (onEndReached) {
                if (
                    target.scrollHeight - target.clientHeight - target.scrollTop <=
                    onEndReachedThreshold
                ) {
                    onEndReached();
                }
            }
        }, 300),
        [onEndReached, onEndReachedThreshold]
    );

    const onScroll = useCallback(
        (e: React.UIEvent<HTMLElement>) => {
            e.persist();
            debouncedOnScroll(e);
        },
        [debouncedOnScroll]
    );
    //#endregion

    //#region handle selectable columns
    const [isSettingsModalVisible, openSettingsModal, closeSettingsModal] = useToggle();
    //#endregion

    const numberOfColumns =
        filteredColumns.length + (withSelectableRows ? 1 : 0) + (withSelectableColumns ? 1 : 0);

    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: (index) => {
            return getSeparator(index) ? estimatedHeight + 32 : estimatedHeight;
        },
        overscan: 3,
    });

    const items = virtualizer.getVirtualItems();

    const paddingTop = items.length > 0 ? items?.[0]?.start || 0 : 0;
    const paddingBottom =
        items.length > 0 && items?.[items.length - 1].index < rows.length - 1
            ? virtualizer.getTotalSize() - (items?.[items.length - 1]?.end || 0)
            : 0;

    const headerRef = useRef(null);
    const getSelectAllRowCell = useCallback(
        (asHeaderCell: boolean) => {
            const checkbox = (
                <Checkbox
                    data-testid="table-select-all-visible-rows-button"
                    checked={allVisibleRowsSelected}
                    onChange={onSelectAllVisibleRows}
                />
            );
            if (asHeaderCell) {
                return <ColumnCell width="36px">{onSelectAllVisibleRows && checkbox}</ColumnCell>;
            }
            return (
                <Box width="36px" backgroundColor="grey.ultralight" px={3} py={2}>
                    {onSelectAllVisibleRows && checkbox}
                </Box>
            );
        },
        [allVisibleRowsSelected, onSelectAllVisibleRows]
    );
    const header = useMemo(() => {
        return (
            <Box as="tr" ref={headerRef}>
                {withSelectableRows && getSelectAllRowCell(true)}
                {filteredColumns.map((column, index) => {
                    const columnName = getColumnName(column);
                    const sortCriteria =
                        columnName && sortableColumns && sortableColumns[columnName]
                            ? sortableColumns[columnName]
                            : [];

                    const currentSortCriterion = ordering
                        ? (Object.keys(ordering)[0] as TSortCriterion)
                        : null;
                    const currentSortOrder = currentSortCriterion
                        ? ordering![currentSortCriterion]
                        : "asc";
                    return (
                        <Column<TCustomColumn, TSortCriterion>
                            data-testid={`table-column-label-${column.name}`}
                            key={getColumnKey(column, index)}
                            column={column}
                            getLabel={getColumnLabel}
                            getWidth={getColumnWidth}
                            setWidth={setColumnWidth}
                            sortCriteria={sortCriteria}
                            sortValue={
                                currentSortCriterion &&
                                sortCriteria.map((c) => c.value).includes(currentSortCriterion)
                                    ? {
                                          criterion: currentSortCriterion,
                                          order: currentSortOrder as "asc" | "desc",
                                      }
                                    : null
                            }
                            onUpdateSort={(newSortValue) => {
                                if (onOrderingChange) {
                                    const newOrdering = newSortValue
                                        ? ({
                                              [newSortValue.criterion]: newSortValue.order,
                                          } as Record<
                                              TSortCriterion,
                                              ColumnProps<TCustomColumn>["direction"]
                                          >)
                                        : null;
                                    onOrderingChange(newOrdering);
                                }
                            }}
                        />
                    );
                })}

                {setColumnWidth !== undefined && <ColumnCell p={0} width="auto" />}
                {withSelectableColumns && (
                    <ColumnCell pl={0} width="2.5em" data-testid="table-settings">
                        <IconButton name="cog" onClick={openSettingsModal} ml="auto" />
                    </ColumnCell>
                )}
            </Box>
        );
    }, [
        withSelectableRows,
        getSelectAllRowCell,
        filteredColumns,
        setColumnWidth,
        withSelectableColumns,
        openSettingsModal,
        getColumnName,
        sortableColumns,
        ordering,
        getColumnKey,
        getColumnLabel,
        getColumnWidth,
        onOrderingChange,
    ]);

    return (
        <>
            <Card {...containerProps}>
                {!isNil(overrideHeader) && (
                    <Flex backgroundColor="grey.ultralight" width="100%" alignItems="center">
                        {withSelectableRows && getSelectAllRowCell(false)}
                        <Box flex={1} px={3} py={2}>
                            {overrideHeader}
                        </Box>
                    </Flex>
                )}
                <Box
                    maxHeight="100%"
                    overflow="auto"
                    onScroll={onScroll}
                    id="scroll-table-box"
                    ref={tableContainerRef}
                >
                    <Box
                        as="table"
                        backgroundColor="grey.white"
                        css={{width: "100%", tableLayout: "fixed"}}
                        onScroll={(e) => e.stopPropagation()}
                    >
                        {isNil(overrideHeader) && <Box as="thead">{header}</Box>}
                        <Box as="tbody">
                            {/* empty row used to keep columns width when hide header (width need to be set in the first table row) */}
                            {!isNil(overrideHeader) && (
                                <EmptyRow
                                    isSelectable={withSelectableRows}
                                    columns={filteredColumns}
                                    getColumnKey={getColumnKey}
                                    getColumnWidth={getColumnWidth}
                                    withSelectableColumns={withSelectableColumns}
                                    isResizable={setColumnWidth !== undefined}
                                />
                            )}
                            {isSelectAllRowsButtonVisible && (
                                <FullWidthCell colSpan={numberOfColumns}>
                                    <SelectAllRowsButton
                                        // @ts-ignore
                                        allRowsSelected={allRowsSelected}
                                        // @ts-ignore
                                        onSelectAllRows={onSelectAllRows}
                                        // @ts-ignore
                                        allVisibleRowsSelectedMessage={
                                            allVisibleRowsSelectedMessage
                                        }
                                        // @ts-ignore
                                        selectAllRowsMessage={selectAllRowsMessage}
                                        // @ts-ignore
                                        allRowsSelectedMessage={allRowsSelectedMessage}
                                    />
                                </FullWidthCell>
                            )}
                            {paddingTop > 0 && (
                                <tr>
                                    <td style={{height: `${paddingTop}px`}} />
                                </tr>
                            )}
                            {items.map((virtualRow) => {
                                const row = rows[virtualRow.index];
                                const separator = getSeparator(virtualRow.index);
                                return (
                                    <React.Fragment
                                        key={`fragment-${getRowKey(row, virtualRow.index)}`}
                                    >
                                        {separator && (
                                            <FullWidthCell
                                                colSpan={numberOfColumns + 1}
                                                backgroundColor="blue.ultralight"
                                                px={2}
                                                py={1}
                                                key={`separator-${getRowKey(
                                                    row,
                                                    virtualRow.index
                                                )}`}
                                            >
                                                {separator}
                                            </FullWidthCell>
                                        )}
                                        <Row
                                            key={getRowKey(row, virtualRow.index)}
                                            testId={getRowTestId(row, virtualRow.index)}
                                            id={getRowId(row, virtualRow.index)}
                                            index={virtualRow.index}
                                            row={row}
                                            columns={filteredColumns}
                                            getCellContent={getRowCellContent}
                                            getCellIsClickable={getRowCellIsClickable}
                                            getColumnKey={getColumnKey}
                                            // @ts-ignore
                                            getColumnName={getColumnName}
                                            isSelectable={withSelectableRows}
                                            isSelected={
                                                allRowsSelected ||
                                                selectedRows?.[getRowId(row, virtualRow.index)]
                                            }
                                            onSelect={onSelectRow}
                                            onClick={onClickOnRow}
                                            onHover={onHoverRow}
                                            isEditing={
                                                editingRowId === getRowId(row, virtualRow.index)
                                            }
                                            withSelectableColumns={withSelectableColumns}
                                            withDraggableRows={withDraggableRows}
                                            headerRef={headerRef}
                                            isResizable={setColumnWidth !== undefined}
                                        />
                                    </React.Fragment>
                                );
                            })}
                            {paddingBottom > 0 && (
                                <tr>
                                    <td style={{height: `${paddingBottom}px`}} />
                                </tr>
                            )}
                        </Box>
                    </Box>
                    {(isLoading || isEmpty) && (
                        <Box width="100%" position="sticky" left={0}>
                            {isLoading ? <ListLoadingComponent /> : <ListEmptyComponent />}
                        </Box>
                    )}
                </Box>
            </Card>
            {isSettingsModalVisible && selectedColumnNames && onSelectColumns && (
                <SettingsModal<BaseColumnProps, TSortCriterion>
                    columns={columns}
                    selectedColumnNames={selectedColumnNames}
                    onSelectColumns={onSelectColumns}
                    getColumnKey={getColumnKey}
                    // @ts-ignore
                    getColumnName={getColumnName}
                    getColumnLabel={getColumnLabel}
                    onClose={closeSettingsModal}
                    title={columnsSelectionModalTitle}
                    initialSort={initialSort}
                    initialSortCriteria={initialSortCriteria}
                />
            )}
        </>
    );

    function getSeparator(index: number) {
        const row = rows[index];
        const previousRow = index > 0 ? rows[index - 1] : undefined;
        return getRowSeparator ? getRowSeparator(row, previousRow) : null;
    }
};

VirtualizedTable.defaultProps = {
    backgroundColor: "grey.white",
};
