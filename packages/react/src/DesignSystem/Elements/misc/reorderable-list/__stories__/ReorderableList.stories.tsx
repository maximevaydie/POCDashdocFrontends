import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {
    ReorderableList as ReorderableListComponent,
    ReorderableListProps,
} from "../ReorderableList";

export default {
    title: "Web UI/misc/Reorderable List",
    component: ReorderableListComponent,
    args: {
        items: [
            {
                id: "1",
                label: "Item 1",
            },
            {
                id: "2",
                label: "Item 2",
            },
            {
                id: "3",
                label: "Item 3",
            },
            {
                id: "4",
                label: "Item 4",
            },
            {
                id: "5",
                label: "Item 5",
            },
        ],
        onChange: () => {},
        itemContainerStyle: {
            width: "200px",
            bg: "white",
            pl: "10px",
        },
    },
    argTypes: {
        items: {
            description: "Items to reorder",
            control: {
                type: "object",
            },
        },
        onChange: {
            description: "Callback to call when the items are reordered or deleted",
        },
        itemContainerStyle: {
            description: "Style of the item container",
            control: {
                type: "object",
            },
        },
    },
} as Meta;

const Template: Story<ReorderableListProps> = ({...args}) => (
    <ReorderableListComponent {...args} />
);
export const ReorderableList = Template.bind({});
