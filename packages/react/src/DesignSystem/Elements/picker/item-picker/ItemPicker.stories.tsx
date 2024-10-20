import {SelectOption} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";
import {MemoryRouter} from "react-router";

import {ItemPicker as Component, ItemPickerProps} from "./ItemPicker";

const Template: Story<ItemPickerProps & {waitOnFetch: number}> = (args) => {
    const [options, setOptions] = useState<SelectOption<string>[]>([
        {label: "John", value: "john"},
        {label: "Doe", value: "doe"},
        {label: "Option 1", value: "1"},
        {label: "Option 2", value: "2"},
        {label: "Option 3", value: "3"},
    ]);

    const onSelect = (option: SelectOption<string>) => {
        if (option) {
            setOptions((prev) => {
                const exist = prev.some((option) => option.value === option.value);
                if (exist) {
                    return prev;
                } else {
                    const {label, value} = option;
                    return [...prev, {label, value}];
                }
            });
        }
    };
    return (
        <MemoryRouter>
            <Box width="600px" height="400px">
                <Component
                    {...args}
                    options={options}
                    onSelect={onSelect}
                    defaultValue={{...options[0]}}
                    isValid={() => true}
                />
            </Box>
        </MemoryRouter>
    );
};

export const ItemPicker = Template.bind({});

export default {
    title: "Web UI/picker/Item Picker",
    component: Component,
    args: {
        placeholder: "A placeholder",
    },
} as Meta;
