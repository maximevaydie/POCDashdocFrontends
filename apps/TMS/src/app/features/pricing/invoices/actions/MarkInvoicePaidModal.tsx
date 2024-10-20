import {t} from "@dashdoc/web-core";
import {Modal, Text} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {useForm} from "react-hook-form";

import {
    TrackingInvoicePaymentForm,
    TrackingInvoicePaymentFormType,
} from "app/features/pricing/invoices/TrackingInvoicePaymentForm";
import {trackingInvoicePaymentSchema} from "app/services/invoicing/paymentMethod.service";

type Props = {
    debtorId: number;
    onSubmit: (values: TrackingInvoicePaymentFormType) => void;
    onClose: () => void;
};

export function MarkInvoicePaidModal({debtorId, onSubmit, onClose}: Props) {
    const form = useForm<TrackingInvoicePaymentFormType>({
        defaultValues: {
            paid_at: undefined,
            payment_method: undefined,
            payment_notes: undefined,
        },
        resolver: zodResolver(trackingInvoicePaymentSchema),
    });

    const {
        handleSubmit,
        formState: {isSubmitting},
    } = form;

    return (
        <Modal
            title={t("invoice.addPaymentInformation")}
            onClose={onClose}
            mainButton={{
                disabled: isSubmitting,
                children: t("components.markPaid"),
                onClick: handleSubmit(onSubmit),
            }}
            secondaryButton={{}}
        >
            <Text>{t("invoice.paymentInformationNotVisibleByCustomerToInvoice")}</Text>
            <TrackingInvoicePaymentForm form={form} autoSuggestPaymentMethod debtorId={debtorId} />
        </Modal>
    );
}
