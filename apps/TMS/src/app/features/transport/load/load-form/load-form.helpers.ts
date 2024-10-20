import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {SimpleOption} from "@dashdoc/web-ui";
import {
    Company,
    companyIsQualimat,
    IDTFNumbers,
    loadIsQuantifiable,
    PREDEFINED_LOAD_CATEGORIES,
    PredefinedLoadCategory,
} from "dashdoc-utils";

import {
    FormLoad,
    TransportFormActivity,
    TransportFormContextData,
    TransportFormDeliveryOption,
} from "../../transport-form/transport-form.types";

import type {Transport} from "app/types/transport";

export function getLoadCategoryOptions({
    isQualimat = false,
    transportShape = "simple",
    loadsCount = 0,
    isComplexTransportForm = false,
    alphabeticalSorting = true,
}: {
    isQualimat?: boolean;
    transportShape?: Transport["shape"];
    loadsCount?: number;
    isComplexTransportForm?: boolean;
    alphabeticalSorting?: boolean;
}): SimpleOption<PredefinedLoadCategory>[] {
    let categories: PredefinedLoadCategory[] = [...PREDEFINED_LOAD_CATEGORIES];

    if (!isQualimat) {
        categories = categories.filter((category) => category !== "bulk_qualimat");
    }

    if (isComplexTransportForm || transportShape !== "simple" || loadsCount > 1) {
        categories = categories.filter((category) => category !== "rental");
    }

    const options = categories.map((value) => {
        return {
            value,
            label: value === "other" ? t("common.other") : getLoadCategoryLabel(value),
        };
    });

    return alphabeticalSorting ? options.sort((a, b) => a.label.localeCompare(b.label)) : options;
}

export function getDeliveryOptions(
    deliveries: TransportFormDeliveryOption[],
    withoutIndex?: boolean
) {
    return deliveries.map((delivery) => {
        return {
            value: delivery,
            label: getDeliveryOptionLabel(
                delivery.loadingActivity,
                delivery.unloadingActivity,
                withoutIndex
            ),
        };
    });
}

function getDeliveryOptionLabel(
    loadingActivity: Partial<TransportFormActivity>,
    unloadingActivity: Partial<TransportFormActivity>,
    withoutIndex?: boolean
) {
    const loadingIndex =
        !withoutIndex && loadingActivity.index !== undefined
            ? `#${loadingActivity.index + 1}`
            : "";
    const unloadingIndex =
        !withoutIndex && unloadingActivity.index !== undefined
            ? `#${unloadingActivity.index + 1}`
            : "";

    const loadingLabel = `${t("common.pickup")} ${loadingIndex} ${
        loadingActivity.address?.name ? `- ${loadingActivity.address?.name}` : ""
    }`;
    const unloadingLabel = `${t("common.delivery")} ${unloadingIndex} ${
        unloadingActivity.address?.name ? `- ${unloadingActivity.address?.name}` : ""
    }`;
    return `${loadingLabel} ➞ ${unloadingLabel}`;
}

export function isEqualDeliveries(
    delivery1: TransportFormDeliveryOption,
    delivery2: TransportFormDeliveryOption
) {
    return (
        delivery1?.loadingActivity.uid === delivery2?.loadingActivity.uid &&
        delivery1?.unloadingActivity.uid === delivery2?.unloadingActivity.uid
    );
}

export function getLoadCategoryTooltipContent(
    isLoadCategorySmartSuggested: boolean,
    isCategoryFieldTouched: boolean,
    targetActivity: Partial<TransportFormActivity>,
    loadCategory: PredefinedLoadCategory
) {
    const addressName =
        targetActivity?.address?.name ||
        (targetActivity?.address && "created_by" in targetActivity.address
            ? targetActivity.address.company?.name
            : undefined);
    return isLoadCategorySmartSuggested && !isCategoryFieldTouched
        ? targetActivity?.type === "loading"
            ? t("smartSuggests.loadCategoryTooltipContent.predictedByOrigin", {
                  loadCategory:
                      loadCategory === "other"
                          ? t("common.other")
                          : getLoadCategoryLabel(loadCategory),
                  originAddress: addressName,
              })
            : t("smartSuggests.loadCategoryTooltipContent.predictedByDestination", {
                  loadCategory:
                      loadCategory === "other"
                          ? t("common.other")
                          : getLoadCategoryLabel(loadCategory),
                  destinationAddress: addressName,
              })
        : null;
}

export function getOtherLoadCategoryTooltipContent(
    isLoadCategorySmartSuggested: boolean,
    isCategoryFieldTouched: boolean,
    targetActivity: Partial<TransportFormActivity>,
    otherLoadCategory: string
) {
    const addressName =
        targetActivity?.address?.name ||
        (targetActivity?.address && "created_by" in targetActivity.address
            ? targetActivity.address.company?.name
            : undefined);
    return isLoadCategorySmartSuggested && !isCategoryFieldTouched
        ? targetActivity?.type === "loading"
            ? t("smartSuggests.otherCategoryNameTooltipContent.predictedByOrigin", {
                  otherCategoryName: otherLoadCategory,
                  originAddress: addressName,
              })
            : t("smartSuggests.otherCategoryNameTooltipContent.predictedByDestination", {
                  otherCategoryName: otherLoadCategory,
                  destinationAddress: addressName,
              })
        : undefined;
}

export function getIdtfNumberOptions() {
    return IDTFNumbers.map((number) => ({
        value: number,
        label: `${number} - ${t(`idtf.${number}`)}`, // nosemgrep
    }));
}

export const getLoadDisplaySettings = (
    values: FormLoad,
    context: TransportFormContextData,
    company: Company | null
) => {
    const missingQualimatVehicleInformation =
        context.isVehicleUsedForQualimat === false &&
        [null, false].includes(context.isTrailerUsedForQualimat) &&
        values.category === "bulk_qualimat";

    const rentalInformation = values.category === "rental";

    const otherCategoryNameSection = values.category === "other";

    const quantitySection =
        loadIsQuantifiable(values.category) && values.isMultipleRounds !== true;

    const identifiers = values.use_identifiers;

    const linearMetersSection =
        !values.isMultipleRounds &&
        !["bulk", "bulk_qualimat", "containers", "powder_tank", "rental"].includes(
            values.category
        );

    const roundWoodSection = !values.isMultipleRounds && values.category === "roundwood";

    const plannedReturnablePalletsSection = context.isOrder && values.category === "pallets";

    const multipleCompartmentsSection = ["bulk", "bulk_qualimat", "powder_tank"].includes(
        values.category
    );

    const dangerousCheckbox = !values.isMultipleRounds;

    const dangerousSection = values.is_dangerous;

    const refrigeratedSection = values.refrigerated;

    const multipleRoundsSection =
        !(
            context.isComplexMode ||
            context.transportShape !== "simple" ||
            context.businessPrivacyEnabled ||
            context.loadsCount > 1
        ) && ["bulk", "bulk_qualimat", "roundwood"].includes(values.category);

    const bulkQualimatSection = companyIsQualimat(company) && values.category === "bulk_qualimat";

    const containerSection = values.category === "containers";

    return {
        missingQualimatVehicleInformation,
        identifiers,
        rentalInformation,
        quantitySection,
        otherCategoryNameSection,
        linearMetersSection,
        roundWoodSection,
        plannedReturnablePalletsSection,
        multipleCompartmentsSection,
        dangerousCheckbox,
        dangerousSection,
        refrigeratedSection,
        multipleRoundsSection,
        bulkQualimatSection,
        containerSection,
    };
};
