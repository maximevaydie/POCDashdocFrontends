import {t} from "@dashdoc/web-core";
import {Modal, Text} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {formatDate} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React from "react";
import {useForm} from "react-hook-form";
import {useDispatch} from "react-redux";

import {
    TrackingInvoicePaymentForm,
    TrackingInvoicePaymentFormType,
} from "app/features/pricing/invoices/TrackingInvoicePaymentForm";
import {fetchUpdateTrackingInvoicePayment} from "app/redux/actions";
import {trackingInvoicePaymentSchema} from "app/services/invoicing/paymentMethod.service";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    invoice: Invoice;
    onClose: () => void;
};

export function TrackingInvoicePaymentUpdateModal({invoice, onClose}: Props) {
    const dispatch = useDispatch();

    const form = useForm<TrackingInvoicePaymentFormType>({
        defaultValues: {
            paid_at: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
            payment_method: invoice.payment_method ?? undefined,
            payment_notes: invoice.payment_notes,
        },
        resolver: zodResolver(trackingInvoicePaymentSchema),
    });

    const {
        handleSubmit,
        formState: {isSubmitting},
    } = form;

    return (
        <Modal
            title={t("invoice.modifyPaymentInformation")}
            onClose={onClose}
            mainButton={{
                disabled: isSubmitting,
                onClick: handleSubmit(handleUpdateTrackingInvoicePayment),
            }}
            secondaryButton={{}}
        >
            <Text>{t("invoice.paymentInformationNotVisibleByCustomerToInvoice")}</Text>
            <TrackingInvoicePaymentForm form={form} />
        </Modal>
    );

    async function handleUpdateTrackingInvoicePayment(values: TrackingInvoicePaymentFormType) {
        const paymenMethodUid = values.payment_method
            ? values.payment_method.uid
            : values.payment_method;

        const payload = {
            paid_at: !isNil(values.paid_at)
                ? formatDate(values.paid_at, "yyyy-MM-dd")
                : values.paid_at,
            payment_method_uid: paymenMethodUid,
            payment_notes: values.payment_notes,
        };

        await dispatch(fetchUpdateTrackingInvoicePayment(invoice.uid, payload));
        onClose();
    }
}
