import {t} from "@dashdoc/web-core";
import {
    Button,
    Icon,
    MultiCriteriaSortSelector,
    SortCriteriaOption,
    SortValue,
    SwitchInput,
    themeAwareCss,
} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";
import {
    DragDropContext,
    Draggable,
    DraggableLocation,
    DropResult,
    Droppable,
} from "react-beautiful-dnd";

import {Box} from "../../layout/Box";
import {Flex} from "../../layout/Flex";
import {Modal, ModalProps} from "../../modal/Modal";
import {Text} from "../Text";

import {BaseColumnProps, ColumnProps} from "./Column";
import {RowProps} from "./Row";

export type SettingsModalProps<
    TCustomColumn = BaseColumnProps,
    TSortCriterion extends string = string,
> = Omit<ModalProps, "id" | "children" | "mainButton" | "secondaryButton"> & {
    columns: TCustomColumn[];
    selectedColumnNames: string[];
    onSelectColumns: (selectedColumnNames: string[], initialOrdering: string | null) => void;
    getColumnKey: RowProps<TCustomColumn>["getColumnKey"];
    getColumnName: RowProps<TCustomColumn>["getColumnName"];
    getColumnLabel: ColumnProps<TCustomColumn>["getLabel"];
    initialSort?: SortValue<TSortCriterion> | null;
    initialSortCriteria?: Array<SortCriteriaOption<TSortCriterion>>;
};

export const SettingsModal = <
    TCustomColumn extends BaseColumnProps,
    TSortCriterion extends string = string,
