import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {TradeNumberQuery} from "./types";

export function getTradeNumberFilter(): FilterData<TradeNumberQuery> {
    return getBooleanChoiceFilter({
        key: "has_trade_number",
        testId: "has-trade-number",
        label: t("components.tradeNumber"),
        icon: "balance",
        optionsLabels: {
            on: t("addressFilter.hasTradeNumber"),
            off: t("addressFilter.hasNotTradeNumber"),
        },
        queryKey: "has_trade_number",
    });
}
