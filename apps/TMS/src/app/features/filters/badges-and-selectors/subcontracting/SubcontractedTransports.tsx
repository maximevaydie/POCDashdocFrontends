import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export type IsSubcontractedTransport = {
    subcontracted_transports?: boolean;
};
export function getSubcontractedTransportsFilter(): FilterData<IsSubcontractedTransport> {
    return getBooleanChoiceFilter<IsSubcontractedTransport>({
        key: "subcontracted_transport",
        testId: "subcontracted_transport",
        label: t("chartering.title"),
        icon: "charter",
        optionsLabels: {
            on: t("common.charteredTransport"),
            off: t("common.nonCharteredTransport"),
        },
        queryKey: "subcontracted_transports",
    });
}
