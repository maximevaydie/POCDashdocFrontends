import {Box, Link, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {DecoratedSection as Component, DecoratedSectionProps} from "./DecoratedSection";

const Template: Story<DecoratedSectionProps> = (args) => {
    const subTitle = (
        <>
            The section subtitle <Link>With a link</Link>
        </>
    );
    return (
        <Box width="900px">
            <Box mb={5} backgroundColor="white">
                <Component {...args} subTitle={subTitle}>
                    <Box flex={1} p={4} mr={2} backgroundColor="grey.light">
                        <Text>Children content (buttons?)</Text>
                    </Box>
                </Component>
            </Box>
        </Box>
    );
};

export const DecoratedSection = Template.bind({});
export default {
    title: "Web UI/layout/DecoratedSection",
    component: Component,
    args: {
        title: "The section title",
        subTitleVariant: "normal",
    },
    argTypes: {
        title: {
            control: {
                type: "text",
            },
        },
        subTitleVariant: {
            options: ["small", "normal"],
            control: {
                type: "select",
            },
        },
    },
} as Meta;
