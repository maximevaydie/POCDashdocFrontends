import {Logger, t} from "@dashdoc/web-core";
import {Box, Flex, HorizontalStepper, Modal, Text, toast} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {UpdateEmissionRatePayload} from "app/features/carbon-footprint/types";
import {emissionRatesApiService} from "app/services/carbon-footprint/emissionRateApi.service";
import {TransportOperationCategory} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

import {NEW_EMISSION_RATE_FORM_ID} from "./form/sub-form/UpdateSubForm";
import {EMISSION_RATE_VALIDATION_FORM_ID} from "./form/sub-form/ValidateSubForm";
import {UpdateEmissionRateForm} from "./form/UpdateEmissionRateForm";

type Props = {
    transportOperationCategory: TransportOperationCategory;
    onClose: (didUpdate?: boolean) => void;
};

/**
 * The modal has the responsibility to manage the current step and the final form submission.
 */
export function UpdateEmissionRateModal({transportOperationCategory, onClose}: Props) {
    const [currentStep, setCurrentStep] = useState<0 | 1>(0);
    const [loading, setLoading] = useState(false);

    const steps = [NEW_EMISSION_RATE_FORM_ID, EMISSION_RATE_VALIDATION_FORM_ID];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const formId = steps[currentStep];

    return (
        <Modal
            title={
                <Flex>
                    <Text variant="title">{`${t("carbonFootprint.updateEmissionRateModal.title", {
                        rate: transportOperationCategory.name,
                    })} `}</Text>
                </Flex>
            }
            onClose={onClose}
            mainButton={{
                children: isLastStep ? t("common.finish") : t("common.next"),
                loading: loading,
                form: formId,
                type: "submit",
                "data-testid": "new-emission-rate-main-button",
            }}
            secondaryButton={{
                children: isFirstStep ? t("common.cancel") : t("common.previous"),
                onClick: () => (isFirstStep ? onClose() : setCurrentStep(0)),
                "data-testid": "new-emission-rate-secondary-button",
            }}
            size="medium"
        >
            <Flex justifyContent="center" mb={4}>
                <Box width="182px">
                    <HorizontalStepper
                        currentStep={currentStep}
                        finalStep={steps.length - 1}
                        turnToStep={handleTurnToStep}
                    />
                </Box>
            </Flex>
            <Box minHeight="480px" mt={4}>
                <UpdateEmissionRateForm
                    transportOperationCategory={transportOperationCategory}
                    formId={formId}
                    onSubmit={handleSubmit}
                    onNext={handleNext}
                />
            </Box>
        </Modal>
    );

    function handleNext() {
        if (currentStep === 1) {
            Logger.error("Payload is undefined or null");
        } else {
            setCurrentStep(1);
        }
    }
    async function handleSubmit(
        payload: UpdateEmissionRatePayload
    ): Promise<Record<string, string>> {
        setLoading(true);
        try {
            await emissionRatesApiService.update(transportOperationCategory.uid, payload);
            toast.success(t("carbonFootprint.emissionRateUpdated"));
            onClose(true);
            return {};
        } catch (error) {
            const responseJson = await error.json();
            if (
                error.status === 400 &&
                responseJson?.["non_field_errors"]?.["code"]?.[0] === "invalid_effective_start"
            ) {
                setLoading(false);
                return {
                    effective_start: t("carbonFootprint.invalidEffectiveStart"),
                };
            }

            // Unknown error
            toast.error(t("common.error"));
            return {};
        }
    }

    function handleTurnToStep(step: number) {
        setCurrentStep(step as 0 | 1);
    }
}
