import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

type TimeoutQuery = {
    timeout?: boolean;
};
export function getTimeoutFilter(): FilterData<TimeoutQuery> {
    return getBooleanChoiceFilter<TimeoutQuery>({
        key: "timeout",
        testId: "timeout",
        label: "Timeout",
        icon: "alert",
        optionsLabels: {
            on: "Timeout: " + t("common.yes"),
            off: "Timeout: " + t("common.no"),
        },
        queryKey: "timeout",
    });
}
