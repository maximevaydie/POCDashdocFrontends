import {t} from "@dashdoc/web-core";
import {Button, Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC, useState} from "react";

import {ContinuousValuePopover} from "app/features/pricing/tariff-grids/table/actions/components/ContinuousValuePopover";

const getDistanceError = ({
    newDistanceStepNumber: newDistanceStep,
    allDistanceStepsNumbers: allDistanceSteps,
    stepIndex,
}: {
    newDistanceStepNumber: number | null;
    allDistanceStepsNumbers: Readonly<number[]>;
    stepIndex: number | null;
}): string | null => {
    if (newDistanceStep === null) {
        return t("components.enterANumber");
    }
    if (stepIndex !== null) {
        const step = allDistanceSteps[stepIndex];
        if (newDistanceStep === step) {
            return null;
        }
        const prevDistanceStep: number | undefined = allDistanceSteps[stepIndex - 1];
        const nextDistanceStep: number | undefined = allDistanceSteps[stepIndex + 1];
        if (prevDistanceStep !== undefined && prevDistanceStep >= newDistanceStep) {
            return t("components.pleaseEnterValidStep");
        } else if (nextDistanceStep !== undefined && newDistanceStep >= nextDistanceStep) {
            return t("components.pleaseEnterValidStep");
        }
    } else if (allDistanceSteps.includes(newDistanceStep)) {
        return t("components.pleaseEnterValidStep");
    }
    return null;
};

const computePreviousDistanceStep = (
    newDistanceStep: number | null,
    allDistanceSteps: Readonly<number[]>
): number => {
    return Math.max(
        0,
        ...allDistanceSteps.filter((step) =>
            newDistanceStep === null ? false : step < newDistanceStep
        )
    );
};

type CreateDistanceStepPopoverProps = {
    children: React.ReactElement;
    distanceSteps: string[];
    isOpen: boolean;
    onClose: () => unknown;
    onCreate: (value: string) => unknown;
};

export const CreateDistanceStepPopover: FC<CreateDistanceStepPopoverProps> = ({
    children,
    distanceSteps,
    isOpen,
    onClose,
    onCreate,
}) => {
    const [localStep, setLocalStep] = useState<number | null>(null);
    const numberDistanceList: number[] = distanceSteps.map(parseFloat);
    const error = getDistanceError({
        newDistanceStepNumber: localStep,
        allDistanceStepsNumbers: numberDistanceList,
        stepIndex: null,
    });
    const prevStep = computePreviousDistanceStep(localStep, numberDistanceList);
    return (
        <ContinuousValuePopover
            title={t("tariffGrids.addALine")}
            error={error}
            isOpen={isOpen}
            onClose={onClose}
            onValidate={() => {
                if (localStep === null) {
                    return;
                }
                return onCreate(localStep.toString());
            }}
            onChange={setLocalStep}
            value={localStep}
            valueBelow={prevStep}
            referenceElement={children}
            inputTestId="step-input"
            type="line"
        />
    );
};

type EditDistanceStepPopoverProps = {
    children: React.ReactElement;
    distanceSteps: string[];
    isOpen: boolean;
    onClose: () => unknown;
    stepIndex: number; // Edit a step when defined, create otherwise.
    onChange: (value: string, stepIndex: number) => unknown;
    onDelete: (stepIndex: number) => unknown; // Useless at creation
};

export const EditDistanceStepPopover: FC<EditDistanceStepPopoverProps> = ({
    children,
    distanceSteps,
    isOpen,
    onClose,
    stepIndex,
    onChange,
    onDelete,
}) => {
    const [localDistanceStep, setLocalDistanceStep] = useState<number | null>(
        parseFloat(distanceSteps[stepIndex])
    );
    const numberDistanceList: number[] = distanceSteps.map(parseFloat);
    const error = getDistanceError({
        newDistanceStepNumber: localDistanceStep,
        allDistanceStepsNumbers: numberDistanceList,
        stepIndex,
    });
    const prevStep = computePreviousDistanceStep(localDistanceStep, numberDistanceList);
    return (
        <ContinuousValuePopover
            title={t("tariffGrids.line", {smart_count: stepIndex})}
            error={error}
            isOpen={isOpen}
            onClose={onClose}
            onValidate={() => {
                if (localDistanceStep === null) {
                    return;
                }
                return onChange(localDistanceStep.toString(), stepIndex);
            }}
            onChange={setLocalDistanceStep}
            value={localDistanceStep}
            valueBelow={prevStep}
            referenceElement={children}
            inputTestId="step-input"
            onDelete={() => onDelete(stepIndex)}
            type="line"
        />
    );
};

export const CreateDistanceStepAction: FC<{
    distanceSteps: string[];
    onCreate: (value: string) => unknown;
}> = ({distanceSteps, onCreate}) => {
    const [isOpen, open, close] = useToggle();
    return (
        <Flex>
            <CreateDistanceStepPopover
                isOpen={isOpen}
                onClose={close}
                distanceSteps={distanceSteps}
                onCreate={onCreate}
            >
                <Button
                    variant={"plain"}
                    onClick={open}
                    data-testid={"create-distance-step-button"}
                >
                    {t("tariffGrids.addALine")}
                </Button>
            </CreateDistanceStepPopover>
        </Flex>
    );
};
