import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import React from "react";

import {useSelector} from "app/redux/hooks";

import {UpdateReferenceList} from "../../address/reference/list/update-reference-list";

type Props = {
    field: "carrier" | "shipper" | "destination" | "origin";
    confirmationExtractedCodes?: string[];
    reference: string | null;
    referenceCompanyPk: number | null;
    onChange: (reference: string) => void;
};

export function ReferenceField({
    field,
    onChange,
    reference,
    referenceCompanyPk,
    confirmationExtractedCodes,
}: Props) {
    const company = useSelector(getConnectedCompany);
    if (
        company?.settings?.constrain_reference_edition &&
        field === "carrier" &&
        (referenceCompanyPk === null || referenceCompanyPk !== company.pk)
    ) {
        return null;
    }

    const labels = {
        carrier: t("transportsForm.carrierReference"),
        shipper: t("transportsForm.shipperReference"),
        origin: t("common.reference"),
        destination: t("common.reference"),
    };
    return (
        <Box mt={3}>
            <UpdateReferenceList
                onChange={onChange}
                reference={reference || ""}
                data-testid={`input-reference-${field}`}
                label={labels[field]}
                confirmationExtractedCodes={confirmationExtractedCodes}
            />
        </Box>
    );
}
