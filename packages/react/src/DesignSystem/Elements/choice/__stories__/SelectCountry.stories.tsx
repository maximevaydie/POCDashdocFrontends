import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Text} from "../../base/Text";
import {Box} from "../../layout/Box";
import {SelectCountryProps, SelectCountry} from "../SelectCountry";

export default {
    title: "Web UI/choice/SelectCountry",
    component: SelectCountry,
    args: {},
    argTypes: {
        onChange: {action: "change"},
        isDisabled: {control: "boolean"},
        placeholder: {control: "text"},
    },
    decorators: [
        (Story) => (
            <>
                <Box width={320}>
                    <Story />
                </Box>
                <Text mt={4}>
                    <i>
                        See all available props on{" "}
                        <a href="https://react-select.com/props" target="_blank" rel="noreferrer">
                            https://react-select.com/props
                        </a>
                    </i>
                </Text>
            </>
        ),
    ],
} as Meta;

export const DefaultSelect: Story<SelectCountryProps> = (args) => <SelectCountry {...args} />;
DefaultSelect.storyName = "Default Select";
