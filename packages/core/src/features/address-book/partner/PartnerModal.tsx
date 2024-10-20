import {Logger, t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {useForm} from "react-hook-form";

import {useDispatch} from "../../../hooks/useDispatch";
import {fetchAddPartner, fetchUpdatePartner} from "../../../redux/actions/partners";
import {getErrorMessagesFromServerError} from "../../../services/errors.service";

import {FormType, getDefaultValues, PartnerForm, schema} from "./PartnerForm";

import type {
    DefaultPartnerValue,
    PartnerCreateInput,
    AdministrativeAddressCreateInput,
    PartnerDetailOutput,
    NotEditablePartnerUpdateInput,
    PartnerUpdateInput,
} from "../../../types/partnerTypes";

type PartnerUpdatePayload =
    | {editable: true; data: PartnerUpdateInput}
    | {editable: false; data: NotEditablePartnerUpdateInput};

type Props = {
    partner?: PartnerDetailOutput | DefaultPartnerValue;
    onSaved: (newPartner: PartnerDetailOutput) => void;
    onClose: () => void;
};

export function PartnerModal({partner, onSaved, onClose}: Props) {
    const dispatch = useDispatch();

    const form = useForm<FormType>({
        defaultValues: getDefaultValues(partner),
        resolver: zodResolver(schema),
    });
    const loading = form.formState.isLoading || form.formState.isSubmitting;
    const disabled = loading;
    const isEdit = !!(partner && "pk" in partner);
    const modalTitle = isEdit
        ? t("components.editCompany", {
              company: partner.name,
          })
        : t("components.addPartner");

    return (
        <Modal
            size="large"
            title={modalTitle}
            id="company-modal"
            data-testid="company-modal"
            onClose={handleClose}
            mainButton={{
                loading,
                disabled,
                onClick: form.handleSubmit(handleSubmit),
                "data-testid": "company-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                disabled,
                "data-testid": "company-modal-cancel-button",
            }}
        >
            <PartnerForm
                isEdit={isEdit}
                form={form}
                canEdit={partner && "can_edit" in partner ? partner?.can_edit : undefined}
            />
        </Modal>
    );

    function handleClose() {
        if (loading) {
            return;
        }
        onClose();
    }

    async function handleSubmit(values: FormType) {
        const {name, remote_id, invoicing_remote_id, vat_number, trade_number, partner_types} =
            values;

        const {address, city, country, postcode, latitude, longitude} =
            values.administrative_address;
        const administrative_address: AdministrativeAddressCreateInput = {
            address,
            city,
            country,
            postcode,
        };
        if (latitude !== null && longitude !== null) {
            administrative_address.latitude = latitude;
            administrative_address.longitude = longitude;
        }
        const allValues: PartnerCreateInput = {
            name,
            administrative_address,
            is_carrier: partner_types.includes("is_carrier"),
            is_shipper: partner_types.includes("is_shipper"),
            vat_number: vat_number ?? "",
            trade_number: trade_number ?? "",
            remote_id: remote_id ?? "",
            notes: "",
            is_invoiceable: partner_types.includes("is_shipper") && !!values.is_invoiceable,
            is_also_a_logistic_point: !!values.is_also_a_logistic_point,
        };
        if (invoicing_remote_id !== null) {
            allValues.invoicing_remote_id = invoicing_remote_id;
        }

        try {
            if (isEdit) {
                let payload: PartnerUpdatePayload;
                if (partner.can_edit) {
                    payload = {editable: true, data: allValues};
                } else {
                    const keys = [
                        "remote_id",
                        "invoicing_remote_id",
                        "account_code",
                        "side_account_code",
                        "notes",
                        "is_carrier",
                        "is_shipper",
                    ];
                    const data = Object.fromEntries(
                        Object.entries(allValues).filter(([key]) => keys.includes(key))
                    );
                    payload = {editable: false, data: data};
                }

                const result: PartnerDetailOutput = await dispatch(
                    fetchUpdatePartner(partner.pk, payload.data)
                );
                onSaved(result);
            } else {
                const result: PartnerDetailOutput = await dispatch(fetchAddPartner(allValues));
                onSaved(result);
            }
            onClose();
        } catch (error) {
            const errorMessage = await getErrorMessagesFromServerError(error);
            if (errorMessage && typeof errorMessage === "string") {
                form.setError("root", {type: "onSubmit", message: errorMessage});
            } else {
                Logger.error("Error during submit", error);
                form.setError("root", {type: "onSubmit", message: t("common.error")});
            }
        }
    }
}
