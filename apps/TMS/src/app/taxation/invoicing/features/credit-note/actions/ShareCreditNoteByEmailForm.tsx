import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
    utilsService,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Checkbox, Flex, Text, toast} from "@dashdoc/web-ui";
import {useToggle, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React from "react";

import {fetchShareCreditNote} from "app/redux/actions/creditNotes";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    ContactSelectOption,
    ShareToContactsSelect,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/share/ShareToContactSelect";

import type {CreditNoteStatus} from "app/taxation/invoicing/types/creditNote.types";

type ShareCreditNoteByEmailFormProps = {
    itemUid: string;
    parentItemUid: string | null;
    status: CreditNoteStatus;
    isDashdoc: boolean;
    debtorCompanyId: number;
    onClose: () => void;
};

export function ShareCreditNoteByEmailForm({
    itemUid,
    parentItemUid,
    status,
    isDashdoc,
    debtorCompanyId,
    onClose,
}: ShareCreditNoteByEmailFormProps) {
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    const dispatch = useDispatch();

    const [isSubmittingForm, setIsSubmittingForm, setIsNotSubmittingForm] = useToggle();
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
            setIsSubmittingForm();

            try {
                await dispatch(
                    fetchShareCreditNote(itemUid, {
                        emails: values.emails
                            .map(
                                (option: ContactSelectOption): string => option.value?.trim() ?? ""
                            )
                            .filter(utilsService.validateEmail),
                    })
                );

                analyticsService.sendEvent(AnalyticsEvent.creditNoteShared, {
                    "is staff": connectedManager?.user.is_staff,
                    "company id": connectedCompany?.pk,
                    "credit note uid": itemUid,
                    "invoice uid": parentItemUid,
                    "is dashdoc invoicing": isDashdoc,
                    "sharing method": "email",
                    "credit note status": status,
                });

                setIsNotSubmittingForm();
                onClose();
            } catch (error) {
                setIsNotSubmittingForm();
                toast.error(t("common.error"));
            }
        },
    });

    return (
        <>
            <Text mb={2}>{t("shareCreditNote.withDocs.emailText")}</Text>
            <FormikProvider value={formik}>
                <Form>
                    <ShareToContactsSelect
                        debtorCompanyId={debtorCompanyId}
                        onChange={(emails) => {
                            formik.setFieldValue("emails", emails);
                        }}
                        emails={formik.values.emails}
                        error={
                            formik.touched.emails
                                ? (formik.errors.emails as unknown as string)
                                : null
                        }
                        emailType="share"
                    />
                    <Box mb={2} />
                    <Checkbox label={t("shareCredit.includePdf")} disabled={true} checked={true} />
                    <Flex justifyContent="flex-end" mt={5}>
                        <Button
                            type="button"
                            height={40}
                            ml={2}
                            variant="secondary"
                            onClick={onClose}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            height={40}
                            ml={2}
                            disabled={isSubmittingForm}
                            data-testid="share-via-email-button"
                        >
                            {t("common.sendViaEmail")}
                        </Button>
                    </Flex>
                </Form>
            </FormikProvider>
        </>
    );
}
