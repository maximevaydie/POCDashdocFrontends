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
import {Droppable, DroppableProvided, DroppableStateSnapshot} from "react-beautiful-dnd";

import {IconButton} from "../../button/IconButton";
import {SortCriteriaOption, SortValue} from "../../choice";
import {Checkbox} from "../../choice/Checkbox";
import {Box, BoxProps} from "../../layout/Box";
import {Card} from "../../layout/Card";
import {Flex} from "../../layout/Flex";

import {BaseColumnProps, ColumnCell, Column, ColumnDirection, ColumnProps} from "./Column";
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

const TableDndWrapper = ({
    withDraggableRows,
    droppableId,
    header,
    children,
}: {
    withDraggableRows: boolean;
    droppableId?: string;
    header: React.ReactNode;
    children: React.ReactNode;
}) => {
    if (withDraggableRows) {
        return (
            // @ts-ignore
            <Droppable droppableId={droppableId}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <Box
                        as="table"
                        ref={provided.innerRef}
                        css={{
                            tableLayout: "fixed",
                        }}
                        width="100%"
                        position="relative"
                        backgroundColor={
                            snapshot.isDraggingOver ? "blue.ultralight" : "grey.white"
                        }
                        data-testid={droppableId}
                    >
                        <Box as="thead">{header}</Box>
                        <Box as="tbody">
                            {children}
                            {provided.placeholder && (
                                <tr>
                                    <td>{provided.placeholder}</td>
                                </tr>
                            )}
                        </Box>
                    </Box>
                )}
            </Droppable>
        );
    }
    return (
        <Box
            as="table"
            backgroundColor="grey.white"
            style={{width: "100%", tableLayout: "fixed"}}
            onScroll={(e) => e.stopPropagation()}
            data-testid={droppableId}
        >
            <Box as="thead">{header}</Box>
            <Box as="tbody">{children}</Box>
        </Box>
    );
};

export type TableProps<TCustomColumn = BaseColumnProps, TCustomRow = BaseRowProps> = Omit<
    BoxProps,
    "rows"
