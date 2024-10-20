import {getConnectedCompany} from "@dashdoc/web-common";
import {Locale, SUPPORTED_LOCALES_OPTIONS, SupportedLocale, t} from "@dashdoc/web-core";
import {Box, Button, Callout, Flex, Link, MultilingualInput, Text} from "@dashdoc/web-ui";
import {Form, FormikProvider, useFormik} from "formik";
import React, {useMemo, useState} from "react";
import {useSelector} from "react-redux";

import {InvoiceDiagram} from "app/taxation/invoicing/features/invoice-settings/InvoiceDiagram";
import {updateInvoiceLegalMentionsSettings} from "app/taxation/invoicing/services/invoiceSettings";

interface LegalMentionsFormProps {
    legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>;
    onInvoiceLegalMentionsEdit: (
        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
    ) => void;
    onSubmit: () => void;
    setLoading: (loading: boolean) => void;
    origin: "settings" | "onboarding";
    defaultOpenLanguageTab?: SupportedLocale;
}

type FormProps = {
    legal_mentions_by_language: Partial<Record<SupportedLocale, string>>;
};

const FRENCH_EXAMPLE_TEXT = `Aucun escompte n’est accordé pour paiement anticipé.${"\n"}En cas de retard de paiement, une pénalité de retard égale à 3 fois le taux légal sera appliquée le jour suivant la date d'échéance figurant sur la facture.${"\n"}Une indemnité forfaitaire de 40 € pour frais de recouvrement sera appliquée et s'ajoute aux pénalités de retard.`;

export function LegalMentionsForm({
    legalMentionsByLanguage,
    onInvoiceLegalMentionsEdit: onInvoiceLegalMentionsByLanguageEdit,
    onSubmit,
    setLoading,
    origin,
    defaultOpenLanguageTab,
}: LegalMentionsFormProps) {
    const formik = useFormik<FormProps>({
        initialValues: {
            legal_mentions_by_language: sortByLocaleOrder(legalMentionsByLanguage),
        },
        onSubmit: async () => {
            setLoading(true);
            try {
                const updatedInvoiceLegalMentionsData = await updateInvoiceLegalMentionsSettings({
                    legal_mentions_by_language: formik.values.legal_mentions_by_language,
                });
                onInvoiceLegalMentionsByLanguageEdit(
                    updatedInvoiceLegalMentionsData.legal_mentions_by_language
                );
                onSubmit();
            } finally {
                setLoading(false);
            }
        },
        validateOnBlur: false,
        validateOnChange: true,
    });

    const [openLanguageTab, setOpenLanguageTab] = useState<SupportedLocale>(
        "fr" in legalMentionsByLanguage
            ? "fr"
            : (Object.keys(legalMentionsByLanguage).find((key) => key) as SupportedLocale)
    );

    const connectedCompany = useSelector(getConnectedCompany);

    const isFrench = (connectedCompany?.country ?? "").toUpperCase() === "FR";
    const exampleText = openLanguageTab === "fr" ? FRENCH_EXAMPLE_TEXT : undefined;

    const frenchLegalLinks = openLanguageTab === "fr" && (
        <>
            <Text as="span"> {t("InvoiceLegalSettings.toAssistYou")} </Text>
            <Link
                href="https://entreprendre.service-public.fr/vosdroits/F23211"
                target="_blank"
                rel="noopener noreferrer"
            >
                {t("InvoiceLegalSettings.publicService")}
            </Link>
            <Text as="span">, </Text>
            <Link
                href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038411642"
                target="_blank"
                rel="noopener noreferrer"
            >
                {t("InvoiceLegalSettings.frenchCommercialCode")}
            </Link>
            <Text as="span">.</Text>
        </>
    );

    const legalMentionsError = useMemo(() => {
        const legalMentionsByLanguage = Object.values(formik.values.legal_mentions_by_language);
        if (isFrench && !formik.values.legal_mentions_by_language.fr) {
            return t("InvoiceLegalSettings.frenchIsMandatory");
        } else if (legalMentionsByLanguage.every((value) => !value)) {
            return t("common.mandatoryField");
        } else if (legalMentionsByLanguage.some((value) => !value)) {
            return t("InvoiceLegalSettings.noBlankLanguage");
        } else {
            return undefined;
        }
    }, [formik.values.legal_mentions_by_language, isFrench]);

    return (
        <Flex flexDirection={"column"}>
            <Box mb={3}>
                {origin === "onboarding" && (
                    <Text variant="h1" mb={2}>
                        {t("InvoiceLegalSettings.titleWizard")}
                    </Text>
                )}
                <Text my={1} as="span">
                    {t("InvoiceLegalSettings.description1")}
                    {frenchLegalLinks}
                </Text>
            </Box>
            <Flex flexDirection={"row"} mb={3}>
                <Flex flexDirection={"column"} flexGrow={1}>
                    {exampleText && (
                        <>
                            <Text variant="h2" mb={1}>
                                {t("common.example")}
                            </Text>
                            <Box backgroundColor="grey.ultralight" p={2} mb={4}>
                                <Flex flexDirection={"row"}>
                                    <Text>{exampleText}</Text>
                                    <Button
                                        ml={2}
                                        type="button"
                                        data-testid="copy-shared-link"
                                        onClick={() => {
                                            formik.setFieldValue("legal_mentions_by_language", {
                                                ...formik.values.legal_mentions_by_language,
                                                [openLanguageTab]: exampleText,
                                            });
                                        }}
                                        variant="secondary"
                                        alignSelf={"center"}
                                        minWidth={"80px"}
                                    >
                                        {t("common.copy")}
                                    </Button>
                                </Flex>
                            </Box>
                        </>
                    )}
                    <FormikProvider value={formik}>
                        <Form id="legal-mentions-form" noValidate>
                            <Flex flexDirection={"column"}>
                                <MultilingualInput
                                    label={t("InvoiceLegalMentionsSection.legalMentions")}
                                    error={legalMentionsError}
                                    localeOptions={SUPPORTED_LOCALES_OPTIONS}
                                    height={"200px"}
                                    defaultOpenTab={defaultOpenLanguageTab}
                                    value={formik.values.legal_mentions_by_language}
                                    onChange={(value) => {
                                        formik.setFieldValue(
                                            "legal_mentions_by_language",
                                            sortByLocaleOrder(value)
                                        );
                                    }}
                                    onTabChange={(tab) => {
                                        setOpenLanguageTab(tab as SupportedLocale);
                                    }}
                                />
                            </Flex>
                        </Form>
                    </FormikProvider>
                </Flex>
                <InvoiceDiagram highlight="legal-mentions" />
            </Flex>
            {origin === "settings" && <Callout>{t("InvoiceLegalSettings.description2")}</Callout>}
        </Flex>
    );

    function sortByLocaleOrder(
        toSort: Partial<Record<Locale, string>>
    ): Partial<Record<Locale, string>> {
        return Object.keys(toSort)
            .sort(
                (a, b) =>
                    SUPPORTED_LOCALES_OPTIONS.findIndex((option) => option.value === a) -
                    SUPPORTED_LOCALES_OPTIONS.findIndex((option) => option.value === b)
            )
            .reduce((valueSorted: Partial<Record<Locale, string>>, key: Locale) => {
                valueSorted[key] = toSort[key];
                return valueSorted;
            }, {});
    }
}
