import {Box, Flex, Text, theme, StepNumber} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Step, TurnToStep} from "features/slot/actions/slot-booking/step/types";
import React from "react";

interface Props {
    step: Step;
    currentStep: Step;
    stepName: string;
    selected: string | null | undefined;
    turnToStep: TurnToStep;
}

export function SidebarStep({step, currentStep, stepName, turnToStep, selected}: Props) {
    const isActive = step === currentStep;
    const isFilled = step + 1 <= currentStep;
    const isLastStep = step === 3;

    return (
        <Box>
            <Flex
                alignItems="center"
                padding={3}
                onClick={() => turnToStep(step)}
                borderRadius={1}
                style={{
                    cursor: "pointer",
                }}
                css={css`
                    &:hover {
                        background-color: ${theme.colors.grey.ultralight};
                        box-shadow: ${theme.shadows.large};
                    }
                `}
            >
                <Box>
                    <StepNumber step={step - 1} currentStep={currentStep - 1} />
                </Box>
                <Box>
                    <Text
                        marginLeft={3}
                        variant={isActive ? "h2" : "body"}
                        color={isActive ? "blue.dark" : "grey.dark"}
                    >
                        {stepName}
                    </Text>

                    <Text marginLeft={3} variant="h1">
                        {selected}
                    </Text>
                </Box>
            </Flex>
            {!isLastStep && (
                <Box
                    backgroundColor={isFilled ? "blue.default" : "blue.ultralight"}
                    marginLeft="27px"
                    marginY={1}
                    width="2px"
                    height="44px"
                />
            )}
        </Box>
    );
}
