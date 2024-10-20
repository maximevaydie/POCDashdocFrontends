import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, Text, TextInput, toast} from "@dashdoc/web-ui";
import {getLocale, yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React from "react";

import {VehicleEmissionRateSourceSelect} from "app/features/carbon-footprint/field/VehicleEmissionRateSourceSelect";
import {useVehicleEmissionRateSourceOptions} from "app/features/carbon-footprint/useVehicleEmissionRateSourceOptions";
import {GenericVehicleEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";
import {transportOperationCategoryApiService} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

type AddTransportOperationCategoryForm = {
    name: string;
    generic_emission_rate?: GenericVehicleEmissionRate;
};

type Props = {
    onClose: (didCreate: boolean) => void;
};

export function AddTransportOperationCategoryModal({onClose}: Props) {
    const locale = getLocale();
    const {emissionRateSources} = useVehicleEmissionRateSourceOptions(
        (default_generic_emission_rate_uid, sources) => {
            if (!formik.values.generic_emission_rate) {
                const defaultSource = sources.find(
                    ({uid}) => uid === default_generic_emission_rate_uid
                );
                formik.setFieldValue("generic_emission_rate", defaultSource);
            }
        }
    );

    const handleSubmit = async (values: AddTransportOperationCategoryForm) => {
        if (!values.generic_emission_rate) {
            throw new Error("Emission rate is required"); // Should already be validated by yup
        }

        const payload = {
            name: values.name,
            generic_emission_rate_uid: values.generic_emission_rate.uid,
        };
        try {
            await transportOperationCategoryApiService.post({data: payload});
            toast.success(t("carbonFootprint.transportOperationCategoryCreated"));
            onClose(true);
        } catch (error) {
            toast.error(t("common.error"));
        } finally {
            formik.setSubmitting(false);
        }
    };

    const formik = useFormik<AddTransportOperationCategoryForm>({
        initialValues: {
            name: "",
            generic_emission_rate: undefined,
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: yup.object({
            name: yup.string().required(t("errors.field_cannot_be_empty")),
            generic_emission_rate: yup
                .object({
                    uid: yup.string(),
                    label: yup.string(),
                    emissionRate: yup.number(),
                })
                .typeError(t("errors.field_cannot_be_empty")), // error if value is null,
        }),
        onSubmit: handleSubmit,
    });

    return (
        <FormikProvider value={formik}>
            <Modal
                title={
                    <Flex>
                        <Text variant="title">
                            {t("carbonFootprint.addTransportOperationCategory")}
                        </Text>
                    </Flex>
                }
                onClose={() => onClose(false)}
                mainButton={{
                    onClick: () => formik.submitForm(),
                    disabled: formik.isSubmitting,
                    loading: formik.isSubmitting,
                }}
                data-testid="add-transport-operation-category-modal"
            >
                <Text variant="h2" mb={3}>
                    {t("common.general")}
                </Text>
                <TextInput
                    label={t("common.name")}
                    required={true}
                    value={formik.values.name}
                    error={formik.errors.name}
                    onChange={(e) => {
                        formik.setFieldError("name", undefined);
                        formik.setFieldValue("name", e);
                    }}
                    data-testid="transport-operation-category-name-input"
                />

                <Text variant="h2" my={3}>
                    {t("carbonFootprint.initialEmissionRate")}
                </Text>

                <Text>{t("carbonFootprint.initialEmissionRateDescription")}</Text>

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
            </Modal>
        </FormikProvider>
    );
}
