import {useFeatureFlag} from "@dashdoc/web-common";
import {SUPPORTED_LOCALES_OPTIONS, SupportedLocale, t} from "@dashdoc/web-core";
import {Card, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {DraftInvoiceSettingsButton} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/DraftInvoiceSettingsButton";
import {InvoiceDescriptionTemplatePickerLegacy} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceDescriptionTemplatePicker";
import {InvoiceLanguagePickerLegacy} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceLanguagePicker";
import {InvoiceMultiRibPickerLegacy} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/InvoiceMultiRibPicker";
import {useInvoiceBankInformation} from "app/taxation/invoicing/hooks/useInvoiceBankInformation";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";
import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type Props = {
    invoice: Invoice;
    onSetBankInformation: (bankInformationUid: InvoiceBankInformation["uid"]) => void;
    onSetDescriptionTemplate: (templateUid: string | null) => void;
    onSetLanguage: (language: SupportedLocale) => void;
};

export const DraftInvoiceSettings = function ({
    invoice,
    onSetBankInformation,
    onSetDescriptionTemplate,
    onSetLanguage,
}: Props) {
    const hasInvoiceDescriptionTemplate = !invoice.is_bare_invoice;
    const hasFuelSurchargeInFooterEnabled = useFeatureFlag("fuelSurchargeInInvoiceFooter");

    const {bankInformationList} = useInvoiceBankInformation();

    return hasFuelSurchargeInFooterEnabled ? (
        <Card mb={4} px={5} py={3}>
            <Flex style={{columnGap: "24px"}} alignItems={"center"}>
                {!invoice.is_bare_invoice && (
                    <TooltipWrapper content={t("invoice.descriptionTemplate")} placement="bottom">
                        <Flex
                            alignItems={"center"}
                            data-testid="invoice-description-template-preview"
                        >
                            <Icon name="creator" mr={2} />
                            <Text>
                                {invoice.description_template
                                    ? invoice.description_template.name
                                    : t("invoice.DefaultTemplate")}
                            </Text>
                        </Flex>
                    </TooltipWrapper>
                )}
                {invoice.is_dashdoc && (
                    <TooltipWrapper content={t("components.gasIndex")} placement="bottom">
                        <Flex
                            alignItems={"center"}
                            data-testid="invoice-fuel-surcharge-on-footer-preview"
                        >
                            <Icon name="gasIndex" mr={2} />
                            <Text>
                                {invoice.fuel_surcharge_in_footer
                                    ? t("invoice.fuelSurchargeOnFooter")
                                    : t("invoice.fuelSurchargePerTransport")}
                            </Text>
                        </Flex>
                    </TooltipWrapper>
                )}
                {invoice.is_dashdoc && invoice.bank_information && (
                    <TooltipWrapper content={t("invoice.bankDetails")} placement="bottom">
                        <Flex
                            alignItems={"center"}
                            data-testid="invoice-banking-information-preview"
                        >
                            <Icon name="bank" mr={2} />
                            <Text>{invoice.bank_information.name}</Text>
                        </Flex>
                    </TooltipWrapper>
                )}
                {/* For non bare invoice that does not have Bank Information, we have space to display the language (responsiveness is fine) */}
                {invoice.is_dashdoc &&
                    (invoice.is_bare_invoice ||
                        (!invoice.is_bare_invoice && !invoice.bank_information)) && (
                        <TooltipWrapper
                            content={t("draftInvoiceSettingsModal.pdfLanguage")}
                            placement="bottom"
                        >
                            <Flex alignItems={"center"} data-testid="invoice-language-preview">
                                <Icon name="earth" mr={2} />
                                <Text>
                                    {SUPPORTED_LOCALES_OPTIONS.find(
                                        (option) => option.value === invoice.language
                                    )?.label ?? ""}
                                </Text>
                            </Flex>
                        </TooltipWrapper>
                    )}
                {invoice.is_dashdoc && !invoice.is_bare_invoice && (
                    <TooltipWrapper
                        content={t("draftInvoiceSettingsModal.carbonFootprint")}
                        placement="bottom"
                    >
                        <Flex
                            alignItems={"center"}
                            data-testid="invoice-show-carbon-footprint-preview"
                        >
                            <Icon name="ecologyLeaf" mr={2} />
                            <Text>
                                {t(
                                    invoice.show_carbon_footprint
                                        ? "draftInvoiceSettingsModal.carbonFootprintShown"
                                        : "draftInvoiceSettingsModal.carbonFootprintHidden"
                                )}
                            </Text>
                        </Flex>
                    </TooltipWrapper>
                )}
                <Flex flex={1} />
                <Flex alignItems={"center"}>
                    <DraftInvoiceSettingsButton />
                </Flex>
            </Flex>
        </Card>
    ) : (
        <Card mb={4} p={5}>
            <Flex style={{columnGap: "8px"}}>
                <Text variant="captionBold" color="grey.dark">
                    {t("common.personnalization")}
                </Text>
                <TooltipWrapper
                    placement="top"
                    content={
                        <Flex flexDirection="column">
                            <Text>{t("invoice.fromSettings")}</Text>
                            <ul>
                                <li>
                                    <Text>{t("invoice.templateDescriptionInfo")}</Text>
                                </li>
                                {invoice.is_dashdoc && (
                                    <>
                                        {bankInformationList.length > 0 && (
                                            <li>
                                                <Text>{t("invoice.addBankDetails")}</Text>
                                            </li>
                                        )}
                                        <li>
                                            <Text>{t("invoice.changeLanguage")}</Text>
                                        </li>
                                    </>
                                )}
                            </ul>
                            <Text>{t("invoice.settingsWillBeSaved")}</Text>
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
                {hasInvoiceDescriptionTemplate && (
                    <InvoiceDescriptionTemplatePickerLegacy
                        invoice={invoice}
                        onChange={(templateUid) => {
                            onSetDescriptionTemplate(templateUid);
                        }}
                    />
                )}

                <InvoiceMultiRibPickerLegacy
                    bankInformationList={bankInformationList}
                    bankInformation={invoice.bank_information}
                    onChange={(bankInformationUid) => {
                        onSetBankInformation(bankInformationUid);
                    }}
                />

                {invoice.is_dashdoc && (
                    <InvoiceLanguagePickerLegacy
                        language={invoice.language}
                        onChange={(language) => {
                            onSetLanguage(language);
                        }}
                    />
                )}
            </Flex>
        </Card>
    );
};
