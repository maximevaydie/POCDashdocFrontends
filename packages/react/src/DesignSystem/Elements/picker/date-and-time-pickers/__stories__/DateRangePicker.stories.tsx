import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useEffect, useState} from "react";

import {Box} from "../../../layout/Box";
import {
    DateRangePicker as DateRangePickerComponent,
    DateRangePickerProps,
} from "../DateRangePicker";

export default {
    title: "Web UI/picker/Date/DateRangePicker",
    component: DateRangePickerComponent,
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<DateRangePickerProps> = ({range, radioOptionsValue, ...args}) => {
    const [value, onChange] = useState(range);
    const [radioValue, setRadioValue] = useState(radioOptionsValue);

    useEffect(() => onChange(range), [range]);
    useEffect(() => setRadioValue(radioOptionsValue), [radioOptionsValue]);

    return (
        <DateRangePickerComponent
            {...args}
            range={value}
            onChange={onChange}
            radioOptionsValue={radioValue}
            onRadioOptionsChange={setRadioValue}
        />
    );
};

export const DateRangePicker = Template.bind({});
DateRangePicker.storyName = "DateRangePicker";

export const DateRangePickerWithRadioOptions = Template.bind({});
DateRangePickerWithRadioOptions.args = {
    radioOptions: [
        {label: "Radio option A", value: "A"},
        {label: "Radio option B", value: "B"},
    ],
    radioOptionsValue: "A",
    radioOptionsName: "radioOptionName",
};
DateRangePickerWithRadioOptions.storyName = "DateRangePicker with radio options";
