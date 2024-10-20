import {t} from "@dashdoc/web-core";
import {getLoadCategoryLabel} from "@dashdoc/web-core";
import {formatVolume} from "@dashdoc/web-core";
import {
    formatNumber,
    loadIsQuantifiable,
    PricingMetricKey,
    PredefinedLoadCategory,
} from "dashdoc-utils";
import sumBy from "lodash.sumby";

import type {Load} from "app/types/transport";

function handleQuantity(category: PredefinedLoadCategory) {
    return ["pallets", "packages", "other", "containers"].includes(category);
}

function handleWeight(category: PredefinedLoadCategory) {
    return [
        "pallets",
        "packages",
        "other",
        "containers",
        "roundwood",
        "bulk",
        "bulk_qualimat",
        "powder_tank",
    ].includes(category);
}

function handleVolume(category: PredefinedLoadCategory) {
    return [
        "pallets",
        "packages",
        "other",
        "containers",
        "roundwood",
        "bulk",
        "bulk_qualimat",
        "powder_tank",
    ].includes(category);
}

function handleLinearMeter(category: PredefinedLoadCategory) {
    return ["pallets", "packages", "other", "roundwood"].includes(category);
}

function handleStere(category: PredefinedLoadCategory) {
    return ["roundwood", "other"].includes(category);
}

function isValid(category: PredefinedLoadCategory, pricingMetricKey: PricingMetricKey): boolean {
    const metricHandlers = {
        QUANTITY: handleQuantity,
        WEIGHT: handleWeight,
        VOLUME: handleVolume,
        LINEAR_METERS: handleLinearMeter,
        STERES: handleStere,
        FLAT: () => true,
        DISTANCE: () => true,
        DURATION: () => true,
        NB_DELIVERIES: () => true,
        NB_ROUNDS: () => true,
    };

    return Object.entries(metricHandlers).some(
        ([metric, handler]) => pricingMetricKey.includes(metric) && handler(category)
    );
}

export const loadService = {
    isValid,
};

export type LoadQuantity = Pick<
    Load,
    "weight" | "volume" | "steres" | "linear_meters" | "volume_display_unit" | "category"
>;

export const getLoadQuantities = (load: LoadQuantity) => {
    const textParts = [];

    if (load.weight) {
        textParts.push(`${formatNumber(load.weight)} kg`); // eslint-disable-line no-irregular-whitespace
    }
    if (load.volume) {
        textParts.push(
            formatVolume(load.volume, {
                unit: (load.volume_display_unit as Load["volume_display_unit"]) ?? "m3",
            })
        );
    }
    if (load.steres) {
        textParts.push(`${formatNumber(load.steres)} st`); // eslint-disable-line no-irregular-whitespace
    }
    if (load.linear_meters) {
        textParts.push(`${formatNumber(load.linear_meters)} ml`); // eslint-disable-line no-irregular-whitespace
    }
    if (textParts.length === 0) {
        return "-";
    } else {
        return textParts.join(", ");
    }
};

export const getLoadsCategoryAndQuantity = (loads: Array<Load>) => {
    const allLoadsWithSameCategory = !loads.some((l) => loads[0].category !== l.category);
    if (loads.length === 0 || !loads[0].category || !allLoadsWithSameCategory) {
        return `${loads.length} ${t("transportsForm.load", {smart_count: loads.length})}`;
    }

    const category = loads[0].category;

    if (loadIsQuantifiable(category)) {
        const quantity = sumBy(loads, (l) => l.quantity || 0);
        const quantifiedCategory = getLoadCategoryLabel(category, quantity).toLocaleLowerCase();
        return `${formatNumber(quantity)} ${quantifiedCategory}`;
    }
    return getLoadCategoryLabel(category);
};
