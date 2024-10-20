import {LOCALE_ARRAY, Locale, SupportedLocale, localeService, t} from "@dashdoc/web-core";
import {ClickableUpdateRegionStyle, Flex, Tabs, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {EditInvoiceLegalMentionsModal} from "app/taxation/invoicing/features/invoice-settings/EditInvoiceLegalMentionsModal";

type InvoiceLegalMentionsSectionProps = {
    legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>;
    onInvoiceLegalMentionsEdit: (
        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
    ) => void;
};

export function InvoiceLegalMentionsSection({
    legalMentionsByLanguage,
    onInvoiceLegalMentionsEdit,
}: InvoiceLegalMentionsSectionProps) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [openLanguageTab, setOpenLanguageTab] = useState<SupportedLocale | undefined>();

    const hasLegalMentions =
        Object.keys(legalMentionsByLanguage).length > 0 &&
        legalMentionsByLanguage[Object.keys(legalMentionsByLanguage)[0] as SupportedLocale];

    const showMultilingualInput =
        hasLegalMentions && Object.keys(legalMentionsByLanguage).length > 1;

    return (
        <Flex>
            {hasLegalMentions ? (
                showMultilingualInput ? (
                    <Tabs
                        tabs={multilingualInputTabs()}
                        onTabChanged={(index: number) =>
                            setOpenLanguageTab(
                                Object.keys(legalMentionsByLanguage)[index] as SupportedLocale
                            )
                        }
                    />
                ) : (
                    clickeableUpdate(
                        <Text variant="h2">
                            {Object.values(legalMentionsByLanguage).find((value) => value)}
                        </Text>
                    )
                )
            ) : (
                clickeableUpdate(<Text color="grey.dark">{t("common.unspecified")}</Text>)
            )}

            {isModalOpen && (
                <EditInvoiceLegalMentionsModal
                    onSubmit={closeModal}
                    onClose={closeModal}
                    legalMentionsByLanguage={legalMentionsByLanguage}
                    onInvoiceLegalMentionsEdit={onInvoiceLegalMentionsEdit}
                    defaultOpenLanguageTab={openLanguageTab}
                />
            )}
        </Flex>
    );

    function clickeableUpdate(
        children: React.ReactNode,
        dataTestId: string = "invoice-legal-mentions-section"
    ) {
        return (
            <Flex
                mt={2}
                border="1px solid"
                borderColor="grey.light"
                p={4}
                width="100%"
                onClick={openModal}
                as={ClickableUpdateRegionStyle}
                data-testid={dataTestId}
            >
                {children}
            </Flex>
        );
    }

    function multilingualInputTabs() {
        return Object.keys(legalMentionsByLanguage)
            .sort((a, b) => LOCALE_ARRAY.indexOf(a as Locale) - LOCALE_ARRAY.indexOf(b as Locale))
            .map((language: SupportedLocale) => {
                return {
                    label: localeService.getShortLocalLabel(language),
                    testId: `${language}-tab`,
                    content: (
                        <Flex mt={2}>
                            {clickeableUpdate(
                                <Text variant="h2">{legalMentionsByLanguage[language]}</Text>,
                                `invoice-legal-mentions-section-${language}`
                            )}
                        </Flex>
                    ),
                };
            });
    }
}
