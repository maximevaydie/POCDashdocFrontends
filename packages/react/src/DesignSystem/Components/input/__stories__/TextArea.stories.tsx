import {Box} from "@dashdoc/web-ui";
import {action} from "@storybook/addon-actions";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useEffect, useState} from "react";

import {TextArea as TextAreaComponent, TextAreaProps} from "../TextArea";

export default {
    title: "Web UI/input/TextArea",
    component: TextAreaComponent,
    args: {placeholder: "TextArea placeholder", value: "", required: false, disabled: false},
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<TextAreaProps> = (args) => {
    const [value, setValue] = useState(args.value);

    const onChangeText = useCallback((text: string) => {
        setValue(text);
        action(`change: ${text}`)();
    }, []);

    useEffect(() => {
        setValue(args.value);
    }, [args.value]);

    return <TextAreaComponent {...args} value={value} onChange={onChangeText} />;
};

export const TextArea = Template.bind({});
TextArea.storyName = "TextArea";

export const TextAreaWithLabel = Template.bind({});
TextAreaWithLabel.storyName = "TextArea with Label";
TextAreaWithLabel.args = {
    label: "TextArea label",
};
