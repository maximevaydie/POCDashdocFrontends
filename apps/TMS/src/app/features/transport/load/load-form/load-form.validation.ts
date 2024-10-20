import {Locale, t} from "@dashdoc/web-core";
import {PredefinedLoadCategory, litersToCubicMeters, loadIsQuantifiable, yup} from "dashdoc-utils";
import {isEmpty} from "lodash";

import {FormLoad, TransportFormContextData} from "../../transport-form/transport-form.types";

import type {Load} from "app/types/transport";

const getCommonLoadValidationShape = (
    formContext: TransportFormContextData,
    isQualimat: boolean
) => {
    return {
        adrUnCode: yup
            .object()
            .nullable()
            .when("is_dangerous", {
                is: true,
                then: yup.object().nullable().required(t("common.mandatoryField")),
            }),
        adrUnDescriptionByLanguage: yup
            .object()
            .when("is_dangerous", {
                is: true,
                then: yup.object().nullable().required(t("common.mandatoryField")),
            })
            // validate that all languages are filled
            .test(
                "allLanguagesFilled",
                t("adr.descriptionsAreMissing"),
                (value: Partial<Record<Locale, string>> | null | undefined) => {
                    return (
                        value === null ||
                        value === undefined ||
                        Object.values(value).every((v) => v)
                    );
                }
            ),
        category: yup.string().nullable(),
        complementaryInformation: yup.string().nullable(),
        containerNumber: yup.string().nullable(),
        containerSealNumber: yup.string().nullable(),
        delivery: yup.object().nullable().required(t("common.mandatoryField")),
        description: yup
            .string()
            .nullable()
            .when("category", {
                is: (category: string) => category !== "rental" && !formContext.isTemplate,
                then: yup.string().required(t("common.mandatoryField")),
            }),
        idtf_number: yup
            .string()
            .nullable()
            .when("category", {
                is: (category: PredefinedLoadCategory) =>
                    isQualimat && category === "bulk_qualimat",
                then: yup.string().required(t("common.mandatoryField")),
            }),
        isDangerous: yup.boolean(),
        legalMentions: yup.string().nullable(),
        linearMeters: yup.number().nullable().positive(),
        isMultipleRounds: yup.boolean(),
        otherCategory: yup
            .string()
            .nullable()
            .when("category", {
                is: (category: PredefinedLoadCategory) => category === "other",
                then: yup.string().required(t("common.mandatoryField")),
            }),
        plannedReturnablePallets: yup.string().nullable(),
        hasIdentifiers: yup.boolean(),
        identifiers: yup.array().of(yup.string().required(t("common.mandatoryField"))),
        quantity: yup
            .number()
            .nullable()
            .when("category", {
                is: (category: Load["category"]) =>
                    category !== "other" && loadIsQuantifiable(category),
                then: yup.number().nullable().positive().integer(),
            })
            .when("category", {
                is: (category: string) => category === "no_category",
                then: yup
                    .number()
                    .nullable()
                    .positive()
                    .test(
                        "maxDigitsAfterDecimal",
                        t("validation.quantityMaxDecimalDigits", {smart_count: 2}),
                        (number) => !number || /^\d+(\.\d{1,2})?$/.test(number?.toString())
                    ),
            })
            .when(["identifiers"], (identifiers: string[], schema: yup.NumberSchema) => {
                if (!isEmpty(identifiers)) {
                    return schema
                        .min(identifiers.length, t("validation.quantityMustEqualIdentifiersCount"))
                        .max(
                            identifiers.length,
                            t("validation.quantityMustEqualIdentifiersCount")
                        );
                }
                return schema;
            }),
        refrigerated: yup.boolean(),
        requiresWashing: yup.boolean(),
        steres: yup.number().nullable().positive(),
        tareWeight: yup.number().nullable().positive(),
        temperature: yup.string().nullable(),
        volume: yup.number().nullable().positive(),
        weight: yup.number().nullable().positive(),
    };
};

export function getLoadValidationSchema(
    formContext: TransportFormContextData,
    isQualimat: boolean
) {
    return yup.object().shape(getCommonLoadValidationShape(formContext, isQualimat));
}

export const getLoadFormValues = (load: FormLoad, volumeDisplayUnit: "m3" | "L") => {
    if (load.volume != null && volumeDisplayUnit === "L") {
        // volume is handled as m3 from the API
        load.volume = litersToCubicMeters(load.volume);
    }

    return load;
};