>(
    props: SettingsModalProps<TCustomColumn, TSortCriterion>
): ReturnType<FunctionComponent<SettingsModalProps<TCustomColumn>>> => {
    const {
        columns,
        selectedColumnNames,
        onSelectColumns,
        getColumnKey,
        getColumnName,
        getColumnLabel,
        onClose,
        title = t("common.columns"),
        initialSort,
        initialSortCriteria,
        ...modalProps
    } = props;

    const [currentSelection, setCurrentSelection] = useState<Record<string, boolean>>(
        columns.reduce((initialColumns: Record<string, boolean>, column) => {
            const columnName = getColumnName(column);
            initialColumns[columnName] = selectedColumnNames.includes(columnName);
            return initialColumns;
        }, {})
    );
    const [orderedColumns, setColumnsOrder] = useState<TCustomColumn[]>(
        getInitialColumnsOrdered()
    );

    const [initialSortValue, setInitialSortValue] = useState<SortValue<TSortCriterion> | null>(
        initialSort ?? null
    );

    const selectedSortOption = initialSortCriteria?.find(
        (c) => c.value === initialSortValue?.criterion
    );
    const sortSelectLabel = selectedSortOption
        ? `${selectedSortOption.label} - ${
              initialSortValue?.order === "asc"
                  ? t("common.ascendingOrder")
                  : t("common.descendingOrder")
          }`
        : t("tableColumns.groupBy.placeholder");

    return (
        <Modal
            title={title}
            id="table-settings-modal"
            onClose={onClose}
            mainButton={{
                onClick: () => {
                    const initialSortString = initialSortValue
                        ? `${initialSortValue.order === "asc" ? "" : "-"}${
                              initialSortValue.criterion
                          }`
                        : null;
                    onSelectColumns?.(getSelectedColumnNamesOrdered(), initialSortString);
                    onClose?.();
                },
            }}
            {...modalProps}
        >
            <Flex flexDirection="column">
                {initialSortCriteria && initialSortCriteria.length && (
                    <Box marginBottom={3}>
                        <Text variant="h1" marginBottom={2}>
                            {t("tableColumns.groupBy")}
                        </Text>
                        <MultiCriteriaSortSelector
                            label={
                                <Button
                                    variant="secondary"
                                    display="flex"
                                    justifyContent="space-between"
                                    paddingX={3}
                                    height="40px"
                                    width="100%"
                                >
                                    <Text>{sortSelectLabel}</Text>
                                    <Icon name="arrowDown" ml={1} scale={0.5} />
                                </Button>
                            }
                            value={initialSortValue}
                            criteriaOptions={initialSortCriteria}
                            onChange={setInitialSortValue}
                            data-testid="table-settings-group-by"
                        />
                    </Box>
                )}
                <Box>
                    <Text variant="h1" marginBottom={2}>
                        {t("tableColumns.columnsOrder")}
                    </Text>
                    <DragDropContext onDragEnd={reorderColumns}>
                        <Droppable droppableId={"table-columns"}>
                            {(provided, snapshot) => (
                                <Box {...provided.droppableProps} ref={provided.innerRef}>
                                    {orderedColumns.map((column, index) => (
                                        <Draggable
                                            key={getColumnKey(column, index)}
                                            draggableId={getColumnName(column)}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Flex
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    backgroundColor={
                                                        snapshot.isDragging
                                                            ? "grey.light"
                                                            : undefined
                                                    }
                                                    css={themeAwareCss({
                                                        "&:hover": {
                                                            backgroundColor: "grey.light",
                                                        },
                                                    })}
                                                    px={2}
                                                    py={"2px"}
                                                    justifyContent="space-between"
                                                    id={`table-column-${getColumnName(column)}`}
                                                >
                                                    <Flex>
                                                        <Icon
                                                            name="drag"
                                                            color="grey.dark"
                                                            mr={2}
                                                        />
                                                        <Text>{getColumnLabel(column)}</Text>
                                                    </Flex>
                                                    <SwitchInput
                                                        value={
                                                            currentSelection[getColumnName(column)]
                                                        }
                                                        onChange={(checked) =>
                                                            setCurrentSelection({
                                                                ...currentSelection,
                                                                [getColumnName(column)]: checked,
                                                            })
                                                        }
                                                        data-testid={`table-settings-${column.name}`}
                                                    />
                                                </Flex>
                                            )}
                                        </Draggable>
                                    ))}
                                    {snapshot.draggingFromThisWith && <Box height="28px" />}
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <Box width="100%" mt={2}>
                        <Button variant="plain" onClick={() => setColumnsOrder(columns)}>
                            {t("tableColumns.resetOrder")}
                        </Button>
                    </Box>
                </Box>
            </Flex>
        </Modal>
    );

    function getInitialColumnsOrdered(): TCustomColumn[] {
        // In db we store only selected columns order.
        // If the order was not changed, all columns will be in the same order as initial
        // otherwise try to intercalate not selected columns in the right place:
        // put the unselected item after the first previous item found in the list
        // eg : columns: A, B, C, D, E, F, G , selected columns ordered : D, B, F
        // result : A, D, B, C, E, F, G
        // ALGORITHM:
        // start with selected column ordered list : D, B, F | lastItemInThelist : -1
        // map columns:
        // - A is inserted in position 0 => list A, D, B, F | lastItemInThelist : 0
        // - B is found in position 2 => list A, D, B, F | lastItemInThelist : 2
        // - C is inserted in position 3 => list A, D, B, C, F | lastItemInThelist : 3
        // - D is found in position 1 < lastItemInThelist => do nothing
        // - E is inserted in position 4 => list A, D, B, C, E, F | lastItemInThelist : 4
        // - F is found in position 5 => list A, D, B, C, E, F | lastItemInThelist : 5
        // - G is inserted in position 6 => list A, D, B, C, E, F, G | lastItemInThelist : 6
        const {orderedColumnNames} = columns.reduce(
            ({orderedColumnNames, lastItemInThelist}, column) => {
                const columnName = getColumnName(column);
                // look for column name index in order list
                const index = orderedColumnNames.findIndex((name) => name === columnName);
                let newIndex = lastItemInThelist;
                if (index === -1) {
                    // item not found: insert after last item found in the list and update last item found index
                    newIndex += 1;
                    orderedColumnNames.splice(newIndex, 0, columnName);
                } else if (index > lastItemInThelist) {
                    // item found after previously last item found in the list : update  last item found index
                    newIndex = index;
                }
                // item found before previously last item found in the list : do nothing

                return {orderedColumnNames, lastItemInThelist: newIndex};
            },
            {orderedColumnNames: [...selectedColumnNames], lastItemInThelist: -1}
        );
        return orderedColumnNames
            .map((name) => columns.find((c) => getColumnName(c) === name))
            .filter((c) => !!c) as TCustomColumn[];
    }
    function getSelectedColumnNamesOrdered() {
        return orderedColumns
            .map((column) => getColumnName(column))
            .filter((columnName) => currentSelection[columnName]);
    }
    function reorderColumns(result: DropResult) {
        // dropped outside the list
        if (!result.destination || result.source.index === result.destination.index) {
            return;
        }
        setColumnsOrder((previousColumns) => {
            const newColumns = [...previousColumns];
            const [removed] = newColumns.splice(result.source.index, 1);
            newColumns.splice((result.destination as DraggableLocation).index, 0, removed);
            return newColumns;
        });
    }
};
