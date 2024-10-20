import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    DatePicker,
    Flex,
    Modal,
    Radio,
    RadioProps,
    SelectOption,
    Text,
    TextInput,
    TextProps,
    toast,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Trucker, TruckerAdrLicenseType, yup} from "dashdoc-utils";
import {Form, FormikProps, FormikProvider, useFormik} from "formik";
import omit from "lodash.omit";
import React, {useCallback, useEffect, useState} from "react";

import {
    fetchAddTrucker,
    fetchDebouncedSearchCompanies,
    fetchUpdateTrucker,
} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

const queryName = "trucker-modal";

const truckerDefaultValues: FormTrucker = {
    // @ts-ignore
    carrier: null,
    adr_license_number: "",
    adr_license_type: "",
    // @ts-ignore
    adr_license_deadline: null,
    // @ts-ignore
    carrist_license_deadline: null,
    driver_card_number: "",
    // @ts-ignore
    driver_card_deadline: null,
    cqc_number: "",
    // @ts-ignore
    cqc_original_delivery_date: null,
    // @ts-ignore
    cqc_deadline: null,
    is_rented: false,
    remote_id: "",
};

const FieldSet = Box.withComponent("fieldset");
const FieldSetLegend = styled((props: TextProps) => <Text as="legend" variant="h1" {...props} />)`
    border-bottom: none; // Remove style from bootstrap...
`;

type FormTrucker = Omit<
    Partial<Trucker>,
    | "carrier"
    | "user"
    | "adr_license_deadline"
    | "carrist_license_deadline"
    | "driver_card_deadline"
    | "cqc_original_delivery_date"
    | "cqc_deadline"
> & {
    adr_license_deadline?: Date;
    carrist_license_deadline?: Date;
    driver_card_deadline?: Date;
    cqc_original_delivery_date?: Date;
    cqc_deadline?: Date;
    carrier?: SelectOption<number>;
};

type TruckerModalProps = {
    trucker?: Trucker;
    truckerFirstName?: string;
    onSubmitTrucker?: (trucker: Trucker) => void;
    onClose: () => void;
    truckersUsed?: number;
    truckersSoftLimit?: number;
};