> & {
    columns: TCustomColumn[];
    rows: TCustomRow[];
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
    getRowCellStyle?: RowProps<TCustomColumn, TCustomRow>["getCellStyle"];
    isLoading?: boolean;
    ListLoadingComponent?: ComponentType<any>;
    ListEmptyComponent?: ComponentType<any>;
    withSelectableRows?: boolean;
    withDraggableRows?: boolean;
    droppableId?: string;
    getDragGhost?: (row: TCustomRow) => ReactNode;
    dragGhostWidth?: number;
    draggedItemId?: string;
    selectedRows?: Record<string, boolean>;
    onSelectRow?: RowProps<TCustomColumn, TCustomRow>["onSelect"];
    onClickOnRow?: RowProps<TCustomColumn, TCustomRow>["onClick"];
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
    sortableColumns?: Record<string, boolean | string | Array<SortCriteriaOption<string>>>;
    ordering?: Record<string, ColumnProps<TCustomColumn>["direction"]> | null;
    onOrderingChange?: (
        newOrdering: Record<string, ColumnProps<TCustomColumn>["direction"]> | null
    ) => void;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    getColumnOrderingLabel?: (column: TCustomColumn) => string;
    // Override the default header based on column names
    overrideHeader?: ReactNode | null;
    narrowColumnGaps?: boolean;
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
const defaultRowCellStyle = () => ({});

export const Table = <TCustomColumn extends BaseColumnProps, TCustomRow extends BaseRowProps>(
    props: TableProps<TCustomColumn, TCustomRow>
): ReturnType<FunctionComponent<TableProps<TCustomColumn, TCustomRow>>> => {
    const {
        columns,
        rows,
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
        getRowCellStyle = defaultRowCellStyle,
        isLoading,
        ListLoadingComponent = DefaultListLoadingComponent,
        ListEmptyComponent = DefaultListEmptyComponent,
        withSelectableRows,
        withDraggableRows,
        droppableId,
        getDragGhost,
        dragGhostWidth,
        draggedItemId,
        selectedRows,
        onSelectRow,
        onClickOnRow,
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
        getColumnOrderingLabel,
        overrideHeader,
        narrowColumnGaps,
        ...containerProps
    } = props;

    const hasNewSortingEnabled = Array.isArray(Object.values(sortableColumns ?? {})[0]);

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
        [columns, selectedColumnNames, getColumnName, withSelectableColumns]
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
                    let sortableColumnProps;
                    if (hasNewSortingEnabled) {
                        const columnName = getColumnName(column);
                        const sortCriteria = (
                            columnName && sortableColumns && sortableColumns[columnName]
                                ? sortableColumns[columnName]
                                : []
                        ) as SortCriteriaOption<string>[];

                        const currentSortCriterion = ordering ? Object.keys(ordering)[0] : null;
                        const currentSortOrder = currentSortCriterion
                            ? ordering![currentSortCriterion]
                            : "asc";
                        sortableColumnProps = {
                            sortCriteria,
                            sortValue:
                                currentSortCriterion &&
                                sortCriteria.map((c) => c.value).includes(currentSortCriterion)
                                    ? {
                                          criterion: currentSortCriterion,
                                          order: currentSortOrder as "asc" | "desc",
                                      }
                                    : null,
                            onUpdateSort: (newSortValue: SortValue<string>) => {
                                if (onOrderingChange) {
                                    const newOrdering = newSortValue
                                        ? ({
                                              [newSortValue.criterion]: newSortValue.order,
                                          } as Record<string, ColumnDirection>)
                                        : null;
                                    onOrderingChange(newOrdering);
                                }
                            },
                        };
                    } else {
                        const orderingLabel = (
                            getColumnOrderingLabel
                                ? getColumnOrderingLabel(column)
                                : getColumnName(column)
                        ) as string;
                        sortableColumnProps = {
                            isSortable: !!sortableColumns?.[getColumnName(column) as string],
                            direction: ordering?.[orderingLabel],
                            onDirectionChange: (newDirection: ColumnDirection) =>
                                onOrderingChange?.({
                                    [orderingLabel]: newDirection,
                                }),
                        };
                    }

                    return (
                        <Column
                            data-testid={`table-column-label-${column.name}`}
                            key={getColumnKey(column, index)}
                            column={column}
                            getLabel={getColumnLabel}
                            getWidth={getColumnWidth}
                            setWidth={setColumnWidth}
                            narrowColumnGaps={narrowColumnGaps}
                            columnPosition={
                                index === 0
                                    ? "first"
                                    : index === filteredColumns.length - 1
                                      ? "last"
                                      : "middle"
                            }
                            {...sortableColumnProps}
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
        getSelectAllRowCell,
        filteredColumns,
        withSelectableColumns,
        openSettingsModal,
        getColumnKey,
        getColumnLabel,
        getColumnWidth,
        setColumnWidth,
        sortableColumns,
        getColumnName,
        ordering,
        getColumnOrderingLabel,
        onOrderingChange,
        withSelectableRows,
        narrowColumnGaps,
        hasNewSortingEnabled,
    ]);

    return (
        <>
            <Card
                maxHeight="100%"
                height="100%"
                width="100%"
                maxWidth="100%"
                overflow="auto"
                onScroll={onScroll}
                id="scroll-table-box"
                {...containerProps}
            >
                {(!isNil(overrideHeader) || isSelectAllRowsButtonVisible) && (
                    <Flex
                        flexDirection="column"
                        width="100%"
                        alignItems="center"
                        position="sticky"
                        top={0}
                        left={0}
                        zIndex="level1"
                    >
                        {!isNil(overrideHeader) && (
                            <Flex backgroundColor="grey.ultralight" width="100%">
                                {withSelectableRows && getSelectAllRowCell(false)}
                                <Box flex={1} px={3} py={2}>
                                    {overrideHeader}
                                </Box>
                            </Flex>
                        )}
                        {isSelectAllRowsButtonVisible && (
                            <SelectAllRowsButton
                                // @ts-ignore
                                allRowsSelected={allRowsSelected}
                                // @ts-ignore
                                onSelectAllRows={onSelectAllRows}
                                // @ts-ignore
                                allVisibleRowsSelectedMessage={allVisibleRowsSelectedMessage}
                                // @ts-ignore
                                selectAllRowsMessage={selectAllRowsMessage}
                                // @ts-ignore
                                allRowsSelectedMessage={allRowsSelectedMessage}
                            />
                        )}
                    </Flex>
                )}
                <TableDndWrapper
                    // @ts-ignore
                    withDraggableRows={withDraggableRows}
                    droppableId={droppableId}
                    header={isNil(overrideHeader) ? header : null}
                >
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
                    {rows.map((row, index) => (
                        <Row
                            key={getRowKey(row, index)}
                            testId={getRowTestId(row, index)}
                            id={getRowId(row, index)}
                            index={index}
                            row={row}
                            columns={filteredColumns}
                            getCellContent={getRowCellContent}
                            getCellIsClickable={getRowCellIsClickable}
                            getCellStyle={getRowCellStyle}
                            getColumnKey={getColumnKey}
                            // @ts-ignore
                            getColumnName={getColumnName}
                            isSelectable={withSelectableRows}
                            isSelected={allRowsSelected || selectedRows?.[getRowId(row, index)]}
                            onSelect={onSelectRow}
                            onClick={onClickOnRow}
                            isEditing={editingRowId === getRowId(row, index)}
                            withSelectableColumns={withSelectableColumns}
                            withDraggableRows={withDraggableRows}
                            isDragging={
                                draggedItemId !== null &&
                                draggedItemId !== undefined &&
                                draggedItemId === getRowId(row, index)
                            }
                            headerRef={headerRef}
                            getDragGhost={getDragGhost}
                            dragGhostWidth={dragGhostWidth}
                            isResizable={setColumnWidth !== undefined}
                            narrowColumnGaps={true}
                        />
                    ))}
                </TableDndWrapper>
                {(isLoading || isEmpty) && (
                    <Box width="100%" position="sticky" left={0}>
                        {isLoading ? <ListLoadingComponent /> : <ListEmptyComponent />}
                    </Box>
                )}
            </Card>
            {isSettingsModalVisible && selectedColumnNames && onSelectColumns && (
                <SettingsModal
                    columns={columns}
                    selectedColumnNames={selectedColumnNames}
                    onSelectColumns={onSelectColumns}
                    getColumnKey={getColumnKey}
                    // @ts-ignore
                    getColumnName={getColumnName}
                    getColumnLabel={getColumnLabel}
                    onClose={closeSettingsModal}
                    title={columnsSelectionModalTitle}
                />
            )}
        </>
    );
};

Table.defaultProps = {
    backgroundColor: "grey.white",
};
