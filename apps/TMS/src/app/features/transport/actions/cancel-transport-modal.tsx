import {t} from "@dashdoc/web-core";
import {Box, Modal, Text, TextInput} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {FunctionComponent} from "react";

import {fetchCancelTransport} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";

type CancelTransportModalProps = {
    transportUid: string;
    onClose: () => void;
    refetchTransports?: () => void;
};

const CancelTransportModal: FunctionComponent<CancelTransportModalProps> = ({
    transportUid,
    onClose,
    refetchTransports,
}) => {
    const dispatch = useDispatch();

    const form = useFormik({
        initialValues: {
            cancel_reason: "",
        },
        validationSchema: yup.object().shape({
            cancel_reason: yup.string().required(t("common.mandatoryField")),
        }),
        onSubmit: (values) => {
            try {
                dispatch(fetchCancelTransport(transportUid, values.cancel_reason)).then(() => {
                    refetchTransports?.();
                    onClose();
                });
            } catch (error) {
                form.setFieldError("cancel_reason", error.message);
            }
        },
        validateOnChange: false,
        validateOnBlur: false,
    });

    return (
        <Modal
            title={t("components.cancelTransport")}
            id="order-shipment-modal"
            data-testid="cancel-transport-modal"
            onClose={onClose}
            mainButton={{
                type: "submit",
                disabled: form.isSubmitting,
                form: "cancel-transport-form",
                severity: "danger",
                children: t("components.cancelTransport"),
                "data-testid": "cancel-transport-button",
            }}
            secondaryButton={{}}
        >
            {form.isSubmitting ? (
                <LoadingWheel noMargin={true} />
            ) : (
                <form id="cancel-transport-form" onSubmit={form.handleSubmit} noValidate>
                    <TextInput
                        label={t("components.cancelOrderReason")}
                        aria-label={t("components.cancelOrderReason")}
                        id="decline-comment-input"
                        {...form.getFieldProps("cancel_reason")}
                        onChange={(_value, e) => {
                            // @ts-ignore
                            form.setFieldError("cancel_reason", null);
                            form.handleChange(e);
                        }}
                        error={form.errors.cancel_reason}
                        required
                        data-testid="cancel-reason-input"
                    />
                    <Box mt={4}>
                        <Text>{t("components.cancelTransportNotificationInfoPartOne")}</Text>
                        <Text>{t("components.cancelTransportNotificationInfoPartTwo")}</Text>
                        <Text mt={3}>{t("components.cancelTransportAlert")}</Text>
                    </Box>
                </form>
            )}
        </Modal>
    );
};

export default CancelTransportModal;
