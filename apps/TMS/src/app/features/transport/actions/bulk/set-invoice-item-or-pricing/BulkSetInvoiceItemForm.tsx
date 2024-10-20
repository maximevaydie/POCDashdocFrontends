import {getErrorMessageFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {InvoiceItem, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React from "react";

import {InvoiceItemSelector} from "app/features/pricing/invoices/invoice-item/InvoiceItemSelector";
import {BulkSetPricingResponse} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetPricingForm";
import {fetchBulkSetInvoiceItem} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

interface BulkSetInvoiceItemFormProps {
    selectedTransportsQuery: SearchQuery;
    setStatus: (status: "pending" | "loading" | "done") => unknown;
    setResult: (
        result: BulkSetInvoiceItemResponse["response"] | BulkSetPricingResponse["response"] | null
    ) => unknown;
}

type BulkSetInvoiceItemForm = {
    invoiceItem: InvoiceItem | null;
};

export type BulkSetInvoiceItemResponse = {
    response: {
        success_count: number;
        failure_count: number;
        errors: {[key in BulkSetInvoiceItemError]: {uid: string; sequential_id: number}[]};
    };
};

// To keep in sync with BulkSetInvoiceItemErrorType in backend
export type BulkSetInvoiceItemError =
    | "transport_without_pricing"
    | "transport_invoiced"
    | "transport_not_done";

export const BulkSetInvoiceItemForm = ({
    selectedTransportsQuery,
    setStatus,
    setResult,
}: BulkSetInvoiceItemFormProps) => {
    const dispatch = useDispatch();

    const handleSubmit = async (values: BulkSetInvoiceItemForm) => {
        const {invoiceItem} = values;

        if (invoiceItem === null || invoiceItem.uid === null) {
            return;
        }

        setStatus("loading");
        try {
            const bulkSetInvoiceItemResponse: BulkSetInvoiceItemResponse = await dispatch(
                fetchBulkSetInvoiceItem(invoiceItem.uid, selectedTransportsQuery)
            );

            setResult(bulkSetInvoiceItemResponse.response);
            setStatus("done");
        } catch (error) {
            const errorMessage = await getErrorMessageFromServerError(error);
            toast.error(errorMessage);
            setStatus("pending");
        }
    };

    const formik = useFormik<BulkSetInvoiceItemForm>({
        initialValues: {
            invoiceItem: null,
        },
        validationSchema: yup.object().shape({
            invoiceItem: yup.mixed().required(t("common.mandatoryField")),
        }),
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: handleSubmit,
    });

    return (
        <FormikProvider value={formik}>
            <Form onSubmit={formik.handleSubmit} id="bulk-set-invoice-item-form">
                <InvoiceItemSelector
                    required
                    shouldAutoFocus={false}
                    onChange={(invoiceItem) => {
                        formik.setFieldError("invoiceItem", undefined);
                        formik.setFieldValue("invoiceItem", invoiceItem);
                    }}
                    selectedInvoiceItem={formik.values.invoiceItem}
                    errorMessage={formik.errors.invoiceItem as string}
                    data-testid="invoice-item-selector"
                />
            </Form>
        </FormikProvider>
    );
};
