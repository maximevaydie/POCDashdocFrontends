import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Modal, TextArea, Text} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React from "react";

import {useDispatch} from "app/redux/hooks";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

type FreeTextModal = {
    onClose: () => void;
    initialValue?: string;
    itemUid: string;
    fetchUpdate: (
        itemUid: string,
        payload: SubmitFreeTextPayload
    ) => (dispatch: Function) => Promise<Partial<Invoice> | Partial<CreditNote>>;
};

interface EditFreeTextForm {
    freeText: string;
}
export interface SubmitFreeTextPayload {
    free_text: string;
}

export function FreeTextModal({onClose, initialValue, itemUid, fetchUpdate}: FreeTextModal) {
    const dispatch = useDispatch();
    const formik = useFormik<EditFreeTextForm>({
        initialValues: {
            freeText: initialValue ?? "",
        },
        validationSchema: yup.object().shape({
            freeText: yup.string(),
        }),
        onSubmit: handleSubmit,
    });
    return (
        <Modal
            id="free-text-modal"
            title={initialValue ? t("invoicing.editFreeText") : t("invoicing.addFreeText")}
            onClose={onClose}
            mainButton={{
                loading: formik.isSubmitting,
                onClick: formik.submitForm,
                children: initialValue ? t("common.save") : t("invoicing.addFreeText"),
            }}
            secondaryButton={{
                onClick: onClose,
                children: t("common.cancel"),
            }}
        >
            <TextArea
                value={formik.values.freeText}
                onChange={(value) => formik.setFieldValue("freeText", value as string)}
                placeholder={t("common.typeHere")}
                css={{lineHeight: "24px"}}
                rows={5}
                data-testid="free-text-input"
                autoFocus
            />
            <Text mt={3}>{t("invoicing.freeTextPositionExplanation")}</Text>
        </Modal>
    );

    async function handleSubmit() {
        try {
            await dispatch(fetchUpdate(itemUid, {free_text: formik.values.freeText}));
            onClose();
        } catch (error) {
            Logger.error("An error occurred while updating the free text of the invoice !", error);
        }
    }
}