export function CardCertificatesModal({trucker, onClose, onSubmitTrucker}: TruckerModalProps) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const adrLicenseTypeOptions: Record<TruckerAdrLicenseType, RadioProps> = {
        cistern: {
            label: t("fleet.adrLicenseType.cistern"),
            value: "cistern",
            name: "adr_license_type",
        },
        package: {
            label: t("fleet.adrLicenseType.package"),
            value: "package",
            name: "adr_license_type",
        },
        both: {
            label: t("common.both"),
            value: "both",
            name: "adr_license_type",
        },
    };

    useEffect(() => {
        dispatch(
            fetchDebouncedSearchCompanies(queryName, {text: "", category: "carrier"}, 1, true)
        );
    }, []);

    const handleSubmit = useCallback(
        async (values: FormTrucker) => {
            const data = {
                ...omit(values, "unavailability", "events", "carrier"),
                user: {
                    ...trucker?.user,
                },
                carrier: values.carrier?.value,
            };

            try {
                setIsLoading(true);
                const fetchFunction = trucker
                    ? fetchUpdateTrucker.bind(undefined, trucker.pk)
                    : fetchAddTrucker;

                const updatedTrucker: Trucker = await dispatch(fetchFunction(data));
                setIsLoading(false);
                if (onSubmitTrucker) {
                    onSubmitTrucker(updatedTrucker);
                }
                onClose();
            } catch (error) {
                setIsLoading(false);
                const errorMessage = await getErrorMessagesFromServerError(error);
                let genericError = "";

                if ("user" in errorMessage) {
                    delete errorMessage.user;
                }

                for (let key in errorMessage) {
                    if (key in formik.values) {
                        errorMessage[key] = errorMessage[key]?.message ?? errorMessage[key];
                    } else {
                        genericError += `${errorMessage[key]}\n`;
                    }
                }

                if (genericError) {
                    toast.error(genericError);
                }

                formik.setErrors(errorMessage);
                formik.setSubmitting(false);
            }
        },
        [dispatch, onClose, onSubmitTrucker, trucker]
    );

    const formik = useFormik<FormTrucker>({
        initialValues: {
            ...truckerDefaultValues,
            ...omit(trucker, "user", "carrier", "is_rented"),
            is_rented: trucker?.is_rented ?? false, // BUG-2111: if is_rented is null, it blocks the user from submitting the form
            adr_license_number: trucker?.adr_license_number || "",
            adr_license_type: trucker?.adr_license_type || "",
            // @ts-ignore
            adr_license_deadline: trucker?.adr_license_deadline
                ? new Date(trucker?.adr_license_deadline)
                : null,
            // @ts-ignore
            carrist_license_deadline: trucker?.carrist_license_deadline
                ? new Date(trucker?.carrist_license_deadline)
                : null,
            driver_card_number: trucker?.driver_card_number || "",
            // @ts-ignore
            driver_card_deadline: trucker?.driver_card_deadline
                ? new Date(trucker?.driver_card_deadline)
                : null,
            cqc_number: trucker?.cqc_number || "",
            // @ts-ignore
            cqc_original_delivery_date: trucker?.cqc_original_delivery_date
                ? new Date(trucker?.cqc_original_delivery_date)
                : null,
            // @ts-ignore
            cqc_deadline: trucker?.cqc_deadline ? new Date(trucker?.cqc_deadline) : null,
            // @ts-ignore
            carrier: trucker?.carrier
                ? {value: trucker.carrier.pk, label: trucker.carrier.name}
                : null,
        },
        validationSchema: yup.object().shape({
            adr_license_number: yup.string().nullable(true),
            adr_license_type: yup
                .string()
                .oneOf(["cistern", "package", "both", null])
                .nullable(true),
            adr_license_deadline: yup.date().nullable(true),
            carrist_license_deadline: yup.date().nullable(true),
            driver_card_number: yup.string().nullable(true),
            driver_card_deadline: yup.date().nullable(true),
            cqc_number: yup.string().nullable(true),
            cqc_original_delivery_date: yup.date().nullable(true),
            cqc_deadline: yup.date().nullable(true),
            is_rented: yup.boolean(),
            remote_id: yup.string().nullable(true),
        }),
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: handleSubmit,
    });

    const _renderCarristDriverLicenseSection = (formik: FormikProps<FormTrucker>) => {
        return (
            <FieldSet mt={5}>
                <FieldSetLegend>{t("fleet.common.carristLicenseSection")}</FieldSetLegend>
                <Box mt={3}>
                    <DatePicker
                        label={t("fleet.common.expiryDate")}
                        data-testid="input-carrist-license-deadline"
                        placeholder={t("common.typeHere")}
                        onChange={(date) => {
                            formik.setFieldValue("carrist_license_deadline", date);
                        }}
                        clearable
                        // @ts-ignore
                        date={formik.values.carrist_license_deadline}
                        rootId="react-app-modal-root"
                    />
                </Box>
            </FieldSet>
        );
    };

    const _renderDriverCardFormSection = (formik: FormikProps<FormTrucker>) => {
        return (
            <FieldSet>
                <FieldSetLegend>{t("fleet.common.driverCardSection")}</FieldSetLegend>
                <Box mt={3}>
                    <TextInput
                        {...formik.getFieldProps("driver_card_number")}
                        label={t("fleet.common.cardNumber")}
                        data-testid="input-driver-card-number"
                        placeholder={t("common.typeHere")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        error={formik.errors.driver_card_number}
                    />
                </Box>
                <Box mt={3}>
                    <DatePicker
                        label={t("fleet.common.expiryDate")}
                        data-testid="input-driver-card-deadline"
                        placeholder={t("common.typeHere")}
                        onChange={(date) => {
                            formik.setFieldValue("driver_card_deadline", date);
                        }}
                        clearable
                        // @ts-ignore
                        date={formik.values.driver_card_deadline}
                        rootId="react-app-modal-root"
                    />
                </Box>
            </FieldSet>
        );
    };

    const _renderCqcFormSection = (formik: FormikProps<FormTrucker>) => {
        return (
            <FieldSet mt={5}>
                <FieldSetLegend>{t("fleet.common.CqcSection")}</FieldSetLegend>
                <Box mt={3}>
                    <TextInput
                        {...formik.getFieldProps("cqc_number")}
                        label={t("fleet.common.cardNumber")}
                        data-testid="input-cqc-number"
                        placeholder={t("common.typeHere")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        error={formik.errors.cqc_number}
                    />
                </Box>
                <Box mt={3}>
                    <DatePicker
                        label={t("fleet.common.expiryDate")}
                        data-testid="input-cqc-deadline"
                        placeholder={t("common.typeHere")}
                        onChange={(date) => {
                            formik.setFieldValue("cqc_deadline", date);
                        }}
                        clearable
                        // @ts-ignore
                        date={formik.values.cqc_deadline}
                        rootId="react-app-modal-root"
                    />
                </Box>
                <Box mt={3}>
                    <DatePicker
                        label={t("fleet.CQCOriginalDelivery")}
                        data-testid="input-cqc-original-delivery-date"
                        placeholder={t("common.typeHere")}
                        onChange={(date) => {
                            formik.setFieldValue("cqc_original_delivery_date", date);
                        }}
                        clearable
                        // @ts-ignore
                        date={formik.values.cqc_original_delivery_date}
                        rootId="react-app-modal-root"
                    />
                </Box>
            </FieldSet>
        );
    };

    const _renderAdrLicenseFormSection = (
        formik: FormikProps<FormTrucker>,
        adrLicenseTypeOptions: Record<TruckerAdrLicenseType, RadioProps>
    ) => {
        return (
            <FieldSet mt={5}>
                <FieldSetLegend>{t("fleet.common.adrLicenseSection")}</FieldSetLegend>
                <Box mt={3}>
                    <TextInput
                        {...formik.getFieldProps("adr_license_number")}
                        label={t("fleet.common.cardNumber")}
                        data-testid="input-adr-license-number"
                        placeholder={t("common.typeHere")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        error={formik.errors.adr_license_number}
                    />
                </Box>
                <Box mt={3}>
                    <DatePicker
                        label={t("fleet.common.expiryDate")}
                        data-testid="input-adr-license-deadline"
                        placeholder={t("common.typeHere")}
                        onChange={(date) => {
                            formik.setFieldValue("adr_license_deadline", date);
                        }}
                        clearable
                        // @ts-ignore
                        date={formik.values.adr_license_deadline}
                        rootId="react-app-modal-root"
                    />
                </Box>
                <Box mt={3}>
                    <Text mb={3} fontWeight="bold" as="label">
                        {t("fleet.adrLicenseType")}
                    </Text>
                    <Flex style={{gap: "24px"}}>
                        {Object.entries(adrLicenseTypeOptions).map(
                            ([option, {label, value, name}]) => (
                                <Radio
                                    key={option}
                                    name={name}
                                    label={label}
                                    value={value}
                                    onChange={(option: TruckerAdrLicenseType) =>
                                        formik.setFieldValue("adr_license_type", option)
                                    }
                                    checked={formik.values.adr_license_type === option}
                                />
                            )
                        )}
                    </Flex>
                </Box>
            </FieldSet>
        );
    };

    return (
        <Modal
            title={
                <Text variant="h1" p={1}>
                    {t("components.cardCertificatesModify")}
                </Text>
            }
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                loading: isLoading,
                onClick: formik.submitForm,
                "data-testid": "save-cards-certificates-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
            }}
            size="medium"
        >
            <Box>
                <FormikProvider value={formik}>
                    <Form>
                        <Box>
                            {_renderDriverCardFormSection(formik)}
                            {_renderCqcFormSection(formik)}
                            {_renderCarristDriverLicenseSection(formik)}
                            {_renderAdrLicenseFormSection(formik, adrLicenseTypeOptions)}
                        </Box>
                    </Form>
                </FormikProvider>
            </Box>
        </Modal>
    );
}
