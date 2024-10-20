import {Meta, Story} from "@storybook/react/types-6-0";
import {startOfDay} from "date-fns";
import React, {useState} from "react";

import {Box} from "../../layout/Box";

import {
    DaysOfWeekPicker as DaysOfWeekPickerComponent,
    DayOfWeek,
    DaysOfWeek,
} from "./DaysOfWeekPicker";

const fiveDayBefore = startOfDay(new Date());
fiveDayBefore.setDate(fiveDayBefore.getDate() - 5);
const fiveDayAfter = startOfDay(new Date());
fiveDayAfter.setDate(fiveDayAfter.getDate() + 5);

export default {
    title: "Web UI/picker/DaysOfWeekPicker",
    component: DaysOfWeekPickerComponent,
    args: {},
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story = () => {
    const [daysOfWeek, setDaysOfWeek] = useState<DaysOfWeek>({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    });
    const handleDaysOfWeekChange = (day: DayOfWeek, status: boolean) => {
        setDaysOfWeek({...daysOfWeek, [day]: status});
    };

    return <DaysOfWeekPickerComponent daysOfWeek={daysOfWeek} onChange={handleDaysOfWeekChange} />;
};
export const DaysOfWeekPicker = Template.bind({});
DaysOfWeekPicker.storyName = "DaysOfWeekPicker";
