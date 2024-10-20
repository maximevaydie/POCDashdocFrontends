import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, TextArea} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useCallback} from "react";

type InvoiceMergedLineGroupDescriptionModalProps = {
    initialDescription: string;
    onSubmit: (newDescription: string) => Promise<void>;
    onClose: () => void;
};

const getValidationSchema = () =>
    yup.object().shape({
        description: yup.string().required(t("common.mandatoryField")),
    });

export const InvoiceMergedLineGroupDescriptionModal = ({
    initialDescription,
    onSubmit,
    onClose,
}: InvoiceMergedLineGroupDescriptionModalProps) => {
    const handleSubmit = useCallback(
        async (values: Partial<{description: string}>) => {
            await onSubmit(values.description!);
        },
        [onSubmit]
    );

    const formik = useFormik({
        initialValues: {description: initialDescription},
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: getValidationSchema(),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("invoice.editMergedLineGroupDescription")}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "edit-invoice-merged-line-group-description-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "edit-invoice-merged-line-group-description-modal-save",
            }}
            onClose={onClose}
            data-testid="edit-invoice-merged-line-group-description-modal"
        >
            <FormikProvider value={formik}>
                <Flex>
                    <Box mb={2} flexGrow={2}>
                        <TextArea
                            height={200}
                            {...formik.getFieldProps("description")}
                            label={t("common.description")}
                            // @ts-ignore
                            value={formik.values.description}
                            data-testid="edit-invoice-merged-line-group-description-modal-description"
                            onChange={(_, e) => {
                                formik.handleChange(e);
                            }}
                            error={formik.errors.description}
                        />
                    </Box>
                </Flex>
            </FormikProvider>
        </Modal>
    );
};
