import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {ReportCreationModal as Component, ReportCreationModalProps} from "./ReportCreationModal";

const Template: Story<ReportCreationModalProps> = (args) => (
    <Box width="900px">
        <Component {...args} />
    </Box>
);

export const ReportCreationModal = Template.bind({});
export default {
    title: "app/features/shipper/report",
    component: Component,
    args: {
        onCreateReport: () => alert(`Report created`),
        isLoading: false,
        onClose: () => alert(`modal closed`),
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
