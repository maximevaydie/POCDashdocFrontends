import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";
import {Value} from "react-phone-number-input";

import {PhoneNumberInput as Component} from ".";

export default {
    title: "Web UI/Input/PhoneNumberInput",
    component: Component,
    args: {
        value: "",
        country: "FR",
        label: "Phone number",
    },
    decorators: [
        (Story) => (
            <Box width={320} height={300}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<any> = (args) => {
    const [value, setValue] = useState(args.value || "");

    return (
        <Component
            label={args.label}
            data-testid="input-phone-number"
            value={value}
            onChange={(phone_number: Value) => setValue(phone_number)}
            defaultCountry={args.country}
            language={args.language}
            error={args.error}
        />
    );
};

export const EmptyFrenchNumber = Template.bind({});
EmptyFrenchNumber.args = {label: "Phone Number", value: "", country: "FR", language: "fr"};

export const FrenchNumber = Template.bind({});
FrenchNumber.args = {label: "Phone Number", value: "+330603742502", country: "FR", language: "fr"};

export const USNumber = Template.bind({});
USNumber.args = {label: "Phone Number", value: "+15555555555", country: "US", language: "en"};

export const InputWithError = Template.bind({});
InputWithError.args = {
    label: "Phone Number",
    value: "+33999999",
    country: "FR",
    language: "fr",
    error: "Ce numéro n'est pas valide",
};
