import {Meta, Story} from "@storybook/react/types-6-0";
import {startOfDay} from "date-fns";
import React, {useState} from "react";

import {Box} from "../../../layout/Box";
import {DateTimePicker as DateTimePickerComponent, DateTimePickerProps} from "../DateTimePicker";

const fiveDayBefore = startOfDay(new Date());
fiveDayBefore.setDate(fiveDayBefore.getDate() - 5);
const fiveDayAfter = startOfDay(new Date());
fiveDayAfter.setDate(fiveDayAfter.getDate() + 5);

export default {
    title: "Web UI/picker/Date/DateTimePicker",
    component: DateTimePickerComponent,
    args: {},
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<DateTimePickerProps> = (props) => {
    const [date, setDate] = useState<Date>(new Date());
    const [timeMin, setTimeMin] = useState<string | undefined>(undefined);
    const [timeMax, setTimeMax] = useState<string | undefined>(undefined);

    const handleTimeChange = (time: {min?: string; max?: string}) => {
        if (time.min !== undefined) {
            setTimeMin(time.min);
        }
        if (time.max !== undefined) {
            setTimeMax(time.max);
        }
    };

    return (
        <DateTimePickerComponent
            {...props}
            date={date}
            timeMin={timeMin}
            timeMax={timeMax}
            onDateChange={setDate}
            onTimeChange={handleTimeChange}
        />
    );
};
export const DateTimePicker = Template.bind({});
DateTimePicker.storyName = "DateTimePicker";
