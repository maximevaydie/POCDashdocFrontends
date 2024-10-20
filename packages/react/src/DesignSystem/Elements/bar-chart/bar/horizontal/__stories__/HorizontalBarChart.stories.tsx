import React from "react";

import {horizontalBarChart} from "../__mocks__/horizontalBarCharts";
import {HorizontalBarChart, HorizontalBarChartProps} from "../HorizontalBarChart";

const Template = (args: HorizontalBarChartProps) => <HorizontalBarChart {...args} />;
export const Playground = Template.bind({});
Playground.args = {
    ...horizontalBarChart,
};
Playground.argTypes = {
    title: {
        control: {
            type: "text",
        },
    },
    subtitle: {
        control: {
            type: "text",
        },
    },
    thumbnailLimit: {control: "inline-radio", options: [0, 2, 3, 6, 13]},
    rows: {control: "object"},
};

export const Thumbnail = () => <HorizontalBarChart {...horizontalBarChart} thumbnailLimit={6} />;
Thumbnail.storyName = "Thumbnail";

export const Full = () => <HorizontalBarChart {...horizontalBarChart} />;
Full.storyName = "Full";

export default {
    title: "Web UI/chart/Horizontal Bar Chart",
    component: Playground,
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
};
