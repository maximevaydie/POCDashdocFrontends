import {t} from "@dashdoc/web-core";
import {Box, Callout, Icon, Link, Text, useHackForEmotionStyle} from "@dashdoc/web-ui";
import {FuelType, yup} from "dashdoc-utils";
import {Form, FormikErrors, FormikProps, FormikProvider} from "formik";
import React from "react";

import {FuelTypeConsumptionInputs} from "app/features/carbon-footprint/field/FuelTypeConsumptionInputs";
import {NullableFuelConsumption} from "app/features/carbon-footprint/types";
import {GenericFuelEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";
import {TransportOperationCategory} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

import {RefPeriodField} from "./field/RefPeriodField";
import {TonneByKilometerField} from "./field/TonneByKilometerField";

export const NEW_EMISSION_RATE_FORM_ID = "new-emission-rate-form";

type Props = {
    formik: FormikProps<RateForm>;
    transportCount: number;
    ignoredTransports: number;
    transportOperationCategory: TransportOperationCategory;
    fuelEmissionRates: Record<FuelType, GenericFuelEmissionRate>;
};
export function UpdateSubForm({
    formik,
    fuelEmissionRates,
    transportCount,
    ignoredTransports,
    transportOperationCategory,
}: Props) {
    const ignoredLinkContent =
        ignoredTransports > 0 ? (
            <>
                {" ("}
                <Link
                    href="/app/transports/?isExtendedSearch=true&tab=results&has_carbon_footprint=false"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("carbonFootprint.emissionRateModal.errorTransportCountLink", {
                        smart_count: ignoredTransports,
                    })}
                    <Icon ml={1} scale={0.8} name="openInNewTab" />
                </Link>
                {")"}
            </>
        ) : null;
    const {hiddenJsx: ignoredLinkHiddenJsx, html: ignoredLinkHtml} =
        useHackForEmotionStyle(ignoredLinkContent);

    const start = formik.values.start;
    const end = formik.values.end;
    const tonneByKilometer = formik.values.tonne_kilometer;
    const fuelConsumptions = formik.values.fuels;

    const tonneKilometerError = formik.errors?.tonne_kilometer;
    const fuelConsumptionErrors = formik.errors?.fuels as
        | undefined
        | FormikErrors<NullableFuelConsumption>[];
    return (
        <FormikProvider value={formik}>
            <Form id={NEW_EMISSION_RATE_FORM_ID}>
                <Text
                    dangerouslySetInnerHTML={{
                        __html: t("carbonFootprint.emissionRateModal.statsPeriod", {
                            rate: transportOperationCategory.name,
                        }),
                    }}
                />
                <RefPeriodField start={start} end={end} onUpdate={handleUpdateRefPeriod} />
                {ignoredLinkHiddenJsx}
                <Text
                    mt={4}
                    dangerouslySetInnerHTML={{
                        __html: t("carbonFootprint.emissionRateModal.involvedTransports", {
                            smart_count: transportCount,
                            ignoredText: ignoredLinkHtml,
                        }),
                    }}
                />
                <TonneByKilometerField
                    value={tonneByKilometer}
                    onUpdate={handleUpdateTonneKilometer}
                    error={tonneKilometerError}
                />
                <Text
                    mt={4}
                    dangerouslySetInnerHTML={{
                        __html: t("carbonFootprint.emissionRateModal.indicatePrimaryEnergy"),
                    }}
                />
                <Box mt={4}>
                    {fuelConsumptions.map((consumption, index) => {
                        const fuelError = fuelConsumptionErrors?.[index]?.fuel;
                        const quantityError = fuelConsumptionErrors?.[index]?.quantity;
                        function handleDelete() {
                            formik.setFieldValue(
                                "fuels",
                                formik.values.fuels.filter((_, i) => i !== index)
                            );
                        }
                        function handleChange(fuel: FuelType, quantity: number) {
                            formik.setFieldValue(`fuels[${index}].fuel`, fuel);
                            formik.setFieldValue(`fuels[${index}].quantity`, quantity);
                        }
                        return (
                            <Box my={2} key={index}>
                                <FuelTypeConsumptionInputs
                                    fuel={consumption.fuel}
                                    quantity={consumption.quantity}
                                    fuelEmissionRates={fuelEmissionRates}
                                    fuelError={fuelError}
                                    quantityError={quantityError}
                                    onChange={handleChange}
                                    onDelete={index <= 0 ? null : handleDelete}
                                />
                            </Box>
                        );
                    })}
                </Box>
                <Box my={2}>
                    <Link onClick={addEmptyFuelConsumption}>
                        {t("carbonFootprint.emissionRateModal.addFuelComsumptionLine")}
                    </Link>
                </Box>
                <Callout mt={6}>{t("common.youCanAlwaysGoBack")}</Callout>
            </Form>
        </FormikProvider>
    );

    function handleUpdateRefPeriod(start: string, end: string) {
        formik.setFieldValue("start", start);
        formik.setFieldValue("end", end);
    }

    function addEmptyFuelConsumption() {
        formik.setFieldValue("fuels", [
            ...formik.values.fuels,
            {
                fuel: null,
                quantity: null,
            },
        ]);
    }

    function handleUpdateTonneKilometer(tonneByKilometer: number) {
        formik.setFieldValue("tonne_kilometer", tonneByKilometer);
    }
}

export type RateForm = {
    start: string;
    end: string;
    tonne_kilometer: number;
    fuels: NullableFuelConsumption[];
};

export function getRateFormSchema() {
    return yup.object().shape({
        start: yup.string().required(t("common.mandatoryField")),
        end: yup.string().required(t("common.mandatoryField")),
        tonne_kilometer: yup
            .number()
            .moreThan(0, t("common.mandatoryField"))
            .required(t("common.mandatoryField")),
        fuels: yup.array().of(
            yup.object({
                fuel: yup
                    .string()
                    .oneOf(["GO", "LNG", "CNG", "EL", "BIO", "BIOCNG"])
                    .required(t("common.mandatoryField")),
                quantity: yup
                    .number()
                    .moreThan(0, t("common.mandatoryField"))
                    .required(t("common.mandatoryField")),
            })
        ),
    });
}
