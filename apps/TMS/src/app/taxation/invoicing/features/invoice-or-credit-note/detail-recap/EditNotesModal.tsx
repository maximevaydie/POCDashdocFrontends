import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Box, Modal, Text, TextInput} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useCallback} from "react";

import {useDispatch} from "app/redux/hooks";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

type EditNotesModal = {
    itemUid: string; // invoice or credit note uid
    initialNotes?: string;
    fetchUpdate: (
        itemUid: string,
        payload: EditNotesForm
    ) => (dispatch: Function) => Promise<Partial<Invoice> | Partial<CreditNote>>;
    onClose: () => void;
};

interface EditNotesForm {
    notes: string;
}

export function EditNotesModal({itemUid, initialNotes, fetchUpdate, onClose}: EditNotesModal) {
    const dispatch = useDispatch();

    const handleSubmit = useCallback(
        async (values: EditNotesForm) => {
            try {
                await dispatch(fetchUpdate(itemUid, values));
                onClose();
            } catch (error) {
                Logger.error(
                    "An error occurred while updating the debtor reference of the invoice !",
                    error
                );
            }
        },
        [dispatch, onClose, fetchUpdate, itemUid]
    );

    const formik = useFormik<EditNotesForm>({
        initialValues: {
            notes: initialNotes ?? "",
        },
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: false,
        validationSchema: yup.object().shape({
            notes: yup.string(),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("invoice.NotesModification")}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "edit-invoice-notes-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "edit-invoice-notes-modal-close",
            }}
            onClose={onClose}
            data-testid="edit-invoice-notes-modal"
        >
            <FormikProvider value={formik}>
                <Text mb={5}>{t("invoice.updateNotesInfo")}</Text>
                <Box width={"100%"}>
                    <TextInput
                        {...formik.getFieldProps("notes")}
                        label={t("invoice.notes")}
                        value={formik.values.notes}
                        data-testid="edit-invoice-invoice-notes-input"
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        error={formik.errors.notes}
                    />
                </Box>
            </FormikProvider>
        </Modal>
    );
}
