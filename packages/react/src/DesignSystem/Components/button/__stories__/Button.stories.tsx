import {t} from "@dashdoc/web-core";
import {Button as ButtonComponent, ButtonProps, buttonVariants, severities} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

export default {
    title: "Web UI/button/Button",
    component: ButtonComponent,
    args: {
        children: "Button content",
        disabled: false,
        loading: false,
        withConfirmation: false,
    },
    argTypes: {
        theme: {table: {disable: true}},
        as: {table: {disable: true}},
        ["data-testid"]: {table: {disable: true}},
        tracking: {table: {disable: true}},
        variant: {
            options: [undefined, ...Object.keys(buttonVariants)],
            defaultValue: "primary",
            control: {
                type: "select",
            },
        },
        severity: {
            options: [undefined, ...Object.keys(severities)],
            control: {
                type: "select",
            },
        },
        confirmationMessage: {
            defaultValue: t("common.confirmationMessage"),
            control: {
                type: "text",
            },
        },
        confirmationTitle: {
            defaultValue: t("common.warning"),
            control: {
                type: "text",
            },
        },
        confirmationButtonSeverity: {
            options: [undefined, ...Object.keys(severities)],
            control: {
                type: "select",
            },
        },
    },
} as Meta;

const Template: Story<
    ButtonProps & {
        confirmationTitle?: string;
        confirmationButtonSeverity: keyof typeof severities;
    }
> = ({confirmationTitle, confirmationButtonSeverity, ...args}) => (
    <ButtonComponent
        {...args}
        modalProps={{title: confirmationTitle, mainButton: {severity: confirmationButtonSeverity}}}
    />
);

export const Button = Template.bind({});

export const ButtonWithConfirmation = Template.bind({});
ButtonWithConfirmation.args = {withConfirmation: true};
