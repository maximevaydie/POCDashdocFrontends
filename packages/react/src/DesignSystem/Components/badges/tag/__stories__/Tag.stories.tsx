import {Flex} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {TagColor} from "dashdoc-utils";
import React from "react";

import {TAG_COLOR_VARIANTS, Tag as TagComponent, TagProps} from "../Tag";

export default {
    title: "Web UI/base/badges/Tag",
    component: TagComponent,
    args: {
        tag: {color: "#4B71FA", name: "Tag name"},
        size: "medium",
        hideText: false,
        onDelete: () => alert("You clicked on the tag's delete icon!"),
    },
    argTypes: {
        size: {
            description: "Size of the tag, either small or medium",
            options: ["small", "medium"],
            defaultValue: "medium",
            control: {
                type: "select",
            },
        },
        onDelete: {
            description: "Add a delete icon with the function passed",
            options: [undefined, () => alert("You clicked on the tag's delete icon!")],
            control: {
                type: "select",
            },
        },
    },
} as Meta;

const Template: Story<TagProps> = ({children, ...args}) => (
    <TagComponent {...args}>{children}</TagComponent>
);

export const Tag = Template.bind({});

export const AllTags = () => {
    return (
        <Flex backgroundColor={"grey.white"} p={2} style={{gap: "20px"}}>
            {Object.keys(TAG_COLOR_VARIANTS).map((color, index) => (
                <TagComponent
                    tag={{color: color as TagColor, name: "Tag name", pk: 0}}
                    key={index}
                />
            ))}
        </Flex>
    );
};
