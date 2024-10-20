import {Meta, Story} from "@storybook/react/types-6-0";
import {startOfDay} from "date-fns";
import React, {useEffect, useState} from "react";

import {Box} from "../../../layout/Box";
import {TimePicker as TimePickerComponent, TimePickerProps} from "../TimePicker";

const fiveDayBefore = startOfDay(new Date());
fiveDayBefore.setDate(fiveDayBefore.getDate() - 5);
const fiveDayAfter = startOfDay(new Date());
fiveDayAfter.setDate(fiveDayAfter.getDate() + 5);

export default {
    title: "Web UI/picker/Date/TimePicker",
    component: TimePickerComponent,
    args: {
        minTime: "03:02",
        maxTime: "16:17",
        hasErrors: false,
        timeStep: 15,
        disabled: false,
    },
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<TimePickerProps> = ({value, ...args}) => {
    const [val, onChange] = useState(value);

    useEffect(() => onChange(value), [value]);

    // @ts-ignore
    return <TimePickerComponent {...args} value={val} onChange={onChange} />;
};
export const TimePicker = Template.bind({});
TimePicker.storyName = "TimePicker";
