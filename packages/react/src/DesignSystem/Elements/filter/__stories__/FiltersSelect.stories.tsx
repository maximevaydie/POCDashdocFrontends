import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useEffect, useState} from "react";

import {DropdownProps} from "../../button";
import {Box} from "../../layout/Box";
import {FiltersSelect as FiltersSelectComponent, FiltersSelectProps} from "../FiltersSelect";

export default {
    title: "Web UI/filter",
    component: FiltersSelectComponent,
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
    args: {
        label: "Filters label",
        options: [
            {label: "Option 1", value: 1},
            {label: "Option 2", value: 2},
            {label: "Option 3", value: 3},
        ],
    },
} as Meta;

const Template: Story<FiltersSelectProps & Pick<DropdownProps, "label" | "leftIcon">> = ({
    radioOptionsValue,
    ...args
}) => {
    const [value, setValue] = useState([]);
    const [radioValue, setRadioValue] = useState(radioOptionsValue);

    useEffect(() => setRadioValue(radioOptionsValue), [radioOptionsValue]);

    return (
        <FiltersSelectComponent
            {...args}
            value={value}
            onChange={setValue}
            radioOptionsValue={radioValue}
            onRadioOptionsChange={setRadioValue}
        />
    );
};

export const FiltersSelect = Template.bind({});
FiltersSelect.storyName = "FiltersSelect";

export const FiltersSelectWithRadioOptions = Template.bind({});
FiltersSelectWithRadioOptions.args = {
    radioOptions: [
        {label: "Radio option A", value: "A"},
        {label: "Radio option B", value: "B"},
        {label: "Radio option C", value: "C"},
    ],
    radioOptionsValue: "C",
    radioOptionsName: "radioOptionName",
};
FiltersSelectWithRadioOptions.storyName = "FiltersSelect with radio options";
