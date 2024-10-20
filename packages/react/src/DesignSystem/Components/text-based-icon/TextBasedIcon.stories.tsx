import {Box, Flex} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {TextBasedIcon as Component, TextBasedIconProps} from "./TextBasedIcon";

export default {
    title: "Web UI/base/TextBasedIcon",
    component: Component,
    args: {
        propsArray: [
            {
                title: "Atlantique Transport",
            },
            {
                title: "Chuck Transport",
            },
            {
                title: "JPB",
            },
            {
                title: "DSD Fret",
            },
        ],
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<{propsArray: TextBasedIconProps[]}> = (args) => (
    <Flex style={{gap: "50px"}}>
        {args.propsArray.map((props, i) => (
            <Box mb={5} key={i}>
                <Component {...props} />
            </Box>
        ))}
    </Flex>
);
export const TextBasedIcon = Template.bind({});
