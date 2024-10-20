import styled from "@emotion/styled";
import {SystemStyleObject} from "@styled-system/css";
import React, {FunctionComponent, ReactNode, useCallback} from "react";

import {themeAwareCss} from "../../utils";

export type RadioProps = Omit<
    React.HTMLProps<HTMLInputElement>,
    "as" | "label" | "name" | "value" | "onChange"
> & {
    label: ReactNode;
    name?: string;
    value?: string;
    "data-testid"?: string;
    onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
    labelProps?: LabelProps;
};

const Input = styled("input")({
    marginRight: "0.5em !important",
    verticalAlign: "top",
});

type LabelProps = Partial<{
    margin: SystemStyleObject | number;
    marginBottom: SystemStyleObject | number;
    fontSize: SystemStyleObject | number;
    lineHeight: SystemStyleObject | number;
}>;

const Label = styled("label")<LabelProps>(({marginBottom = 3, fontSize = 2, lineHeight = 1}) => {
    return themeAwareCss({
        marginBottom,
        color: "grey.ultradark",
        fontSize,
        lineHeight,
    });
});

// TODO: apply styles
export const Radio: FunctionComponent<RadioProps> = (props) => {
    // props to be intercepted and not passed to <input />
    const {onChange, label, labelProps, ...inputProps} = props;

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event.target.value, event);
        },
        [onChange]
    );

    const input = <Input type="radio" onChange={handleChange} {...inputProps} />;

    if (!label) {
        return input;
    }

    return (
        <Label htmlFor={inputProps.id} {...labelProps}>
            {input}
            {label}
        </Label>
    );
};
