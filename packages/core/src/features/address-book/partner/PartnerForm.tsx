import {t} from "@dashdoc/web-core";
import {Box, Callout, ErrorMessage, Text} from "@dashdoc/web-ui";
import React from "react";
import {FormProvider, UseFormReturn} from "react-hook-form";
import {z} from "zod";

import {VAT_NUMBER_REGEX} from "../../../constants/vatNumberValidation";

import {AdministrativeAddressFieldset} from "./components/AdministrativeAddressFieldset";
import {CreationOptionsFieldset} from "./components/CreationOptionsFieldset";
import {GeneralFieldset} from "./components/GeneralFieldset";

import type {DefaultPartnerValue, PartnerDetailOutput} from "../../../types/partnerTypes";

export const schema = z.object({
    name: z.string().nonempty("errors.field_cannot_be_empty"),
    trade_number: z.string().nullable(),
    remote_id: z.string().nullable(), // internal id for the end user
    invoicing_remote_id: z.string().nullable(),
    vat_number: z
        .string()
        .regex(VAT_NUMBER_REGEX, "common.invalidVatNumber")
        .nullable()
        .or(z.string().length(0)),
    partner_types: z.enum(["is_carrier", "is_shipper"]).array().min(0),
    administrative_address: z.object({
        address: z.string(),
        postcode: z.string().nonempty("common.mandatoryField"),
        city: z.string().nonempty("common.mandatoryField"),
        country: z.string().nonempty("common.mandatoryField"),
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
    }),

    display_remote_id: z.boolean(),
    is_also_a_logistic_point: z.boolean().optional(),
    is_invoiceable: z.boolean().optional(),
});
export type FormType = z.infer<typeof schema>;
export function getDefaultValues(partner?: PartnerDetailOutput | DefaultPartnerValue): FormType {
    const partner_types: ("is_carrier" | "is_shipper")[] = [];
    let name = "";
    if (partner) {
        if (partner.name) {
            name = partner.name;
        }
        if (partner.is_carrier) {
            partner_types.push("is_carrier");
        }
        if (partner.is_shipper) {
            partner_types.push("is_shipper");
        }
    }
    if (partner && "pk" in partner) {
        return {
            name,
            trade_number: partner.trade_number,
            remote_id: partner.remote_id,
            vat_number: partner.vat_number,
            invoicing_remote_id: partner.invoicing_remote_id,
            partner_types,
            administrative_address: {
                address: partner.administrative_address?.address,
                postcode: partner.administrative_address?.postcode,
                city: partner.administrative_address?.city,
                country: partner.administrative_address?.country,
                latitude: partner.administrative_address?.latitude,
                longitude: partner.administrative_address?.latitude,
            },
            display_remote_id: false,
        };
    }

    return {
        name,
        trade_number: null,
        remote_id: null,
        vat_number: null,
        invoicing_remote_id: null,
        partner_types,
        administrative_address: {
            address: "",
            postcode: "",
            city: "",
            country: "",
            latitude: null,
            longitude: null,
        },
        display_remote_id: false,
        is_also_a_logistic_point: false,
        is_invoiceable: false,
    };
}

function getCannotEditReasonTranslationKey(
    cannotEditReason: Exclude<PartnerDetailOutput["can_edit"]["cannot_edit_reason"], null>
) {
    switch (cannotEditReason) {
        case "invited_companies_cannot_update_companies":
            return "partnerModal.invitedCompaniesCannotUpdateCompanies";
        case "subscribed_companies_cannot_be_updated_by_other_companies":
            return "partnerModal.subscribedCompaniesCannotBeUpdatedByOtherCompanies";
        case "cannot_update_company_managed_by_another_company":
            return "partnerModal.cannotUpdateCompanyManagedByAnotherCompany";
    }
}

export function PartnerForm({
    form,
    isEdit,
    canEdit,
}: {
    form: UseFormReturn<FormType>;
    isEdit: boolean;
    canEdit?: PartnerDetailOutput["can_edit"];
}) {
    const {formState} = form;
    const canEditCompany = canEdit ? canEdit.value : true;
    return (
        <FormProvider {...form}>
            {canEdit?.cannot_edit_reason && (
                <Callout variant="secondary" iconDisabled mb={5}>
                    <Text variant="h1">
                        {t(getCannotEditReasonTranslationKey(canEdit.cannot_edit_reason))}
                    </Text>
                </Callout>
            )}
            <GeneralFieldset canEditCompany={canEditCompany} />
            <Box mt={5}>
                <AdministrativeAddressFieldset canEditCompany={canEditCompany} />
            </Box>
            {!isEdit && (
                <Box mt={5}>
                    <CreationOptionsFieldset canEditCompany={canEditCompany} />
                </Box>
            )}
            {formState.errors?.root?.message && (
                <Box mt={4}>
                    <ErrorMessage error={formState.errors.root.message} />
                </Box>
            )}
        </FormProvider>
    );
}
