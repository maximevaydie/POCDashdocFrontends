import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";
import {Slot} from "types";

import {Props, SlotCard} from "./SlotCard";

export default {
    title: "flow/features/zones/SlotCard",
    component: SlotCard,
} as Meta;

const Template: Story<Props> = (args) => (
    <Box width="316px">
        <SlotCard {...args} />
    </Box>
);

const slot: Slot = {
    id: 1,
    start_time: "2022-01-01T10:00:00Z",
    end_time: "2022-01-01T11:00:00Z",
    company: {pk: 12345, name: "Acme Inc."},
    author: {email: "acme.inc@acme.fr", first_name: "Jean", last_name: "Testeur"},
    owner: {pk: 12345, name: "Acme Inc."},
    references: ["ref1", "ref2"],
    custom_fields: [],
    note: "",
    state: "completed",
    zone: 1,
    cancelled_by: null,
    cancel_company: null,
    cancel_reason: "",
    cancelled_at: null,
    arrived_at: null,
    completed_at: null,
    handled_at: null,
    within_booking_window: true,
};

export const Planned = Template.bind({});
Planned.args = {
    slot: {
        ...slot,
        state: "planned",
    },
};

export const Arrived = Template.bind({});
Arrived.args = {
    slot: {
        ...slot,
        state: "arrived",
    },
};

export const Completed = Template.bind({});
Completed.args = {
    slot: {
        ...slot,
        state: "completed",
    },
};
export const Cancelled = Template.bind({});
Cancelled.args = {
    slot: {
        ...slot,
        state: "cancelled",
    },
};

export const WithNoReferences = Template.bind({});
WithNoReferences.args = {
    slot: {...slot, references: []},
};
