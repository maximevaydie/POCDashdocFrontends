import {action} from "@storybook/addon-actions";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useEffect, useState} from "react";

import {Checkbox, CheckboxProps} from "../Checkbox";

export default {
    title: "Web UI/choice/Checkbox",
    component: Checkbox,
    args: {label: "Checkbox label", checked: true, error: ""},
} as Meta;

const Template: Story<CheckboxProps> = (args) => {
    const [checked, setChecked] = useState(args.checked);

    const onChange = useCallback((checked: boolean) => {
        setChecked(checked);
        action(`change: ${checked}`)();
    }, []);

    useEffect(() => {
        setChecked(args.checked);
    }, [args.checked]);

    return <Checkbox {...args} checked={checked} onChange={onChange} />;
};

export const Badge = Template.bind({});
