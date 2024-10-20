import {Box} from "@dashdoc/web-ui";
import {action} from "@storybook/addon-actions";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useEffect, useState} from "react";

import {icons} from "../../../base/icon/constants";
import {AutoCompleteTextInput as AutoCompleteTextInputComponent} from "../AutoCompleteTextInput";
import {AutoCompleteInputProps} from "../types";

export default {
    title: "Web UI/input/AutoCompleteTextInput",
    component: AutoCompleteTextInputComponent,
    args: {
        label: "First Name",
        placeholder: "Input placeholder",
        value: "",
        units: "",
        suggestions: [
            {label: "Ava", value: "Ava", tooltipContent: "Suggested name: Ava"},
            {label: "Bacchus", value: "Bacchus", tooltipContent: "Suggested name: Bacchus"},
            {label: "Caesar", value: "Caesar", tooltipContent: "Suggested name: Caesar"},
            {label: "Dallas", value: "Dallas", tooltipContent: "Suggested name: Dallas"},
            {label: "Edward", value: "Edward", tooltipContent: "Suggested name: Edward"},
            {label: "Felicia", value: "Felicia", tooltipContent: "Suggested name: Felicia"},
            {label: "Gabrielle", value: "Gabrielle", tooltipContent: "Suggested name: Gabrielle"},
            {label: "Hadwin", value: "Hadwin", tooltipContent: "Suggested name: Hadwin"},
            {label: "Ian", value: "Ian", tooltipContent: "Suggested name: Ian"},
            {label: "Jacob", value: "Jacob", tooltipContent: "Suggested name: Jacob"},
            {label: "Kade", value: "Kade", tooltipContent: "Suggested name: Kade"},
            {label: "Larry", value: "Larry", tooltipContent: "Suggested name: Larry"},
            {label: "Malik", value: "Malik", tooltipContent: "Suggested name: Malik"},
            {label: "Nadia", value: "Nadia", tooltipContent: "Suggested name: Nadia"},
            {label: "Ocean", value: "Ocean", tooltipContent: "Suggested name: Ocean"},
            {label: "Pablo", value: "Pablo", tooltipContent: "Suggested name: Pablo"},
            {label: "Quinn", value: "Quinn", tooltipContent: "Suggested name: Quinn"},
            {label: "Rida", value: "Rida", tooltipContent: "Suggested name: Rida"},
            {label: "Sandra", value: "Sandra", tooltipContent: "Suggested name: Sandra"},
            {label: "Taylor", value: "Taylor", tooltipContent: "Suggested name: Taylor"},
            {label: "Usher", value: "Usher", tooltipContent: "Suggested name: Usher"},
            {label: "Velma", value: "Velma", tooltipContent: "Suggested name: Velma"},
            {label: "Wilfrid", value: "Wilfrid", tooltipContent: "Suggested name: Wilfrid"},
            {label: "Xavier", value: "Xavier", tooltipContent: "Suggested name: Xavier"},
            {label: "Yonas", value: "Yonas", tooltipContent: "Suggested name: Yonas"},
            {label: "Zack", value: "Zack", tooltipContent: "Suggested name: Zack"},
        ],
        suggestionsIcon: "magicWand",
        numberOfSuggestions: 5,
        rootId: "react-app",
        "data-testid": "first-name-autocomplete-input",
        required: false,
        disabled: false,
        error: false,
        warning: false,
        success: false,
    },
    argTypes: {
        numberOfSuggestions: {
            description: "Max number of suggestions displayed",
            control: {type: "number"},
        },
        suggestionsIcon: {
            description: "Icon to use beside each suggestion option",
            options: [...Object.keys(icons)],
            control: {type: "select"},
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

const Template: Story<AutoCompleteInputProps<string>> = (args) => {
    const [value, setValue] = useState(args.value);

    const onChangeText = useCallback((text: string) => {
        setValue(text);
        action(`change: ${text}`)();
    }, []);

    useEffect(() => {
        setValue(args.value);
    }, [args.value]);

    return <AutoCompleteTextInputComponent {...args} value={value} onChange={onChangeText} />;
};

export const AutoCompleteTextInput = Template.bind({});
