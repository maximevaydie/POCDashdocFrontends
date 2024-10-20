import {Meta, Story} from "@storybook/react";
import React from "react";

import {LastEmailStatus} from "../index";

export default {
    title: "Web UI/misc/communication status/LastEmailStatus",
    component: LastEmailStatus,
} as Meta;

const Template: Story<any> = (args) => <LastEmailStatus id={0} {...args} />;

export const Default = Template.bind({});
Default.args = {
    timezone: "Europe/Paris",
    communicationStatuses: [
        {
            pk: "1",
            status: "submitted",
            status_updated_at: "2021-04-28T14:18:00.000Z",
            email: "youpi@test.eu",
        },
        {
            pk: "2",
            status: "delivered",
            status_updated_at: "2021-04-28T15:18:00.000Z",
            email: "yyoupi@test.eu",
        },
        {
            pk: "3",
            status: "bounced",
            status_updated_at: "2021-04-28T16:18:00.000Z",
            email: "yyoupi@test.eu",
        },
    ],
};
