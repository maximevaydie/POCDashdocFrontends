import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Callout as CalloutComponent, CalloutProps, calloutVariants} from "./Callout";

export default {
    title: "Web UI/layout",
    component: CalloutComponent,
    args: {
        children: "This is a callout",
    },
    argTypes: {
        variant: {
            defaultValue: "warning",
            options: Object.keys(calloutVariants),
            control: {
                type: "select",
            },
        },
        iconDisabled: {
            defaultValue: false,
            control: {
                type: "boolean",
            },
        },
    },
} as Meta;

const Template: Story<CalloutProps> = (props) => <CalloutComponent {...props} />;

export const Callout = Template.bind({});
