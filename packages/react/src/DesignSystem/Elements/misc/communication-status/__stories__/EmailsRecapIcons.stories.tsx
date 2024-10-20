import {Meta, Story} from "@storybook/react";
import React from "react";

import {EmailsRecapIcons} from "../index";

export default {
    title: "Web UI/misc/communication status/EmailsRecapIcons",
    component: EmailsRecapIcons,
} as Meta;

const Template: Story<any> = (args) => <EmailsRecapIcons id={0} {...args} />;

export const Default = Template.bind({});
Default.args = {
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
