import {t} from "@dashdoc/web-core";
import {Callout, Flex, Icon, Text} from "@dashdoc/web-ui";
import {formatNumber, yup} from "dashdoc-utils";
import {Form, FormikProps, FormikProvider} from "formik";
import React from "react";

import {ApplicationPeriodField} from "./field/ApplicationPeriodField";

export const EMISSION_RATE_VALIDATION_FORM_ID = "emission-rate-validation-form";

type Props = {
    formik: FormikProps<EffectiveForm>;
    previousEmissionRate: number;
    newEmissionRate: number;
};
export function ValidateSubForm({formik, previousEmissionRate, newEmissionRate}: Props) {
    const {effective_start, effective_end} = formik.values;

    return (
        <FormikProvider value={formik}>
            <Form id={EMISSION_RATE_VALIDATION_FORM_ID}>
                <Text>{t("common.checkConsistency")}</Text>
                <Flex mt={3}>
                    <EmissionRateCallout isPrevious value={previousEmissionRate} />
                    <Icon mx={6} scale={2.5} name="thickArrowRight" />
                    <EmissionRateCallout value={newEmissionRate} />
                </Flex>

                {moreThan10Percent() && (
                    <Callout mt={4} variant="warning">
                        {t("carbonFootprint.newRateIsGreaterThan10Percent")}
                    </Callout>
                )}
                <Text mt={4}>{t("carbonFootprint.emissionRateModal.newRateWillApply")}</Text>
                <ApplicationPeriodField
                    start={effective_start}
                    end={effective_end}
                    onUpdate={handleUpdateEffectiveDate}
                    error={formik.errors.effective_start}
                />
            </Form>
        </FormikProvider>
    );

    function handleUpdateEffectiveDate(start: string, end: string) {
        formik.setFieldValue("effective_start", start);
        formik.setFieldValue("effective_end", end);
    }

    function moreThan10Percent() {
        if (previousEmissionRate <= 0.001) {
            return false;
        }
        const difference = Math.abs(newEmissionRate - previousEmissionRate);
        const percent = (difference / previousEmissionRate) * 100;
        return percent > 10;
    }
}

export type EffectiveForm = {
    effective_start: string;
    effective_end: string;
};

export function getEffectiveFormSchema() {
    return yup.object({
        effective_start: yup.string().required(t("common.mandatoryField")),
        effective_end: yup.string().required(t("common.mandatoryField")),
    });
}

function EmissionRateCallout({isPrevious, value}: {isPrevious?: boolean; value: number}) {
    const text = isPrevious
        ? t("carbonFootprint.emissionRateOld")
        : t("carbonFootprint.emissionRateNew");

    return (
        <Flex
            flexDirection="column"
            backgroundColor={isPrevious ? "grey.ultralight" : "blue.ultralight"}
            p={3}
            borderRadius={1}
        >
            <Text color={isPrevious ? "grey.default" : "grey.dark"}>{text}</Text>
            <Text variant="h2" color={isPrevious ? "grey.ultradark" : "blue.dark"}>
                {formatNumber(value, {
                    minimumFractionDigits: 2,
                })}{" "}
                {t("carbonFootprint.emissionRate.unit")}
            </Text>
        </Flex>
    );
}
