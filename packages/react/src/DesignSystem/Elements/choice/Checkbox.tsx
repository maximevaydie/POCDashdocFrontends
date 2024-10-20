import {Flex, Text} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {FunctionComponent, ReactNode, useCallback} from "react";

export type CheckboxProps = Omit<
    React.HTMLProps<HTMLInputElement>,
    "as" | "label" | "onChange"
> & {
    label?: ReactNode;
    onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

const Input = styled("input")({
    cursor: "pointer",
    marginRight: "0.5em !important",
    verticalAlign: "top",
});

// TODO: apply styles
export const Checkbox: FunctionComponent<CheckboxProps> = (props) => {
    // props to be intercepted and not passed to <input />
    const {onChange, label, error, ...inputProps} = props;

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event.target.checked, event);
        },
        [onChange]
    );

    const input = <Input type="checkbox" onChange={handleChange} {...inputProps} />;

    if (!label) {
        return input;
    }

    return (
        <label htmlFor={inputProps.id} style={{marginBottom: 0}}>
            <Flex alignItems="flex-start">
                {input}
                <Flex flexDirection="column">
                    {label && typeof label === "string" ? <Text>{label}</Text> : label}
                    {error && typeof error === "string" && (
                        <Text variant="caption" color="red.default">
                            {error}
                        </Text>
                    )}
                </Flex>
            </Flex>
        </label>
    );
};
