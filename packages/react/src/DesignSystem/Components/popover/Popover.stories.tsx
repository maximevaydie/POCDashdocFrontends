import {Meta, Story} from "@storybook/react/types-6-0";
import {Popover as PopoverComponent} from "base/popover/Popover";
import {Button} from "button/Button";
import React from "react";

export default {
    title: "Web UI/base/Popover",
    component: PopoverComponent,
} as Meta;

const Template: Story = () => (
    <PopoverComponent>
        <PopoverComponent.Trigger>
            <Button> Click to open popover</Button>
        </PopoverComponent.Trigger>
        <PopoverComponent.Content>
            <PopoverComponent.Header title="my title" />
            My popover content
        </PopoverComponent.Content>
    </PopoverComponent>
);

export const Popover = Template.bind({});
