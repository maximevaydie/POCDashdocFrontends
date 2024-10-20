import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, TextArea} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProps, FormikProvider, useFormik} from "formik";
import React, {FunctionComponent, useCallback, useState} from "react";

import {fetchUpdateInvoiceLineGroupDescription} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

import type {InvoiceLineGroup} from "app/taxation/invoicing/types/invoice.types";

const getValidationSchema = () =>
    yup.object().shape({
        description: yup.string().required(t("common.mandatoryField")),
    });

interface Values {
    description: string;
}

type EditInvoiceLineGroupDescriptionModalProps = {
    invoiceLineGroupId: InvoiceLineGroup["id"];
    onClose: () => void;
};

const EditInvoiceLineGroupDescriptionModal: FunctionComponent<
    EditInvoiceLineGroupDescriptionModalProps
> = (props) => {
    const dispatch = useDispatch();
    const invoiceLineGroup: InvoiceLineGroup = useSelector(
        (state) => state.entities.invoiceLineGroups[props.invoiceLineGroupId]
    );
    const {onClose} = props;
    const [initialValues] = useState<Values>({
        description: invoiceLineGroup.description,
    });

    const handleSubmit = useCallback(
        async (values: Partial<Values>, formik: FormikProps<Values>) => {
            const fetch = await dispatch(
                // @ts-ignore
                fetchUpdateInvoiceLineGroupDescription(invoiceLineGroup.id, values.description)
            );
            if (!fetch.error) {
                return onClose();
            }
            const errorMessages = await getErrorMessagesFromServerError(fetch.error);
            // reformatting error object for formik that wants only one error message string for each field
            const formikErrors = Object.fromEntries(
                Object.entries(errorMessages).map(([k, v]: [string, string[]]) => [
                    k,
                    v.join("\n"),
                ])
            );
            formik.setErrors(formikErrors);
        },
        [dispatch, onClose, invoiceLineGroup]
    );

    const formik = useFormik({
        initialValues,
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: getValidationSchema(),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("invoice.editInvoiceLine")}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "edit-invoice-line-group-description-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "edit-invoice-line-group-description-modal-save",
            }}
            onClose={onClose}
            data-testid="edit-invoice-line-group-description-modal"
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
                            data-testid="edit-invoice-line-group-description-modal-description"
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

export default EditInvoiceLineGroupDescriptionModal;
