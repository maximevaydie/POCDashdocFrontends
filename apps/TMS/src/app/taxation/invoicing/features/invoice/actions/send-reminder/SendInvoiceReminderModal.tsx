import {AnalyticsEvent, analyticsService, utilsService} from "@dashdoc/web-common";
import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Modal, toast, Text} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React from "react";
import {useDispatch, useSelector} from "react-redux";

import {fetchSendInvoiceReminder} from "app/redux/actions/invoices";
import {
    ContactSelectOption,
    ShareToContactsSelect,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/share/ShareToContactSelect";

import type {Invoice, InvoiceReminderPayload} from "app/taxation/invoicing/types/invoice.types";

type SendInvoiceReminderModalProps = {
    invoice: Invoice;
    onClose: () => void;
};

export const SendInvoiceReminderModal = ({invoice, onClose}: SendInvoiceReminderModalProps) => {
    const dispatch = useDispatch();
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    //#region Formik
    const formik = useFormik({
        initialValues: {
            emails: [],
        },
        validationSchema: yup.object().shape({
            emails: yup
                .array()
                // Here we don't use `yup.string().email()` to ensure that all values are emails
                // because we don't want to block submission if there are bad/missing emails.
                // However, validate that we have at least 1 valid email (with `transform().min()`).
                .of(yup.object({label: yup.string(), value: yup.string()}))
                .transform((options: ContactSelectOption[]) =>
                    options.filter((option) =>
                        utilsService.validateEmail(option.value?.trim() ?? "")
                    )
                )
                .min(1, t("common.mandatoryField")),
        }),
        onSubmit: async (values) => {
            const validEmails = values.emails
                .map((option: ContactSelectOption): string => option.value?.trim() ?? "")
                .filter(utilsService.validateEmail);

            const payload: InvoiceReminderPayload = {
                emails: validEmails,
            };

            try {
                await dispatch(fetchSendInvoiceReminder(invoice.uid, payload));

                analyticsService.sendEvent(AnalyticsEvent.invoiceShared, {
                    "is staff": connectedManager?.user.is_staff,
                    "company id": connectedCompany?.pk,
                    "invoice uid": invoice.uid,
                    "is dashdoc invoicing": invoice.is_dashdoc,
                    "sharing method": "email",
                    "invoice status": invoice.status,
                    "added documents": "invoice only",
                    "is reminder": true,
                });
                onClose();
            } catch (error) {
                toast.error(t("common.error"));
            }
        },
    });
    //#endregion Formik

    return (
        <Modal
            title={t("common.sendInvoiceReminder")}
            id="share-shipment-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.sendViaEmail"),
                type: "submit",
                disabled: formik.isSubmitting,
                onClick: formik.submitForm,
            }}
            secondaryButton={{
                children: t("common.cancel"),
                onClick: onClose,
            }}
        >
            <Text mb={2}>{t("invoiceReminderModal.description")}</Text>
            <FormikProvider value={formik}>
                <Form>
                    <Flex flexDirection="column" flex={1} style={{gap: "16px"}}>
                        <ShareToContactsSelect
                            emailType="reminder"
                            debtorCompanyId={invoice.debtor.pk}
                            onChange={(emails) => {
                                formik.setFieldValue("emails", emails);
                            }}
                            emails={formik.values.emails}
                            error={
                                formik.touched.emails
                                    ? (formik.errors.emails as unknown as string)
                                    : null
                            }
                        />
                    </Flex>
                </Form>
            </FormikProvider>
        </Modal>
    );
};
