import {Box, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {DayDensitySample} from "features/profile-portal/manager/zone/zone-column/zone.service";
import React from "react";

import {DayDensity as DayDensityComponent, Props} from "./DayDensity";

const samples: DayDensitySample[] = [
    "unavailable",
    "unavailable",
    10,
    14,
    "unavailable",
    "unavailable",
    0,
    4,
    "unavailable",
    "unavailable",
    "unavailable",
];

const samples2: DayDensitySample[] = [
    "unavailable",
    "unavailable",
    0,
    2,
    10,
    14,
    1,
    3,
    0,
    4,
    13,
    2,
    4,
    3,
    6,
    14,
    5,
    6,
    9,
];
export default {
    title: "flow/features",
    component: DayDensityComponent,
    args: {
        samples,
        loading: false,
        max: 14,
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<Props> = (args) => (
    <Box
        style={{
            display: "grid",
            gridTemplateColumns: `100px  1fr`,
            gap: "10px",
        }}
    >
        <Text>Large bars</Text>
        <Box width="316px">
            <DayDensityComponent {...args} />
        </Box>

        <Text>Medium bars</Text>
        <Box width="316px">
            <DayDensityComponent {...args} samples={samples2} />
        </Box>

        <Text>Tiny bars</Text>
        <Box width="316px">
            <DayDensityComponent {...args} samples={[...samples2, ...samples2]} />
        </Box>

        <Text>XTiny bars</Text>
        <Box width="316px">
            <DayDensityComponent {...args} samples={[...samples2, ...samples2, ...samples2]} />
        </Box>

        <Text>Empty</Text>
        <Box width="316px">
            <DayDensityComponent samples={[]} max={14} loading={false} />
        </Box>

        <Text>Reloading</Text>
        <Box width="316px">
            <DayDensityComponent samples={[]} max={14} loading={true} />
        </Box>
    </Box>
);

export const DayDensity = Template.bind({});
