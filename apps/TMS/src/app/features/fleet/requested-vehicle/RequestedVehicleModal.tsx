import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    LoadingWheel,
    Modal,
    ModeDescription,
    ModeTypeSelector,
    NumberInput,
    SwitchInput,
    Text,
    TextInput,
    TooltipWrapper,
    Icon,
    Flex,
} from "@dashdoc/web-ui";
import {getLocale, RequestedVehicle, yup} from "dashdoc-utils";
import {FormikProps, FormikProvider, useFormik} from "formik";
import React, {useCallback, useMemo} from "react";

import {EmissionRateSourceCallout} from "app/features/carbon-footprint/emission-rate/EmissionRateSourceCallout";
import {VehicleEmissionRateSourceSelect} from "app/features/carbon-footprint/field/VehicleEmissionRateSourceSelect";
import {useVehicleEmissionRateSourceOptions} from "app/features/carbon-footprint/useVehicleEmissionRateSourceOptions";
import {
    fetchAddRequestedVehicle,
    fetchUpdateRequestedVehicle,
} from "app/redux/actions/requested-vehicles";
import {useDispatch} from "app/redux/hooks";
import {GenericVehicleEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";

type EmissionRateChoice = "manual" | "from_entry";

interface Values {
    choice: EmissionRateChoice;
    label: string;
    complementary_information: string;
    emission_rate: number;
    generic_emission_rate_uid?: GenericVehicleEmissionRate;
    default_for_carbon_footprint: boolean;
}

type RequestedVehicleModalProps = {
    initialLabel?: string;
    requestedVehicle?: RequestedVehicle;
    onSubmit?: (requestedVehicle: RequestedVehicle) => void;
    onClose: () => void;
};

export function RequestedVehicleModal({
    initialLabel,
    requestedVehicle,
    onClose,
    onSubmit,
}: RequestedVehicleModalProps) {
    const dispatch = useDispatch();

    const emissionRateChoices: ModeDescription<EmissionRateChoice>[] = useMemo(
        () => [
            {
                value: "from_entry",
                label: t("components.requestedVehicle.carbonDatabase"),
                icon: "list",
            },
            {value: "manual", label: t("components.requestedVehicle.manualEntry"), icon: "select"},
        ],
        []
    );
    const schema = useMemo(
        () =>
            yup.object().shape({
                label: yup.string().required(),
                complementary_information: yup.string(),
                default_for_carbon_footprint: yup.boolean(),
                emission_rate: yup.number().required(),
                generic_emission_rate_uid: yup
                    .object()
                    .nullable()
                    .when("choice", {
                        is: "from_entry",
                        then: yup
                            .object()
                            .required(t("components.requestedVehicle.emissionRateSourceRequired"))
                            .nullable(),
                    }),
            }),
        []
    );

    const locale = getLocale();

    const handleSubmit = useCallback(
        async (values: Partial<Values>, formik: FormikProps<Values>) => {
            try {
                let requestedVehicleResponse = null;
                if (requestedVehicle) {
                    requestedVehicleResponse = await dispatch(
                        fetchUpdateRequestedVehicle({
                            uid: requestedVehicle.uid,
                            label: values.label!,
                            complementary_information: values.complementary_information || "",
                            emission_rate: values.emission_rate!,
                            generic_emission_rate_uid:
                                values.generic_emission_rate_uid?.uid || null,
                            default_for_carbon_footprint:
                                values.default_for_carbon_footprint || false,
                        })
                    );
                } else {
                    requestedVehicleResponse = await dispatch(
                        fetchAddRequestedVehicle({
                            label: values.label!,
                            complementary_information: values.complementary_information || "",
                            emission_rate: values.emission_rate!,
                            generic_emission_rate_uid:
                                values.generic_emission_rate_uid?.uid || null,
                            default_for_carbon_footprint:
                                values.default_for_carbon_footprint || false,
                        })
                    );
                }
                onSubmit?.(requestedVehicleResponse);
                onClose();
            } catch (error) {
                formik.setErrors(await getErrorMessagesFromServerError(error));
            }
        },
        [dispatch, onClose, onSubmit, requestedVehicle]
    );

    const formik = useFormik({
        initialValues: {
            choice: "from_entry",
            label: requestedVehicle?.label || initialLabel || "",
            complementary_information: requestedVehicle?.complementary_information || "",
            emission_rate: requestedVehicle?.emission_rate || 0,
            generic_emission_rate_uid: undefined,
            default_for_carbon_footprint: requestedVehicle?.default_for_carbon_footprint || false,
        },
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: schema,
        onSubmit: handleSubmit,
    });

    const {loading: loadingEmissionRate, emissionRateSources} =
        useVehicleEmissionRateSourceOptions(
            (default_generic_emission_rate_uid: string, sources: GenericVehicleEmissionRate[]) => {
                const uid = requestedVehicle
                    ? requestedVehicle.generic_emission_rate_uid
                    : default_generic_emission_rate_uid;

                const emissionRateSource = sources.find((source) => source.uid === uid);
                formik.setFieldValue("generic_emission_rate_uid", emissionRateSource);
                if (emissionRateSource) {
                    formik.setFieldValue("emission_rate", emissionRateSource.value);
                    formik.setFieldValue("choice", "from_entry");
                } else {
                    formik.setFieldValue("choice", "manual");
                }
            }
        );

    return (
        <Modal
            title={
                requestedVehicle
                    ? t("components.requestedVehicle.editTitle")
                    : t("components.requestedVehicle.createTitle")
            }
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
            size="large"
            data-testid="requested-vehicle-modal"
        >
            <FormikProvider value={formik}>
                <Text variant="h1" mb={4}>
                    {t("common.general")}
                </Text>
                <Box mb={4}>
                    <TextInput
                        {...formik.getFieldProps("label")}
                        label={t("components.requestedVehicle.label")}
                        onChange={(label: string) => {
                            formik.setFieldValue("label", label);
                        }}
                        error={formik.errors.label}
                        required
                        autoFocus={!requestedVehicle}
                        data-testid="requested-vehicle-label"
                    />
                </Box>
                <Box mb={4}>
                    <TextInput
                        {...formik.getFieldProps("complementary_information")}
                        label={t("components.complementaryInformation")}
                        onChange={(complementary_information: string) => {
                            formik.setFieldValue(
                                "complementary_information",
                                complementary_information
                            );
                        }}
                        error={formik.errors.complementary_information}
                        data-testid="requested-vehicle-complementary-information"
                    />
                </Box>
                <Text variant="h1" mb={4}>
                    {t("components.requestedVehicle.emissionRate")}
                </Text>
                {loadingEmissionRate ? (
                    <LoadingWheel noMargin={true} />
                ) : (
                    <>
                        <Box mb={4}>
                            <ModeTypeSelector
                                modeList={emissionRateChoices}
                                currentMode={formik.values.choice}
                                setCurrentMode={(choice: EmissionRateChoice) => {
                                    formik.setFieldValue("choice", choice);
                                }}
                            />
                        </Box>
                        {formik.values.choice === "manual" ? (
                            <Box mb={4}>
                                <NumberInput
                                    {...formik.getFieldProps("emission_rate")}
                                    label={t("components.requestedVehicle.emissionRate")}
                                    onChange={(emission_rate: number) => {
                                        formik.setFieldValue("emission_rate", emission_rate);
                                        formik.setFieldValue(
                                            "generic_emission_rate_uid",
                                            undefined
                                        );
                                    }}
                                    units={t("components.requestedVehicle.emissionRateUnit")}
                                    error={formik.errors.emission_rate}
                                    required
                                    key={formik.values.generic_emission_rate_uid?.uid}
                                    data-testid="requested-vehicle-manual-emission-rate"
                                />
                            </Box>
                        ) : (
                            <>
                                <Box mb={4}>
                                    <EmissionRateSourceCallout />
                                </Box>
                                <Box mb={4}>
                                    <VehicleEmissionRateSourceSelect
                                        locale={locale}
                                        required
                                        error={formik.errors.generic_emission_rate_uid}
                                        emissionRateSources={emissionRateSources}
                                        value={formik.values.generic_emission_rate_uid}
                                        onChange={(
                                            generic_emission_rate_uid: GenericVehicleEmissionRate
                                        ) => {
                                            formik.setFieldValue(
                                                "generic_emission_rate_uid",
                                                generic_emission_rate_uid
                                            );
                                            generic_emission_rate_uid &&
                                                formik.setFieldValue(
                                                    "emission_rate",
                                                    generic_emission_rate_uid.value
                                                );
                                        }}
                                        data-testid="requested-vehicle-generic-emission-rate"
                                    />
                                </Box>
                            </>
                        )}
                        <SwitchInput
                            {...formik.getFieldProps("default_for_carbon_footprint")}
                            labelRight={
                                <Flex flexDirection="row">
                                    <Text mr={1}>
                                        {t(
                                            "components.requestedVehicle.defaultForCarbonFootprint"
                                        )}
                                    </Text>
                                    <TooltipWrapper
                                        content={
                                            <>
                                                <Text>
                                                    {t(
                                                        "components.requestedVehicle.defaultForCarbonFootprintTooltipPart1"
                                                    )}
                                                </Text>
                                                <Text mt={2}>
                                                    {t(
                                                        "components.requestedVehicle.defaultForCarbonFootprintTooltipPart2"
                                                    )}
                                                </Text>
                                            </>
                                        }
                                    >
                                        <Icon name="questionCircle" color="blue.default" />
                                    </TooltipWrapper>
                                </Flex>
                            }
                            onChange={(default_for_carbon_footprint: boolean) => {
                                formik.setFieldValue(
                                    "default_for_carbon_footprint",
                                    default_for_carbon_footprint
                                );
                            }}
                        />
                    </>
                )}
            </FormikProvider>
        </Modal>
    );
}
