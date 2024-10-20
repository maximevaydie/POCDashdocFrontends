import {Box} from "@dashdoc/web-ui";
import {horizontalBarChart} from "@dashdoc/web-ui/src/bar-chart/bar/horizontal/__mocks__/horizontalBarCharts";
import {HorizontalBarChart} from "@dashdoc/web-ui/src/bar-chart/bar/horizontal/HorizontalBarChart";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";
import {MemoryRouter} from "react-router";

import {Widget as WidgetComponent} from "../Widget";
import {Widgets as WidgetsComponent} from "../Widgets";

export default {
    title: "Web UI/report/Widget",
    component: WidgetComponent,
    args: {
        name: "Distribution Nantes - Rennes",
        tags: ["05/04/2022 - 05/05/2022", "Nantes", "Rennes"],
        count: 13,
        nbWidgets: 6,
    },
} as Meta;

const Template: Story<any> = (args) => (
    <MemoryRouter>
        <Box width="600px" height="400px">
            <WidgetComponent id={0} {...args}>
                <HorizontalBarChart {...horizontalBarChart} thumbnailLimit={6} />
            </WidgetComponent>
        </Box>
    </MemoryRouter>
);

export const Widget = Template.bind({});

const TemplateVariant: Story<any> = (args) => {
    const bartChartWith3Items = {
        ...horizontalBarChart,
        results: horizontalBarChart.results.slice(0, 3),
    };
    return (
        <MemoryRouter>
            <Box width="600px" height="400px">
                <WidgetComponent id={0} {...args}>
                    <HorizontalBarChart {...bartChartWith3Items} thumbnailLimit={6} />
                </WidgetComponent>
            </Box>
        </MemoryRouter>
    );
};

export const WidgetWithXItems = TemplateVariant.bind({});

const TemplateWidgets: Story<any> = (args) => (
    <MemoryRouter>
        <WidgetsComponent>
            {Array.from({length: args.nbWidgets}, (_, i) => (
                <WidgetComponent key={i} id={i} {...args}>
                    <HorizontalBarChart {...horizontalBarChart} thumbnailLimit={6} />
                </WidgetComponent>
            ))}
        </WidgetsComponent>
    </MemoryRouter>
);

export const Widgets = TemplateWidgets.bind({});
