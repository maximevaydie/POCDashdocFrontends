import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Modal, Select, Text, SelectOption} from "@dashdoc/web-ui";
import {formatDate, formatNumber, parseAndZoneDate, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {useCallback} from "react";

import {ExistingDraft} from "app/services/invoicing";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type AddToExistingInvoiceModalProps = {
    debtorName: string;
    existingDrafts: ExistingDraft[];
    selectedDraftUid?: Invoice["uid"];
    onClose: () => void;
    onSubmit: (invoiceUid: Invoice["uid"]) => void;
};

type InvoiceOption = {
    value: Invoice["uid"];
    label: string;
    subLabel: string;
    price: string;
};

type AddToExistingInvoiceForm = {
    invoiceUid: string;
};

function AddToExistingInvoiceModal({
    debtorName,
    existingDrafts,
    selectedDraftUid,
    onClose,
    onSubmit,
}: AddToExistingInvoiceModalProps) {
    const handleSubmit = (values: AddToExistingInvoiceForm) => {
        onSubmit(values.invoiceUid);
        onClose();
    };

    const timezone = useTimezone();

    const formik = useFormik<AddToExistingInvoiceForm>({
        initialValues: {
            // @ts-ignore
            invoiceUid: selectedDraftUid ?? null,
        },
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: yup.object().shape({
            invoiceUid: yup.string().required(t("common.mandatoryField")),
        }),
        onSubmit: handleSubmit,
    });

    const existingDraftsOptions: InvoiceOption[] = existingDrafts.map((draftInvoice) => {
        const label = t("components.invoiceWithXTransports", {
            smart_count: draftInvoice.transports_count,
        });
        let subLabel = t("common.invoiceCreatedOnDate", {
            date: formatDate(parseAndZoneDate(draftInvoice.created, timezone), "P"),
        });
        if (draftInvoice.notes) {
            subLabel += " - " + draftInvoice.notes;
        }
        return {
            value: draftInvoice.uid,
            label,
            subLabel,
            price: formatNumber(draftInvoice.price, {
                style: "currency",
                currency: "EUR",
            }),
        };
    });
    const formatOptionLabel = useCallback(({label, subLabel, price}: InvoiceOption) => {
        return (
            <Box>
                <Text color="inherit">
                    {label} : <b>{price}</b>
                </Text>
                <Text lineHeight={0} color="inherit">
                    {subLabel}
                </Text>
            </Box>
        );
    }, []);

    return (
        <Modal
            title={t("invoicingFlow.addToExistingInvoice")}
            id="add-transport-to-existing-invoice-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.select"),
                form: "add-invoice-line-form",
                type: "submit",
                disabled: formik.isSubmitting,
                "data-testid": "add-transport-to-existing-invoice-modal-submit",
            }}
        >
            <Text mb={4}>
                {t("components.addTransportsToExistingInvoiceInstruction", {
                    debtorName: debtorName,
                })}
            </Text>
            <FormikProvider value={formik}>
                <Form id="add-invoice-line-form">
                    <Select
                        required
                        isClearable={false}
                        {...formik.getFieldProps("invoiceUid")}
                        label={t("components.invoice")}
                        value={existingDraftsOptions.find(
                            (option) => option.value === formik.values.invoiceUid
                        )}
                        options={existingDraftsOptions}
                        formatOptionLabel={formatOptionLabel}
                        styles={{
                            valueContainer: (provided, {selectProps: {label}}) => ({
                                ...provided,
                                height: label ? "5em" : "4em",
                            }),
                            singleValue: (provided, {selectProps: {label}}) => ({
                                ...provided,
                                ...(label && {top: "30%"}),
                            }),
                            menu: (provided) => ({
                                ...provided,
                                maxHeight: "400px",
                            }),
                        }}
                        onChange={(option: SelectOption<Invoice["uid"]>) =>
                            formik.setFieldValue("invoiceUid", option.value)
                        }
                        data-testid="add-transport-to-existing-invoice-modal-select"
                    />
                </Form>
            </FormikProvider>
        </Modal>
    );
}

export default AddToExistingInvoiceModal;
