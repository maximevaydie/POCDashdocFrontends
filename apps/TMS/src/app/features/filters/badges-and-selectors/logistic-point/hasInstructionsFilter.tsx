import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export type HasInstructionsQuery = {
    has_instructions?: boolean;
};

export function getHasInstructionsFilter(ignore = false): FilterData<HasInstructionsQuery> {
    return getBooleanChoiceFilter<HasInstructionsQuery>({
        key: "has-instructions",
        testId: "has-instructions",
        label: t("common.instructions"),
        icon: "instructions",
        conditionLabel: `${t("filter.instructions.areProvided").toLowerCase()} / ${t("filter.instructions.areNotProvided").toLowerCase()}`,
        optionsLabels: {
            on: t("filter.instructions.areProvided"),
            off: t("filter.instructions.areNotProvided"),
        },
        badgeOptionsLabels: {
            on: `${t("common.instructions")} ${t("filter.instructions.areProvided").toLowerCase()}`,
            off: `${t("common.instructions")} ${t("filter.instructions.areNotProvided").toLowerCase()}`,
        },
        queryKey: "has_instructions",
        ignore,
    });
}
