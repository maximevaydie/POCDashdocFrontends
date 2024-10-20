import {guid} from "@dashdoc/core";
import {Locale, SupportedLocale, getAdrUnCodeLabel, t} from "@dashdoc/web-core";
import {
    AutoCompleteTextInput,
    Box,
    Callout,
    Flex,
    Link,
    MultilingualInput,
    Text,
} from "@dashdoc/web-ui";
import {AdrUnCode, getAdrUnCodeLabelI18N, getLocale} from "dashdoc-utils";
import {FormikProps} from "formik";
import React from "react";

import {AdrUnCodeSelect} from "app/features/transport/load/load-form/AdrUnCodeSelect";
import {FormLoad} from "app/features/transport/transport-form/transport-form.types";

type Props = {
    formik: FormikProps<FormLoad>;
    rootId: string;
};
export function AdrFormSection({formik, rootId}: Props) {
    const suggestedLegalMentionsOptions = [
        {label: t("adr.defaultLegalMentions"), value: t("adr.defaultLegalMentions")},
    ];

    const [multilingualKey, setMultilingualKey] = React.useState("_");
    return (
        <Box>
            <Flex justifyContent="space-between">
                <Box data-testid="transport-load-form-adr-un-code" flexBasis="49.5%" mb={2}>
                    <AdrUnCodeSelect
                        {...formik.getFieldProps("adrUnCode")}
                        label={t("adr.unCode")}
                        onChange={handleAdrUnCodeChanged}
                        isClearable={false}
                        required
                        error={formik.errors.adrUnCode as string}
                    />
                </Box>
                <Box data-testid="transport-load-form-legal-mentions" flexBasis="49.5%" mb={2}>
                    <AutoCompleteTextInput
                        {...formik.getFieldProps("legal_mentions")}
                        label={t("adr.legalMentions")}
                        onChange={(value) => formik.setFieldValue("legal_mentions", value)}
                        suggestions={suggestedLegalMentionsOptions}
                        error={formik.errors.legal_mentions}
                        rootId={rootId}
                    />
                </Box>
            </Flex>
            {formik.values.adrUnCode?.code && (
                <>
                    <MultilingualInput
                        key={multilingualKey}
                        label={t("component.descriptionOnTheConsignmentNode")}
                        {...formik.getFieldProps("adrUnDescriptionByLanguage")}
                        value={formik.values.adrUnDescriptionByLanguage ?? {}}
                        error={
                            typeof formik.errors.adrUnDescriptionByLanguage === "string"
                                ? formik.errors.adrUnDescriptionByLanguage
                                : undefined
                        }
                        onChange={handleAdrUnDescriptionByLanguageChanged}
                        defaultValue={getDefaultDescription()}
                    />

                    <Callout my={2} iconDisabled>
                        <Text mb={3}>{t("adr.descriptionExplanations")}</Text>

                        <Text mb={3}>
                            {t("adr.descriptionExplanations2")}
                            <Link
                                ml={2}
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://unece.org/about-adr"
                            >
                                {t("adr.seeOfficialDocumentation")}
                            </Link>
                        </Text>
                    </Callout>
                </>
            )}
        </Box>
    );

    function handleAdrUnCodeChanged(value: AdrUnCode) {
        const description = getAdrUnCodeLabel(value);
        const locale = getLocale() as Locale;
        formik.setFieldValue("adrUnCode", value);
        formik.setFieldValue("adrUnDescriptionByLanguage", {[locale]: description});
        formik.setFieldValue("description", description);
        formik.setErrors({});
        setMultilingualKey(guid());
    }

    function handleAdrUnDescriptionByLanguageChanged(value: Record<Locale, string>) {
        formik.setFieldValue("adrUnDescriptionByLanguage", value);
    }

    function getDefaultDescription(): Partial<Record<SupportedLocale, string>> {
        const code = formik.values.adrUnCode;
        if (!code || !("pk" in code)) {
            return {};
        }
        return {
            fr: getAdrUnCodeLabelI18N({translate: t, mainLocale: "fr"}, code),
            en: getAdrUnCodeLabelI18N({translate: t, mainLocale: "en"}, code),
            nl: getAdrUnCodeLabelI18N({translate: t, mainLocale: "nl"}, code),
            de: getAdrUnCodeLabelI18N({translate: t, mainLocale: "de"}, code),
            // not available in the translated adr codes
            //pl: getAdrUnCodeLabelI18N({translate: t, mainLocale: "pl"}, code),
        };
    }
}
