import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useState} from "react";

import {MultilingualInput as Component, MultilingualInputProps} from "./MultilingualInput";

export default {
    title: "Web UI/input",
    component: Component,
    args: {
        locale: "fr",
        value: {fr: "francais", en: "english"},
        defaultValue: {
            fr: "valeur par défaut",
            en: "default value",
            nl: "standaardwaarde",
            de: "Standardwert",
            pl: "wartość domyślna",
        },
    },
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<MultilingualInputProps> = (args) => {
    const [value, setValue] = useState<Record<string, string>>(args.value);

    const onChangeText = useCallback((newValue: Record<string, string>) => {
        setValue(newValue);
    }, []);

    return <Component {...args} value={value} onChange={onChangeText} />;
};

export const MultilingualInput = Template.bind({});
