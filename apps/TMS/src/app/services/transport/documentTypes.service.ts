import {t} from "@dashdoc/web-core";
import {MessageDocumentType} from "dashdoc-utils";

export function getDocumentTypeOptions(): {value: MessageDocumentType; label: string}[] {
    return [
        {value: "cmr", label: t("components.CMR")},
        {value: "delivery_note", label: t("components.deliveryNote")},
        {value: "confirmation", label: t("components.transportOrder")},
        {value: "weight_note", label: t("components.weightNote")},
        {value: "invoice", label: t("components.invoice")},
        {value: "washing_note", label: t("components.washingNote")},
        {value: "load_photo", label: t("components.loadPhoto")},
        {value: "waste_manifest", label: t("components.wasteManifest")},
        {value: "holders_swap_note", label: t("components.holdersSwapNote")},
        {value: "", label: t("common.other")},
    ];
}
