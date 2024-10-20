import {Box, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {icons, svgs} from "../constants";
import {Icon as IconComponent} from "../Icon";
import {IconNames, IconProps} from "../types";

const Template: Story<IconProps> = (args) => (
    <Box>
        <IconComponent {...args} />
    </Box>
);

export const Icon = Template.bind({});

export const AllIcons = () => {
    return (
        <Box
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                columnGap: "5px",
                rowGap: "20px",
            }}
        >
            {[...Object.keys(icons), ...Object.keys(svgs)]
                .sort((l, r) => l.localeCompare(r))
                .map((name: IconNames) => {
                    return (
                        <Box key={name} textAlign="center">
                            <IconComponent name={name} />
                            <Text>{name}</Text>
                        </Box>
                    );
                })}
        </Box>
    );
};

export default {
    title: "Web UI/Icon",
    component: IconComponent,
    args: {
        name: "truck",
        rotation: 0,
        scale: [1, 1],
        round: false,
        strokeWidth: 1,
        svgWidth: "20px",
        svgHeight: "20px",
        backgroundColor: "grey.white",
        color: "grey.ultradark",
    },
    argTypes: {
        name: {
            description: "Name of the icon to use",
            options: [...Object.keys(icons), ...Object.keys(svgs)].sort((l, r) =>
                l.localeCompare(r)
            ),
            control: {
                type: "select",
            },
        },
    },
} as Meta;
