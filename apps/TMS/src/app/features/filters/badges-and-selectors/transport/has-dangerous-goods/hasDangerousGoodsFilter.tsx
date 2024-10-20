import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export type IsDangerousGoodsQuery = {
    has_dangerous_goods?: boolean;
};

export function getHasDangerousGoodsFilter(): FilterData<IsDangerousGoodsQuery> {
    return getBooleanChoiceFilter<IsDangerousGoodsQuery>({
        key: "has-dangerous-goods",
        testId: "has-dangerous-goods",
        label: t("filters.hasDangerousGoods"),
        icon: "radioactiveCircle",
        optionsLabels: {
            on: t("common.with"),
            off: t("common.without"),
        },
        queryKey: "has_dangerous_goods",
    });
}
