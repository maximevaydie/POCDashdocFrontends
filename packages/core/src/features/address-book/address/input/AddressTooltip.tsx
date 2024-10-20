import {t} from "@dashdoc/web-core";
import {Address, ExtractedNewAddress} from "dashdoc-utils";
import React from "react";

import {PartnerTooltip} from "../../partner/PartnerTooltip";

import type {ExtractedNewAddressEnriched, OriginalAddressEnriched} from "./types";

export function AddressTooltip({
    address,
}: {
    address: Address | ExtractedNewAddress | OriginalAddressEnriched | ExtractedNewAddressEnriched;
}) {
    let partnerName: string = t("common.notDefined");
    if (
        "company" in address &&
        typeof address.company === "object" &&
        address.company &&
        "name" in address.company &&
        typeof address.company.name === "string"
    ) {
        partnerName = address.company.name ?? "";
    }

    let partnerNotes: string = "";
    if (
        "company" in address &&
        typeof address.company === "object" &&
        address.company &&
        "notes" in address.company &&
        typeof address.company.notes === "string"
    ) {
        partnerNotes = address.company.notes;
    }

    let partnerVatNumber: string = "";
    if (
        "company" in address &&
        typeof address.company === "object" &&
        address.company &&
        "vat_number" in address.company &&
        typeof address.company.vat_number === "string"
    ) {
        partnerVatNumber = address.company.vat_number;
    }

    let partnerInvoicingRemoteId: string = "";
    if (
        "company" in address &&
        typeof address.company === "object" &&
        address.company &&
        "invoicing_remote_id" in address.company &&
        typeof address.company.invoicing_remote_id === "string"
    ) {
        partnerInvoicingRemoteId = address.company.invoicing_remote_id;
    }

    return (
        <PartnerTooltip
            name={partnerName}
            notes={partnerNotes}
            vat_number={partnerVatNumber}
            invoicing_remote_id={partnerInvoicingRemoteId}
        />
    );
}
