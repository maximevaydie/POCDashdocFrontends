import {Meta, Story} from "@storybook/react/types-6-0";
import {Icon} from "base";
import React from "react";

import {EditableField as EditableFieldComponent, EditableFieldProps} from "../EditableField";

export default {
    title: "Web UI/button/Clickabled Region/EditableField",
    component: EditableFieldComponent,
    args: {
        clickable: true,
        label: <h3>Label</h3>,
        value: "my value",
        placeholder: "my placeholder",
        icon: <Icon name="filter" />,
        onClick: () => {},
        alert: false,
        noWrap: false,
        updateButtonLabel: "update action",
    },
} as Meta;

const Template: Story<EditableFieldProps> = (args) => <EditableFieldComponent {...args} />;

export const EditableField = Template.bind({});
