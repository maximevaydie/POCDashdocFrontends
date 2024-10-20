import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {TransportArchivedQuery} from "./transportArchivedFilter.types";

export function getTransportArchivedFilter(): FilterData<TransportArchivedQuery> {
    return getBooleanChoiceFilter({
        key: "transport-archived",
        testId: "transport-archived",
        label: t("common.archives"),
        icon: "archive",
        optionsLabels: {
            on: t("sidebar.archived"),
            off: t("filter.not.archived"),
        },
        queryKey: "archived",
    });
}
