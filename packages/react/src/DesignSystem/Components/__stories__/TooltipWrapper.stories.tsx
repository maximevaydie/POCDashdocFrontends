import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Flex} from "../../layout/Flex";
import {Props, TooltipWrapper as TooltipWrapperComponent} from "../TooltipWrapper";

export default {
    title: "Web UI/base/Tooltip Wrapper",
    component: TooltipWrapperComponent,
    args: {
        content: "Tooltip content",
        children: "tooltip on hover",
        place: "top",
    },
    argTypes: {
        placement: {
            defaultValue: "bottom",
            options: ["top", "right", "bottom", "left"],
            control: {
                type: "select",
            },
        },
        delayShow: {
            defaultValue: 0,
            description: "waiting time while hovering children before showing tooltip (in ms)",
            control: {
                type: "number",
            },
        },
        delayHide: {
            defaultValue: 0,
            description:
                "Waiting time before hiding tooltip (in ms) once children is not hovered anymore",
            control: {
                type: "number",
            },
        },
        hideOnPress: {
            defaultValue: false,
            description: "If activated, hide tooltip when click on children",
            control: {
                type: "boolean",
            },
        },
        hidden: {
            defaultValue: false,
            description: "If activated, never show tooltip",
            control: {
                type: "boolean",
            },
        },
        content: {
            defaultValue: "",
            description: "The content of the tooltip (string or React Node)",
            control: {
                type: "text",
            },
        },
        children: {
            defaultValue: "",
            description: "hover component from where tooltip should be displayed (React Node)",
            control: {
                type: "text",
            },
        },
    },
    decorators: [
        (Story) => (
            <>
                <Flex justifyContent="center">
                    <Story />
                </Flex>
            </>
        ),
    ],
} as Meta;

const Template: Story<Props> = ({content, ...args}) => (
    <TooltipWrapperComponent content={content} {...args} />
);

export const TooltipWrapper = Template.bind({});
