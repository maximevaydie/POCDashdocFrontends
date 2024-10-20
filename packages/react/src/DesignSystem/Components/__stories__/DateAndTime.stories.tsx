import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {DateAndTime as DateAndTimeComponent, DateAndTimeProps} from "../DateAndTime";

const date = new Date();
const dateOneHourMore = new Date();
dateOneHourMore.setHours(dateOneHourMore.getHours() + 1);
const dateOneDayMore = new Date();
dateOneDayMore.setDate(dateOneDayMore.getDate() + 1);
export default {
    title: "Web UI/base/DateAndTime",
    component: DateAndTimeComponent,
    args: {zonedDateTimeMin: date, zonedDateTimeMax: dateOneHourMore, wrap: false},
} as Meta;

const Template: Story<DateAndTimeProps> = (args) => <DateAndTimeComponent {...args} />;

export const DateAndTime = Template.bind({});
export const DateAndTimeWithSameDate = Template.bind({});
DateAndTimeWithSameDate.args = {zonedDateTimeMin: date, zonedDateTimeMax: date};
export const DateAndTimeWithDifferentDate = Template.bind({});
DateAndTimeWithDifferentDate.args = {zonedDateTimeMin: date, zonedDateTimeMax: dateOneDayMore};
