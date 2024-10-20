import {t} from "@dashdoc/web-core";
import React, {FC, useState} from "react";

import {ContinuousValuePopover} from "app/features/pricing/tariff-grids/table/actions/components/ContinuousValuePopover";

const getStepError = ({
    newStep,
    allSteps,
    stepIndex,
}: {
    newStep: number | null;
    allSteps: Readonly<number[]>;
    stepIndex: number | null;
}): string | null => {
    if (newStep === null) {
        return t("components.enterANumber");
    }
    if (stepIndex !== null) {
        const step = allSteps[stepIndex];
        if (newStep === step) {
            return null;
        }
        const prevStep: number | undefined = allSteps[stepIndex - 1];
        const nextStep: number | undefined = allSteps[stepIndex + 1];
        if (prevStep !== undefined && prevStep >= newStep) {
            return t("components.pleaseEnterValidStep");
        } else if (nextStep !== undefined && newStep >= nextStep) {
            return t("components.pleaseEnterValidStep");
        }
    } else if (allSteps.includes(newStep)) {
        return t("components.pleaseEnterValidStep");
    }
    return null;
};

const computePreviousStep = (newStep: number | null, allSteps: Readonly<number[]>): number => {
    return Math.max(0, ...allSteps.filter((step) => (newStep === null ? false : step < newStep)));
};

type CreateStepPopoverProps = {
    children: React.ReactElement;
    metricSteps: number[];
    isOpen: boolean;
    onClose: () => unknown;
    onCreate: (value: number) => unknown;
};

export const CreateStepPopover: FC<CreateStepPopoverProps> = ({
    children,
    metricSteps,
    isOpen,
    onClose,
    onCreate,
}) => {
    const [localStep, setLocalStep] = useState<number | null>(null);
    const error = getStepError({newStep: localStep, allSteps: metricSteps, stepIndex: null});
    const prevStep = computePreviousStep(localStep, metricSteps);
    return (
        <ContinuousValuePopover
            title={t("tariffGrids.AddAStep")}
            error={error}
            isOpen={isOpen}
            onClose={onClose}
            onValidate={() => {
                if (localStep === null) {
                    return;
                }
                return onCreate(localStep);
            }}
            onChange={setLocalStep}
            value={localStep}
            valueBelow={prevStep}
            referenceElement={children}
            inputTestId="step-input"
            type="column"
        />
    );
};

type EditStepPopoverProps = {
    children: React.ReactElement;
    metricSteps: number[];
    isOpen: boolean;
    onClose: () => unknown;
    stepIndex: number; // Edit a step when defined, create otherwise.
    onChange: (value: number, stepIndex: number) => unknown;
    onDelete: (stepIndex: number) => unknown; // Useless at creation
};

export const EditStepPopover: FC<EditStepPopoverProps> = ({
    children,
    metricSteps,
    isOpen,
    onClose,
    stepIndex,
    onChange,
    onDelete,
}) => {
    const [localStep, setLocalStep] = useState<number | null>(metricSteps[stepIndex]);
    const error = getStepError({
        newStep: localStep,
        allSteps: metricSteps,
        stepIndex,
    });
    const prevStep = computePreviousStep(localStep, metricSteps);
    return (
        <ContinuousValuePopover
            title={t("tariffGrids.step", {smart_count: stepIndex})}
            error={error}
            isOpen={isOpen}
            onClose={onClose}
            onValidate={() => {
                if (localStep === null) {
                    return;
                }
                return onChange(localStep, stepIndex);
            }}
            onChange={setLocalStep}
            value={localStep}
            valueBelow={prevStep}
            referenceElement={children}
            inputTestId="step-input"
            onDelete={() => onDelete(stepIndex)}
            type="column"
        />
    );
};
