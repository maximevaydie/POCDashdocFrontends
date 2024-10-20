import {getConnectedCompany} from "@dashdoc/web-common";
import {AnalyticsEvent, analyticsService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Modal, Text} from "@dashdoc/web-ui";
import {InvoiceItem, yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React from "react";

import {invoiceLineService} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-line-groups/invoiceLine.service";
import {loadInvoicingConnectorAuthenticated} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

import EditableGasIndexTable from "./editable-gas-index-table";

import type {Invoice, InvoiceLineGroup} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    invoice: Invoice;
    onSubmit: (gasIndexValue: number, gasIndexInvoiceItemUid: string | null) => void;
    onClose: () => void;
};

type AddOrUpdateGasIndexForm = {
    gasIndexValue: number;
    gasIndexInvoiceItem: InvoiceItem;
};

export function EditInvoiceGasIndexModal({invoice, onSubmit, onClose}: Props) {
    const dispatch = useDispatch();
    // aborted in the action if already loading/loaded
    dispatch(loadInvoicingConnectorAuthenticated());

    const invoicingConnector = useSelector((state) => state.invoicingConnector);

    const hasMandatoryGasIndexLine = ["billit", "sage"].includes(
        invoicingConnector?.data_source ?? ""
    );

    const invoiceLineGroups = invoiceLineService.getAllLineGroups(invoice);

    const hasSameGasIndexInfo = (
        expected_gas_index: string,
        expexted_gas_index_invoice_item_uid: string
    ) => {
        return (line_group: InvoiceLineGroup) =>
            line_group.gas_index === expected_gas_index &&
            line_group.gas_index_invoice_item?.uid === expexted_gas_index_invoice_item_uid;
    };
    const initialGasIndexInfo =
        invoiceLineGroups.length > 0 &&
        invoiceLineGroups.every(
            hasSameGasIndexInfo(
                // @ts-ignore
                invoiceLineGroups[0].gas_index,
                invoiceLineGroups[0].gas_index_invoice_item?.uid
            )
        )
            ? {
                  gas_index: invoiceLineGroups[0].gas_index,
                  gas_index_invoice_item: invoiceLineGroups[0].gas_index_invoice_item,
              }
            : {gas_index: "0", gas_index_invoice_item: null};

    const connectedCompany = useSelector(getConnectedCompany);

    const sendAnalyticsEventOnSubmit = () => {
        const gasIndexedLineGroupCount = invoiceLineGroups.filter(
            (line_group) => !!line_group.gas_index && parseFloat(line_group.gas_index) !== 0
        ).length;
        let linesHaveGasIndex;
        if (gasIndexedLineGroupCount === 0) {
            linesHaveGasIndex = "none";
        } else if (gasIndexedLineGroupCount === invoiceLineGroups.length) {
            linesHaveGasIndex = "all";
        } else {
            linesHaveGasIndex = "partial";
        }

        analyticsService.sendEvent(AnalyticsEvent.invoiceGasIndexModalConfirmed, {
            "invoice uid": invoice.uid,
            "lines have gas index": linesHaveGasIndex,
            "company id": connectedCompany?.pk,
        });
    };

    const handleSubmit = async (values: AddOrUpdateGasIndexForm) => {
        sendAnalyticsEventOnSubmit();
        onSubmit(values.gasIndexValue, values.gasIndexInvoiceItem?.uid || null);
        onClose();
    };

    const formik = useFormik<AddOrUpdateGasIndexForm>({
        initialValues: {
            // @ts-ignore
            gasIndexValue: parseFloat(initialGasIndexInfo.gas_index),
            // @ts-ignore
            gasIndexInvoiceItem: initialGasIndexInfo.gas_index_invoice_item,
        },
        validateOnBlur: false,
        validateOnChange: false,
        validationSchema: yup.object().shape({
            gasIndexValue: yup.string().required(t("common.mandatoryField")),
            gas_index_invoice_item: hasMandatoryGasIndexLine
                ? yup
                      .object()
                      .shape({
                          uid: yup.string(),
                      })
                      .required(t("common.mandatoryField"))
                      .nullable()
                : yup
                      .object()
                      .shape({
                          uid: yup.string(),
                      })
                      .nullable(),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("components.addOrUpdateGasIndexModal.title")}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "edit-invoice-gas-index-modal-save",
                children: t("components.addOrUpdateGasIndexModal.apply"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "edit-invoice-gas-index-modal-close",
            }}
            onClose={onClose}
            data-testid="edit-invoice-gas-index-modal"
        >
            <FormikProvider value={formik}>
                <Text mb={5}>{t("components.addOrUpdateGasIndexModal.info")}</Text>
                <EditableGasIndexTable
                    gasIndexValue={formik.values.gasIndexValue}
                    gasIndexInvoiceItem={formik.values.gasIndexInvoiceItem}
                    errors={formik.errors}
                    onUpdateQuantity={(gasIndex: number) => {
                        // @ts-ignore
                        formik.setFieldError("gasIndexValue", null);
                        formik.setFieldValue("gasIndexValue", gasIndex);
                    }}
                    onUpdateGasIndexInvoiceItem={(gasIndexInvoiceItem: InvoiceItem | null) => {
                        // @ts-ignore
                        formik.setFieldError("gasIndexInvoiceItem", null);
                        formik.setFieldValue("gasIndexInvoiceItem", gasIndexInvoiceItem);
                    }}
                />
            </FormikProvider>
        </Modal>
    );
}
