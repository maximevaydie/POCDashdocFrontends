import {ClickableBoxProps, IconNames, ReorderEditableItemList, Text} from "@dashdoc/web-ui";
import {Item} from "@dashdoc/web-ui/src/choice/types";
import React from "react";

export interface ReorderableListProps {
    items: Item[];
    onChange: (items: Item[]) => void;
    itemContainerStyle?: ClickableBoxProps;
    deleteIcon?: IconNames;
}

export function ReorderableList({
    items,
    onChange,
    itemContainerStyle = {
        padding: 0,
        backgroundColor: "white",
    },
    deleteIcon = "close",
}: ReorderableListProps) {
    return (
        <ReorderEditableItemList
            items={items}
            onReorderItems={(items) => onChange(items)}
            onDeleteItem={(item) => onChange(items.filter((resource) => resource.id !== item.id))}
            getItemContentToDisplay={getResourceLabel}
            getDraggableItemId={getDraggableItemId}
            droppableId="reorderable-list-droppable-id"
            editingIndex={null}
            addingItemPlaceholderLabel={""}
            itemContainerStyle={itemContainerStyle}
            dragIconAlwaysVisible
            deleteItemIcon={deleteIcon}
        />
    );

    function getResourceLabel(resource: Item) {
        return <Text>{resource.label}</Text>;
    }

    function getDraggableItemId(resource: Item) {
        return resource.id.toString();
    }
}
