import {SupportedLocale, t} from "@dashdoc/web-core";
import {Card, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {InvoiceLanguagePickerLegacy} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceLanguagePicker";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

type Props = {
    creditNote: CreditNote;
    onSetLanguage: (language: SupportedLocale) => void;
};

export function DraftCreditNoteSettings({creditNote, onSetLanguage}: Props) {
    return (
        <Card mb={4} p={5}>
            <Flex style={{columnGap: "8px"}}>
                <Text variant="captionBold" color="grey.dark">
                    {t("common.personnalization")}
                </Text>
                <TooltipWrapper
                    placement="top"
                    content={
                        <Flex flexDirection="column">
                            <Text>{t("creditNote.fromSettings")}</Text>
                            <ul>
                                <li>
                                    <Text>{t("creditNote.changeLanguage")}</Text>
                                </li>
                            </ul>
                            <Text>{t("creditNote.settingsWillBeSaved")}</Text>
                        </Flex>
                    }
                    boxProps={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                    }}
                >
                    <Icon name={"info"} color="grey.dark" />
                </TooltipWrapper>
            </Flex>
            <Flex style={{columnGap: "16px"}} pt="4">
                <InvoiceLanguagePickerLegacy
                    language={creditNote.language}
                    onChange={(language) => {
                        onSetLanguage(language);
                    }}
                />
            </Flex>
        </Card>
    );
}
