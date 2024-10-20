import {
    Box,
    ClickableBox,
    ClickableBoxProps,
    ErrorMessage,
    Flex,
    IconNames,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {FieldArray, FieldArrayRenderProps} from "formik";
import isNil from "lodash.isnil";
import React, {FunctionComponent, ReactNode, useEffect, useRef, useState} from "react";
import {DragDropContext, DragStart, DragUpdate, DropResult, Droppable} from "react-beautiful-dnd";

import {Item} from "./Item";

type EditableIndex = number | null | "new";

export type OrderedEditableItemListProps<T> = {
    formikFieldName?: string;
    items: Array<T>;
    isItemHidden?: (item: T, index: number) => boolean;
    getItemContentToDisplay: (item: T, index: number) => React.ReactNode;
    getItemContentUnder?: (item: T, index: number) => React.ReactNode;
    getDraggableItemId: (item: T) => string;
    isItemDraggable?: (item: T) => boolean;
    droppableId: string;
    getItemDataTestId?: (item: T) => string;
    getItemError?: (item: T, index: number) => string | null;
    getItemWarning?: (
        index: number,
        draggingState?: {
            sourceIndex?: number;
            destinationIndex?: number;
        }
    ) => string | null;
    onBeforeDragStart?: (sourceIndex: number) => void;
    onReorderItems?: (
        items: Array<T>,
        movedItem: T,
        newIndex: number,
        oldIndex: number,
        previousItems: Array<T>
    ) => void;
    editingIndex?: EditableIndex;
    editingIndexes?: Array<number>;
    onClickItem?: (index: EditableIndex) => void;
    getEditionElement?: (arrayHelpers?: FieldArrayRenderProps) => React.ReactNode;
    canDeleteItem?: (item: T) => boolean;
    onDeleteItem?: (item: T, index: number, arrayHelpers?: FieldArrayRenderProps) => void;
    deleteConfirmation?: {
        title: string;
        message: string | ReactNode;
    };
    outsideDelete?: boolean;
    addingItemPlaceholderLabel?: string;
    showIndex?: boolean;
    showAddButton?: boolean;
    addButtonContent?: React.ReactNode;
    error?: string;
    getDropPositionError?: (sourceIndex: number, destinationIndex: number) => string | null;
    dragIconAlwaysVisible?: boolean;
    itemContainerStyle?: ClickableBoxProps;
    deleteItemIcon?: IconNames;
};
export const ReorderEditableItemList: FunctionComponent<OrderedEditableItemListProps<any>> = ({
    formikFieldName,
    items,
    isItemHidden = () => {
        return false;
    },
    getItemContentToDisplay,
    getItemContentUnder,
    getDraggableItemId,
    isItemDraggable = () => true,
    droppableId,
    getItemDataTestId,
    getItemError,
    getItemWarning,
    onBeforeDragStart,
    onReorderItems,
    editingIndex,
    editingIndexes,
    onClickItem,
    getEditionElement,
    canDeleteItem = () => {
        return true;
    },
    onDeleteItem,
    outsideDelete = false,
    deleteConfirmation,
    showIndex = false,
    showAddButton,
    addButtonContent,
    addingItemPlaceholderLabel,
    error,
    getDropPositionError,
    dragIconAlwaysVisible = false,
    itemContainerStyle,
    deleteItemIcon,
}) => {
    const addingItemPlaceHolderRef = useRef(null);
    useEffect(() => {
        if (editingIndex === "new") {
            // @ts-ignore
            addingItemPlaceHolderRef.current?.scrollIntoView();
        }
    }, [editingIndex, items?.length]);

    const reorderItems = (result: DropResult) => {
        setDraggingState({});
        // dropped outside the list
        if (!result.destination || result.source.index === result.destination.index) {
            return;
        }
        const error = getDropPositionError?.(result.source.index, result.destination.index);
        if (!isNil(error)) {
            toast.error(error);
            return;
        }
        const previousItems = [...items];
        const [removed] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, removed);
        onReorderItems?.(
            items,
            removed,
            result.destination.index,
            result.source.index,
            previousItems
        );
    };
    const [draggingState, setDraggingState] = useState<{
        sourceIndex?: number;
        destinationIndex?: number;
    }>({});
    const updateCurrentDraggingPosition = (update: DragUpdate | DragStart) => {
        setDraggingState({
            sourceIndex: update.source.index,
            destinationIndex: (update as DragUpdate).destination?.index,
        });
    };

    const renderItemFieldArray = (arrayHelpers?: FieldArrayRenderProps) => {
        return (
            <>
                {items.map((item, index) => {
                    const error = getItemError?.(item, index);
                    const warning = getItemWarning?.(index, draggingState);
                    const positionInEditingGroup =
                        !editingIndexes || editingIndexes?.indexOf(index) === -1
                            ? undefined
                            : editingIndexes?.indexOf(index) === 0
                              ? "first"
                              : editingIndexes?.indexOf(index) === editingIndexes?.length - 1
                                ? "last"
                                : "middle";
                    return (
                        <Item
                            key={getDraggableItemId?.(item)}
                            index={index}
                            showIndex={showIndex}
                            dataTestId={getItemDataTestId?.(item)}
                            draggableItemId={getDraggableItemId(item)}
                            isDragDisabled={items.length <= 1 || !isItemDraggable(item)}
                            isHidden={isItemHidden(item, index)}
                            isEditing={index === editingIndex}
                            positionInEditingGroup={positionInEditingGroup}
                            canEdit={!!onClickItem}
                            onEdit={() => onClickItem?.(index)}
                            canDelete={canDeleteItem?.(item) || false}
                            onDelete={() => onDeleteItem?.(item, index, arrayHelpers)}
                            deleteConfirmation={deleteConfirmation}
                            outsideDelete={outsideDelete}
                            error={error}
                            warning={warning}
                            contentUnder={getItemContentUnder?.(item, index)}
                            dragIconAlwaysVisible={dragIconAlwaysVisible}
                            itemContainerStyle={itemContainerStyle}
                            deleteIcon={deleteItemIcon}
                        >
                            {getItemContentToDisplay(item, index)}
                        </Item>
                    );
                })}
                {editingIndex === "new" && (
                    <Flex
                        bg="grey.light"
                        px={3}
                        py={4}
                        mt={3}
                        border="1px solid"
                        borderColor="grey.light"
                        ref={addingItemPlaceHolderRef}
                    >
                        <Text>{addingItemPlaceholderLabel}</Text>
                    </Flex>
                )}
                {editingIndex !== null && getEditionElement?.(arrayHelpers)}
            </>
        );
    };
    return (
        <>
            {showAddButton && addButtonContent && !editingIndex && (
                <ClickableBox
                    border="1px dashed"
                    borderColor={error ? "red.default" : "grey.light"}
                    backgroundColor={error ? "red.ultralight" : undefined}
                    p={4}
                    mt={3}
                    width="100%"
                    onClick={() => onClickItem?.("new")}
                >
                    {addButtonContent}
                </ClickableBox>
            )}
            {!editingIndex && error && <ErrorMessage error={error} />}
            <DragDropContext
                onBeforeDragStart={(start) => onBeforeDragStart?.(start.source.index)}
                onDragStart={updateCurrentDraggingPosition}
                onDragUpdate={updateCurrentDraggingPosition}
                onDragEnd={reorderItems}
            >
                <Droppable droppableId={droppableId}>
                    {(provided) => (
                        <>
                            <Box {...provided.droppableProps} ref={provided.innerRef}>
                                {formikFieldName ? (
                                    <FieldArray
                                        name={formikFieldName}
                                        render={(arrayHelpers) =>
                                            renderItemFieldArray(arrayHelpers)
                                        }
                                    />
                                ) : (
                                    renderItemFieldArray()
                                )}
                            </Box>
                            {provided.placeholder}
                        </>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
};
