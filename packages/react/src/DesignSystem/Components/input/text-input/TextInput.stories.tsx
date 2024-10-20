import {Box} from "@dashdoc/web-ui";
import {action} from "@storybook/addon-actions";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useEffect, useState} from "react";

import {TextInput as TextInputComponent, TextInputProps} from "./TextInput";

export default {
    title: "Web UI/input/TextInput",
    component: TextInputComponent,
    args: {
        placeholder: "Input placeholder",
        value: "",
        units: "",
        required: false,
        disabled: false,
        error: false,
        warning: false,
        success: false,
    },
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<TextInputProps> = (args) => {
    const [value, setValue] = useState(args.value);

    const onChangeText = useCallback((text: string) => {
        setValue(text);
        action(`change: ${text}`)();
    }, []);

    useEffect(() => {
        setValue(args.value);
    }, [args.value]);

    return <TextInputComponent {...args} value={value} onChange={onChangeText} />;
};

export const TextInput = Template.bind({});
TextInput.storyName = "TextInput";

export const TextInputWithLabel = Template.bind({});
TextInputWithLabel.storyName = "TextInput with Label";
TextInputWithLabel.args = {
    label: "Input label",
};

export const TextInputWithLeftIcon = Template.bind({});
TextInputWithLeftIcon.storyName = "TextInput with left icon";
TextInputWithLeftIcon.args = {
    leftIcon: "search",
};

export const TextInputWithRightIcon = Template.bind({});
TextInputWithRightIcon.storyName = "TextInput with right icon";
TextInputWithRightIcon.args = {
    rightIcon: "truck",
};

export const TextInputWithUnits = Template.bind({});
TextInputWithUnits.storyName = "TextInput with units";
TextInputWithUnits.args = {
    units: "kg",
};
