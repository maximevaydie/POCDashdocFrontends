import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {VatNumberQuery} from "./types";

export function getVatNumberFilter(): FilterData<VatNumberQuery> {
    return getBooleanChoiceFilter({
        key: "has_vat_number",
        testId: "has-vat-number",
        label: t("components.VATNumber"),
        icon: "balance",
        optionsLabels: {
            on: t("addressFilter.hasVatNumber"),
            off: t("addressFilter.hasNotVatNumber"),
        },
        queryKey: "has_vat_number",
    });
}
