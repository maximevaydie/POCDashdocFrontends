import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {NetworkMapFilter} from "../filters/NetworkMapFilter";

const Template: Story = (args) => (
    <>
        <NetworkMapFilter
            updateCompanies={args.updateCompanies}
            actualBounds={args.actualBounds}
        />
    </>
);
export const NetworkMapFilterTemplate = Template.bind({});

export default {
    title: "moderation/components/network/NetworkMap",
    component: NetworkMapFilter,
    parameters: {
        backgrounds: {default: "white"},
    },
    args: {
        updateCompanies: () => {},
        actualBounds: {
            _southWest: {
                lat: 0,
                lng: 0,
            },
            _northEast: {
                lat: 0,
                lng: 0,
            },
        },
    },
} as Meta;
