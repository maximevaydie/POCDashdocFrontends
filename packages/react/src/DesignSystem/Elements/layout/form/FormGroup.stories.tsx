import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";

import {TextInput} from "../../input/text-input/TextInput";

import {FormGroup as FormGroupComponent, FormGroupProps} from "./FormGroup";

export default {
    title: "Web UI/layout/FormGroup",
    component: FormGroupComponent,
    args: {
        noCols: true,
        className: "",
        error: false,
        htmlFor: "htmlFor",
        wideLabel: true,
        label: "label",
        mandatory: true,
        blueMandatory: false,
    },
} as Meta;

const Template: Story<FormGroupProps> = (props) => {
    const [value, setValue] = useState("value");
    return (
        <FormGroupComponent {...props}>
            <TextInput value={value} onChange={setValue} label="input label" type="text" />
        </FormGroupComponent>
    );
};

export const FormGroup = Template.bind({});
