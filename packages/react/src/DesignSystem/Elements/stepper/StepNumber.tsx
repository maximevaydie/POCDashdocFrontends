import {Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {Circled} from "../circled/Circled";

interface Props {
    step: number; // from 0 to n
    currentStep: number; // [0, n]
}

export function StepNumber({step, currentStep}: Props) {
    const isActive = step === currentStep;
    const isFilled = step + 1 <= currentStep;
    const label = step + 1;

    return (
        <Circled
            borderColor="transparent"
            boxShadow="none"
            backgroundColor={isActive ? "blue.default" : "blue.ultralight"}
        >
            {isFilled ? (
                <Icon name="check" py={2} />
            ) : (
                <Text variant="h1" color={isActive ? "grey.white" : "blue.dark"}>
                    {label}
                </Text>
            )}
        </Circled>
    );
}
