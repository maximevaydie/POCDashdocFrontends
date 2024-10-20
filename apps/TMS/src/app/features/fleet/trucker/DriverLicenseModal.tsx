import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    DatePicker,
    Modal,
    SelectOption,
    Text,
    TextInput,
    TextProps,
    toast,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Trucker, yup} from "dashdoc-utils";
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
    driving_license_number: "",
    // @ts-ignore
    driving_license_deadline: null,
    is_rented: false,
    remote_id: "",
};

const FieldSet = Box.withComponent("fieldset");
const FieldSetLegend = styled((props: TextProps) => <Text as="legend" variant="h1" {...props} />)`
    border-bottom: none; // Remove style from bootstrap...
`;

type FormTrucker = Omit<
    Partial<Trucker>,
    "carrier" | "user" | "driving_license_deadline" | "occupational_health_visit_deadline"
> & {
    driving_license_deadline?: Date;
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

export function DriverLicenseModal({trucker, onClose, onSubmitTrucker}: TruckerModalProps) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

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
            driving_license_number: trucker?.driving_license_number || "",
            // @ts-ignore
            driving_license_deadline: trucker?.driving_license_deadline
                ? new Date(trucker?.driving_license_deadline)
                : null,
            // @ts-ignore
            carrier: trucker?.carrier
                ? {value: trucker.carrier.pk, label: trucker.carrier.name}
                : null,
        },
        validationSchema: yup.object().shape({
            driving_license_number: yup.string().nullable(true),
            driving_license_deadline: yup.date().nullable(true),
            is_rented: yup.boolean(),
            remote_id: yup.string().nullable(true),
        }),
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: handleSubmit,
    });

    const _renderDrivingLicenseFormSection = (formik: FormikProps<FormTrucker>) => {
        return (
            <FieldSet>
                <FieldSetLegend>{t("fleet.common.drivingLicenseSection")}</FieldSetLegend>
                <Box mt={3}>
                    <TextInput
                        {...formik.getFieldProps("driving_license_number")}
                        label={t("fleet.common.cardNumber")}
                        data-testid="input-driving-license-number"
                        placeholder={t("common.typeHere")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        error={formik.errors.driving_license_number}
                    />
                </Box>
                <Box mt={3}>
                    <DatePicker
                        label={t("fleet.common.expiryDate")}
                        data-testid="input-driving-license-deadline"
                        placeholder={t("common.typeHere")}
                        onChange={(date) => {
                            formik.setFieldValue("driving_license_deadline", date);
                        }}
                        clearable
                        // @ts-ignore
                        date={formik.values.driving_license_deadline}
                        rootId="react-app-modal-root"
                    />
                </Box>
            </FieldSet>
        );
    };

    return (
        <Modal
            title={
                <Text variant="h1" p={1}>
                    {t("components.licenseModify")}
                </Text>
            }
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                loading: isLoading,
                onClick: formik.submitForm,
                "data-testid": "save-driver-license-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
            }}
            size="medium"
        >
            <Box>
                <FormikProvider value={formik}>
                    <Form>
                        <Box mb={5}>{_renderDrivingLicenseFormSection(formik)}</Box>
                    </Form>
                </FormikProvider>
            </Box>
        </Modal>
    );
}
