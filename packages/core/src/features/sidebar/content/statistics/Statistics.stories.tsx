import {Box} from "@dashdoc/web-ui";
import {Story} from "@storybook/react/types-6-0";
import React from "react";

import {Statistics as StatisticsComponent, StatisticsProps} from "./Statistics";

export default {
    title: "flow/features",
    component: StatisticsComponent,
    args: {
        slotStatistics: {
            arrived: 12,
            to_come: 20,
            completed: 20,
            total: 52,
        },
    },
};

const Template: Story<StatisticsProps> = (props) => (
    <Box width="370px">
        <StatisticsComponent {...props} />
    </Box>
);

export const Statistics = Template.bind({});
