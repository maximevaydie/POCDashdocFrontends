import {Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {SliderInput} from "./SliderInput";
import {InputContainer, Slider} from "./style";

export type SwitchInputProps = {
    "data-testid"?: string;
    value: boolean;
    labelRight?: string | React.ReactNode;
    labelLeft?: string | React.ReactNode;
    onChange: (value: boolean) => void;
    disabled?: boolean;
};

export const SwitchInput = ({
    labelRight,
    labelLeft,
    onChange,
    disabled,
    value,
    ...props
}: SwitchInputProps) => {
    return (
        <Flex alignItems="center">
            {labelLeft && <Text pr={2}>{labelLeft}</Text>}
            <InputContainer>
                <SliderInput
                    disabled={disabled}
                    checked={value}
                    onChange={(event) => onChange(event.target.checked)}
                    data-testid={props["data-testid"] + "-input"}
                />
                <Slider data-testid={props["data-testid"]} />
            </InputContainer>
            {labelRight && <Text pl={2}>{labelRight}</Text>}
        </Flex>
    );
};
