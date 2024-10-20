import {t} from "@dashdoc/web-core";
import React from "react";

export function useLoadsUnits(volumeUnit: "L" | "m3") {
    const unitOptions: Array<{
        label: string;
        value: "weight" | "volume" | "linear_meters" | "quantity";
        unit: string;
    }> = [
        {label: t("components.totalWeight"), value: "weight", unit: t("pricingMetrics.unit.kg")},
        {
            label: t("components.totalVolume"),
            value: "volume",
            unit:
                volumeUnit === "L"
                    ? t("shipment.volumeUnit.L.short")
                    : t("shipment.volumeUnit.m3.short"),
        },
        {
            label: t("components.totalLinearMeters"),
            value: "linear_meters",
            unit: t("pricingMetrics.unit.linearMeters.short"),
        },
        {label: t("components.totalQuantity"), value: "quantity", unit: ""},
    ];
    const [selectedUnit, setSelectedUnit] = React.useState<
        "weight" | "volume" | "linear_meters" | "quantity"
    >(unitOptions[0].value);
    return {unitOptions, selectedUnit, setSelectedUnit};
}
