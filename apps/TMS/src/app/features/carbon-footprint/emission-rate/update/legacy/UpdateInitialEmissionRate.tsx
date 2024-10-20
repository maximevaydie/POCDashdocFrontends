import {t} from "@dashdoc/web-core";
import {Box, toast} from "@dashdoc/web-ui";
import {getLocale, yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {forwardRef, useEffect, useImperativeHandle} from "react";

import {EmissionRateSourceCallout} from "app/features/carbon-footprint/emission-rate/EmissionRateSourceCallout";
import {VehicleEmissionRateSourceSelect} from "app/features/carbon-footprint/field/VehicleEmissionRateSourceSelect";
import {useVehicleEmissionRateSourceOptions} from "app/features/carbon-footprint/useVehicleEmissionRateSourceOptions";
import {GenericVehicleEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";
import {
    TransportOperationCategory,
    transportOperationCategoryApiService,
} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

type UpdateInitialEmissionRateForm = {
    generic_emission_rate?: GenericVehicleEmissionRate;
};

type Props = {
    onClose: (didUpdate: boolean) => void;
    transportOperationCategory: TransportOperationCategory;
    setIsSubmitting: (isSubmitting: boolean) => void;
};

const UpdateInitialEmissionRate = forwardRef(
    ({transportOperationCategory, onClose, setIsSubmitting}: Props, ref) => {
        const locale = getLocale();
        const {emissionRateSources} = useVehicleEmissionRateSourceOptions((_, sources) => {
            const initialEmissionRateUid =
                transportOperationCategory.last_emission_rate.generic_emission_rate_uid;

            if (!formik.values.generic_emission_rate) {
                const initialEmissionRate = sources.find(
                    ({uid}) => uid === initialEmissionRateUid
                );
                formik.setFieldValue("generic_emission_rate", initialEmissionRate);
            }
        });

        const submit = async (values: UpdateInitialEmissionRateForm) => {
            if (!values.generic_emission_rate) {
                throw new Error("Emission rate is required"); // Should already be validated by yup
            }

            const payload = {
                generic_emission_rate_uid: values.generic_emission_rate.uid,
            };
            try {
                await transportOperationCategoryApiService.updateInitialEmissionRate(
                    transportOperationCategory.uid,
                    {
                        data: payload,
                    }
                );
                toast.success(t("carbonFootprint.emissionRateUpdated"));
                onClose(true);
                formik.setSubmitting(false);
            } catch (error) {
                toast.error(t("common.error"));
                formik.setSubmitting(false);
            }
        };

        const formik = useFormik<UpdateInitialEmissionRateForm>({
            initialValues: {
                generic_emission_rate: undefined,
            },
            validateOnBlur: false,
            validateOnChange: false,
            validationSchema: yup.object({
                generic_emission_rate: yup
                    .object({
                        uid: yup.string(),
                        label: yup.string(),
                        emissionRate: yup.number(),
                    })
                    .typeError(t("errors.field_cannot_be_empty")), // error if value is null,
            }),
            onSubmit: submit,
        });

        useImperativeHandle(ref, () => {
            return {submit: formik.submitForm};
        });

        useEffect(() => {
            setIsSubmitting(formik.isSubmitting);
        }, [setIsSubmitting, formik.isSubmitting]);

        return (
            <FormikProvider value={formik}>
                <EmissionRateSourceCallout />

                <Box mt={3}>
                    <VehicleEmissionRateSourceSelect
                        locale={locale}
                        required
                        error={formik.errors.generic_emission_rate}
                        emissionRateSources={emissionRateSources}
                        value={formik.values.generic_emission_rate}
                        onChange={(generic_emission_rate: GenericVehicleEmissionRate) => {
                            formik.setFieldError("generic_emission_rate", undefined);
                            formik.setFieldValue("generic_emission_rate", generic_emission_rate);
                        }}
                        label={t("carbonFootprint.initialEmissionRate")}
                    />
                </Box>
            </FormikProvider>
        );
    }
);

UpdateInitialEmissionRate.displayName = "UpdateInitialEmissionRate";
export {UpdateInitialEmissionRate};
