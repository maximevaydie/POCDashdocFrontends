import {Card} from "@dashdoc/web-ui";
import {Story} from "@storybook/react";
import React from "react";

import {cost, delay, noData, punctuality} from "../__mocks__/verticalBarCharts";
import {VerticalChart} from "../types";
import {VerticalBarChart as Component} from "../VerticalBarChart";

export default {
    title: "Web UI/chart/Vertical Bar Chart",
    component: Component,
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
    args: {
        charts: [cost, delay, punctuality, noData],
    },
};

const Template: Story<any> = (args: {charts: VerticalChart[]}) => (
    <>
        {args.charts.map((chart, index) => (
            <Card width={400} padding={3} margin="auto" mt={2} key={index}>
                <Component {...chart} />
            </Card>
        ))}
    </>
);
export const VerticalBarChart = Template.bind({});
