import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export type IsLateQuery = {
    is_late?: boolean;
};

export function getIsLateFilter(ignore = false): FilterData<IsLateQuery> {
    return getBooleanChoiceFilter<IsLateQuery>({
        key: "is-late",
        testId: "is-late",
        label: t("invoices.latePayment"),
        icon: "alert",
        optionsLabels: {
            on: t("common.late"),
            off: t("common.onSchedule"),
        },
        queryKey: "is_late",
        ignore,
    });
}
