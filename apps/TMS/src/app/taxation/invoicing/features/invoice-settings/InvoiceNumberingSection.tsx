import {t} from "@dashdoc/web-core";
import {Badge, Callout, ClickableUpdateRegionStyle, Flex, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {EditInvoiceNumberingModal} from "app/taxation/invoicing/features/invoice-settings/EditInvoiceNumberingModal";
import {
    InvoiceNumberingData,
    InvoiceNumberingPostData,
} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type InvoiceNumberingSectionProps = {
    numberingData: InvoiceNumberingData;
    onNumberingEdit: (numberingData: InvoiceNumberingPostData) => void;
};

export function InvoiceNumberingSection({
    numberingData,
    onNumberingEdit,
}: InvoiceNumberingSectionProps) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    const hasBeenEditedOnce = numberingData.last_invoice_number_outside_dashdoc !== null;

    const content = hasBeenEditedOnce ? (
        <>
            <Flex flexDirection="row" alignItems={"center"}>
                <InvoiceNumberPreview numberingData={numberingData} />
                {numberingData?.reset_period === "month" && (
                    <Flex ml={5}>
                        <Icon mr={1} name="refresh" color="grey.dark" />
                        <Text color="grey.dark">{t("invoiceNumberingSettings.monthlyReset")}</Text>
                    </Flex>
                )}
                {numberingData?.reset_period === "year" && (
                    <Flex ml={5}>
                        <Icon mr={1} name="refresh" color="grey.dark" />
                        <Text color="grey.dark">{t("invoiceNumberingSettings.yearlyReset")}</Text>
                    </Flex>
                )}
            </Flex>
        </>
    ) : (
        <Text color="grey.dark">{t("common.unspecified")}</Text>
    );
    return (
        <Flex flexDirection={"column"}>
            <Flex
                border="1px solid"
                borderColor="grey.light"
                p={4}
                width="100%"
                onClick={openModal}
                as={ClickableUpdateRegionStyle}
                data-testid="invoice-numbering-section"
                // @ts-ignore
                updateButtonLabel={numberingData.editable ? t("common.edit") : t("common.display")}
            >
                {content}
            </Flex>
            {isModalOpen && (
                <EditInvoiceNumberingModal
                    onClose={closeModal}
                    onSubmit={closeModal}
                    numberingData={numberingData}
                    onNumberingEdit={onNumberingEdit}
                    readOnly={!numberingData.editable}
                />
            )}
            {!numberingData.editable && (
                <Callout
                    variant="warning"
                    data-testid="invoice-numbering-not-editable-callout"
                    py={3}
                >
                    {t("invoiceNumberingSettings.notEditable")}
                </Callout>
            )}
        </Flex>
    );
}

const InvoiceNumberPreview = ({numberingData}: {numberingData: InvoiceNumberingData}) => {
    // We split numberingData.prefix_template with [[year]] OR [[month]]
    // If we have input "TEST-[[year]]-[[month]]-"", it should output ["TEST-", "[[year]]", "-", "[[month]]", "-"]
    const prefixTemplateSplit = numberingData.prefix_template.split(
        /(\[\[year\]\]|\[\[month\]\])/
    );

    return (
        <Flex flexDirection="row" alignItems={"center"}>
            {prefixTemplateSplit.map((part, index) => {
                if (part === "[[year]]") {
                    return (
                        <Badge shape="squared" mx={"2px"} key={part + index}>
                            {t("invoiceNumberingSettings.year").toLowerCase()}
                        </Badge>
                    );
                }
                if (part === "[[month]]") {
                    return (
                        <Badge shape="squared" mx={"2px"} key={part + index}>
                            {t("invoiceNumberingSettings.month").toLowerCase()}
                        </Badge>
                    );
                }
                return (
                    <Text key={part + index} variant="h1">
                        {part}
                    </Text>
                );
            })}
            <Badge variant={"neutral"} mx={"2px"} shape="squared">
                {t("common.counter").toLowerCase()}
            </Badge>
        </Flex>
    );
};
