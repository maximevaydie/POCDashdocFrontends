import {Meta, Story} from "@storybook/react/types-6-0";
import {Usage, formatDate} from "dashdoc-utils";
import {addDays} from "date-fns";
import React from "react";

import {UsageCallout as UsageCalloutComponent} from "../UsageCallout";

const sampleDateStart = formatDate(new Date(), "yyyy-MM-dd");
const sampleDateEnd = formatDate(addDays(new Date(), 30), "yyyy-MM-dd");

export default {
    title: "app/features/transportation plan/means/subcontract",
    component: UsageCalloutComponent,
    args: {
        category: "transport_subcontracted",
        used: 15,
        limit: 20,
        period_start_date: sampleDateStart,
        period_end_date: sampleDateEnd,
        plan: "unknown",
    },
    argTypes: {
        category: {table: {disable: true}},
        limit: {
            defaultValue: 20,
            options: [5, 15, 20, null],
            control: {
                type: "select",
            },
        },
        used: {
            defaultValue: 15,
            options: [0, 1, 5, 15, 20],
            control: {
                type: "select",
            },
        },
        period_start_date: {
            defaultValue: sampleDateStart,
            description: "The period start date",
            control: {
                type: "text",
            },
        },
        period_end_date: {
            defaultValue: sampleDateEnd,
            description: "The period end date",
            control: {
                type: "text",
            },
        },
        plan: {
            description: "The charbee plan",
            control: {
                type: "text",
            },
        },
    },
} as Meta;

const Template: Story<Usage> = (usage) => <UsageCalloutComponent usage={usage} />;

export const UsageCallout = Template.bind({});
