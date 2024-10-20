import {Meta, Story} from "@storybook/react/types-6-0";
import {startOfDay} from "date-fns";
import React, {useEffect, useState} from "react";

import {Box} from "../../../layout/Box";
import {DatePicker as DatePickerComponent, DatePickerProps} from "../DatePicker";

const fiveDayBefore = startOfDay(new Date());
fiveDayBefore.setDate(fiveDayBefore.getDate() - 5);
const fiveDayAfter = startOfDay(new Date());
fiveDayAfter.setDate(fiveDayAfter.getDate() + 5);

export default {
    title: "Web UI/picker/Date/DatePicker",
    component: DatePickerComponent,
    args: {
        leftIcon: "calendar",
        placeholder: "Date picker placeholder",
        disabled: false,
        clearable: false,
        dateDisplayFormat: "P",
        showTime: false,
    },
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<DatePickerProps> = ({date, ...args}) => {
    const [value, onChange] = useState(date);

    useEffect(() => onChange(date), [date]);

    return <DatePickerComponent {...args} date={value} onChange={onChange} />;
};
export const DatePicker = Template.bind({});
DatePicker.storyName = "DatePicker";

export const DatePickerWithMinAndMax = Template.bind({});
DatePickerWithMinAndMax.storyName = "DatePicker with date limits (5 days before/after today)";
DatePickerWithMinAndMax.args = {
    minDate: fiveDayBefore,
    maxDate: fiveDayAfter,
};
export const DatePickerWithTime = Template.bind({});
DatePickerWithTime.storyName = "DatePicker with time field";
DatePickerWithTime.args = {
    showTime: true,
};
