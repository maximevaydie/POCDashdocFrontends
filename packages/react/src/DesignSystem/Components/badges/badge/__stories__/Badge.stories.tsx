import {Flex} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Badge as BadgeComponent} from "../Badge";
import {BADGE_SIZE_VARIANTS, BADGE_COLOR_VARIANTS} from "../constants";
import {BadgeProps} from "../types";

export default {
    title: "Web UI/base/badges/Badge",
    component: BadgeComponent,
    args: {
        children: "Badge content",
        variant: "neutral",
        size: "medium",
        shape: "rounded",
        noWrap: false,
        onDelete: () => alert("You clicked on the badge delete icon!"),
    },
    argTypes: {
        variant: {
            options: [...Object.keys(BADGE_COLOR_VARIANTS)],
            control: {
                type: "select",
            },
            defaultValue: "neutral",
        },
        size: {
            options: [...Object.keys(BADGE_SIZE_VARIANTS)],
            control: {
                type: "select",
            },
            defaultValue: "medium",
        },
        shape: {
            options: ["rounded", "squared"],
            control: {
                type: "select",
            },
            defaultValue: "rounded",
        },
        noWrap: {
            description: "Keep the content on a single line",
            defaultValue: false,
        },
        onDelete: {
            description: "Add a delete icon with the function passed",
            control: {
                type: "function",
            },
        },
    },
} as Meta;

const Template: Story<BadgeProps> = ({children, ...args}) => (
    <Flex backgroundColor={"grey.white"} p={2}>
        <BadgeComponent {...args}>{children}</BadgeComponent>
    </Flex>
);

export const Badge = Template.bind({});

export const AllBadgesVariant = () => {
    return (
        <Flex backgroundColor={"grey.white"} p={2} style={{gap: "20px"}}>
            {Object.keys(BADGE_COLOR_VARIANTS).map((variant, index) => (
                // eslint-disable-next-line react/jsx-no-literals
                <BadgeComponent
                    key={index}
                    variant={variant as BadgeProps["variant"]}
                    onDelete={() => alert("You clicked on the badge delete icon!")}
                >
                    content
                </BadgeComponent>
            ))}
        </Flex>
    );
};
export const AllBadgesSizesAndShape = () => {
    return (
        <Flex backgroundColor={"grey.white"} p={2} style={{gap: "20px"}} alignItems="center">
            {Object.keys(BADGE_SIZE_VARIANTS).map((size, index) =>
                ["rounded", "squared"].map((shape, idx) => (
                    // eslint-disable-next-line react/jsx-no-literals
                    <BadgeComponent
                        key={`${index}-${idx}`}
                        shape={shape as BadgeProps["shape"]}
                        size={size as BadgeProps["size"]}
                    >
                        content
                    </BadgeComponent>
                ))
            )}
            {["rounded", "squared"].map((shape, idx) => (
                // eslint-disable-next-line react/jsx-no-literals
                <BadgeComponent
                    key={`${idx}`}
                    shape={shape as BadgeProps["shape"]}
                    onDelete={() => alert("You clicked on the badge delete icon!")}
                >
                    content
                </BadgeComponent>
            ))}
        </Flex>
    );
};
