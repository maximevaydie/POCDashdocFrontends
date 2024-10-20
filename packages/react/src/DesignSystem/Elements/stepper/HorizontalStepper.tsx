import {Box, StepNumber, theme} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import React, {Fragment} from "react";

interface Props {
    finalStep: number;
    currentStep: number;
    turnToStep: (step: number) => void;
}

export function HorizontalStepper({finalStep, currentStep, turnToStep}: Props) {
    const length = finalStep + 1;
    return (
        <Box
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${finalStep}, min-content 1fr) min-content`,
                gap: "8px",
            }}
            flexGrow={1}
            justifyContent="center"
            alignItems="center"
        >
            {[...Array(length)].map((_, step: number) => {
                const isFilled = step + 1 <= currentStep;
                const isLastStep = step >= finalStep;
                const content = <StepNumber step={step} currentStep={currentStep} />;
                return (
                    <Fragment key={`step-${step}`}>
                        {isFilled ? (
                            <Box
                                alignItems="center"
                                onClick={() => turnToStep(step)}
                                borderRadius={1}
                                style={{
                                    cursor: "pointer",
                                }}
                                minWidth="auto"
                                css={css`
                                    &:hover {
                                        background-color: ${theme.colors.grey.ultralight};
                                        box-shadow: ${theme.shadows.large};
                                    }
                                `}
                            >
                                {content}
                            </Box>
                        ) : (
                            <Box alignItems="center">{content}</Box>
                        )}
                        {!isLastStep && (
                            <HorizontalLine flexGrow={1} size={2} borderColor="blue.ultralight" />
                        )}
                    </Fragment>
                );
            })}
        </Box>
    );
}
