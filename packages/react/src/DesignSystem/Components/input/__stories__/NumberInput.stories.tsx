import {action} from "@storybook/addon-actions";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useEffect, useState} from "react";

import {NumberInput as NumberInputComponent, NumberInputProps} from "../NumberInput";

export default {
    title: "Web UI/input/NumberInput",
    component: NumberInputComponent,
    args: {
        placeholder: "",
        value: 0,
        required: false,
        disabled: false,
        error: false,
        warning: false,
        success: false,
    },
} as Meta;

const Template: Story<NumberInputProps> = (args) => {
    const [value, setValue] = useState(args.value);

    const onChange = useCallback((number: number | null) => {
        setValue(number);
        action(`change: ${number}`)();
    }, []);

    useEffect(() => {
        setValue(args.value);
    }, [args.value]);

    return <NumberInputComponent {...args} value={value} onChange={onChange} />;
};

export const NumberInput = Template.bind({});
NumberInput.storyName = "NumberInput";

export const NumberInputWithLabel = Template.bind({});
NumberInputWithLabel.storyName = "NumberInput with label";
NumberInputWithLabel.args = {label: "Input label"};

export const NumberInputWithPrecision = Template.bind({});
NumberInputWithPrecision.storyName = "NumberInput with initial and maxDecimals";
NumberInputWithPrecision.args = {label: "Input label", value: 9.59745, maxDecimals: 2};

export const NumberInputWithBounds = Template.bind({});
NumberInputWithBounds.storyName = "NumberInput with bounds";
NumberInputWithBounds.args = {label: "Input label", min: 5, max: 6.8};

export const NumberInputWithBoundsOutOfBound = Template.bind({});
NumberInputWithBoundsOutOfBound.storyName =
    "NumberInput with bounds and out of bound initial value";
NumberInputWithBoundsOutOfBound.args = {
    label: "Input label",
    min: 5,
    max: 6.8,
    value: 9.59745,
    maxDecimals: 2,
};

export const NumberInputWithUnits = Template.bind({});
NumberInputWithUnits.storyName = "NumberInput with units";
NumberInputWithUnits.args = {
    label: "Input label",
    value: 9.59745,
    units: "€",
};
