import {Logger} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {
    OrderedEditableItemListProps,
    ReorderEditableItemList as ReorderEditableItemListComponent,
} from "../ReorderEditableItemList";

type ItemType = {id: number; label: string; error: string; warning: string};

export default {
    title: "Web UI/misc/Reorder Editable Item List",
    component: ReorderEditableItemListComponent,
    args: {
        items: [
            {id: 1, label: "item 1"},
            {id: 2, label: "item 2"},
            {id: 3, label: "item 3"},
            {id: 4, label: "item 4", error: "There is an error on 4th item"},
            {id: 5, label: "item 5"},
        ],
        isItemCollapsed: () => false,
        getItemContentToDisplay: (item: ItemType, index: number) => (
            <Text>
                {index} : Content to display of {item.label}
            </Text>
        ),
        getItemContentUnder: (item: ItemType, index: number) => (
            <Text>
                {index}: Under {item.label}
            </Text>
        ),
        getDraggableItemId: (item: ItemType) => `${item.id}`,
        isItemDraggable: () => true,
        droppableId: "itemList",
        getItemDataTestId: (item: ItemType) => `${item.id}`,
        getItemError: (item: ItemType) => item.error,
        getItemWarning: (index: number) => (index === 4 ? "There is a warning on 5th item" : null),
        onReorderItems: (items: Array<ItemType>) => Logger.log("reorder items", items),
        editingIndex: null,
        onEditItem: (index: number) => Logger.log("edit item index:" + index),
        getEditionElement: () => "editing item",
        onDeleteItem: (_: ItemType, index: number) => {
            Logger.log("delete item index:" + index);
        },
        onClickItem: (index: number) => Logger.log("click item index:" + index),
        deleteConfirmation: {
            title: "delete title",
            message: "delete message",
        },
        outsideDelete: false,
        addingItemPlaceholderLabel: "adding item",
        showAddButton: true,
        addButtonContent: "add item",
        error: "global error",
        showIndex: true,
    },
} as Meta;

const Template: Story<OrderedEditableItemListProps<ItemType>> = (args) => (
    <ReorderEditableItemListComponent {...args} />
);

export const ReorderEditableItemList = Template.bind({});
