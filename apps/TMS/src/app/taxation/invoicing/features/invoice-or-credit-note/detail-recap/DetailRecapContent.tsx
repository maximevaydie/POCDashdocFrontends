import {AddressLabel, PartnerLink, PartnerTooltip} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickableUpdateRegion,
    Flex,
    Icon,
    NoWrap,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {Address, InvoicingAddress, formatDate} from "dashdoc-utils";
import React from "react";

import {InvoiceDueDate} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/InvoiceDueDate";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

import type {
    CreditNoteCreatedBy,
    CreditNoteCustomer,
} from "app/taxation/invoicing/types/creditNote.types";
import type {InvoiceCreatedBy, InvoiceDebtor} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    fromSharing: boolean;
} & (
    | {
          company: InvoiceDebtor | CreditNoteCustomer;
          isDebtor: true;
      }
    | {
          company: InvoiceCreatedBy | CreditNoteCreatedBy;
      }
);

const InvoiceAddress = ({company, fromSharing, ...props}: Props) => {
    const isDebtor = "isDebtor" in props && props.isDebtor;
    const address: InvoicingAddress | Address | undefined = isDebtor
        ? (company as InvoiceDebtor | CreditNoteCustomer).invoicing_address
        : (company as InvoiceCreatedBy | CreditNoteCreatedBy).primary_address;
    return (
        <Box pr={4}>
            <Flex alignItems="center" justifyContent="start" style={{gap: "8px"}}>
                <Text variant="title" mb={1} data-testid="name">
                    <NoWrap>{company.name}</NoWrap>
                </Text>
                {isDebtor && (
                    <Flex flexShrink={0} color="blue.default">
                        <TooltipWrapper
                            content={
                                <InvoiceAddressTooltip
                                    company={company as InvoiceDebtor | CreditNoteCustomer}
                                />
                            }
                        >
                            <Icon name="building" />
                        </TooltipWrapper>
                    </Flex>
                )}
            </Flex>
            {!!address && (
                <Text color="grey.dark" variant="caption">
                    <AddressLabel address={address} onSeveralLines />
                </Text>
            )}
            {!address && !fromSharing && isDebtor && (
                <Flex>
                    <Icon name="warning" mr={1} color="red.default" />
                    <Text color="red.default">{t("customerToInvoice.notInvoiceable")}</Text>
                </Flex>
            )}
            <Text color="grey.dark" variant="caption">
                {!!address && "\n"}
                {t("common.inlineVatNumber", {vatNumber: company.vat_number || "—"})}
            </Text>
            {!fromSharing && (
                <Text variant="caption" mt={2}>
                    <PartnerLink pk={company.pk}>
                        {t("component.goToCompany")}
                        <Icon name="openInNewTab" ml={1} fontSize={9} />
                    </PartnerLink>
                </Text>
            )}
        </Box>
    );
};

function InvoiceAddressTooltip({company}: {company: InvoiceDebtor | CreditNoteCustomer}) {
    const invoiceAddress: InvoicingAddress | undefined = company.invoicing_address;
    const address = invoiceAddress
        ? {
              address: invoiceAddress.address ?? "",
              postcode: invoiceAddress.postcode,
              city: invoiceAddress.city,
              country: invoiceAddress.country,
          }
        : undefined;
    const vatNumber = company.vat_number ?? "";
    const notes = "notes" in company ? company.notes : "";
    return (
        <PartnerTooltip
            name={company.name}
            notes={notes}
            vat_number={vatNumber}
            address={address}
        />
    );
}

type UpdatableField<T> =
    | {
          show: false;
      }
    | {show: true; value: T; isLate?: boolean; onUpdate?: () => void};

type DetailRecapProps = {
    customer: CreditNoteCustomer | InvoiceDebtor;
    carrier: InvoiceCreatedBy | CreditNoteCreatedBy;
    dates: UpdatableField<{dueDate: string | null; invoicingDate: string | null}>;
    fromSharing: boolean;
};
export const DetailRecapContent: React.FunctionComponent<DetailRecapProps> = ({
    customer,
    carrier,
    dates,
    fromSharing,
}) => {
    const canEditDates = dates.show && dates.onUpdate !== undefined;
    const showDates =
        dates.show && (dates.value?.invoicingDate || dates.value?.dueDate || canEditDates);
    const showInvoicingDate = dates.show && (dates.value?.invoicingDate || canEditDates);
    const hasDashdocInvoicing = useHasDashdocInvoicingEnabled();
    const showDueDate =
        (hasDashdocInvoicing || fromSharing) &&
        dates.show &&
        (dates.value?.dueDate || canEditDates);

    return (
        <Flex flex={1} flexDirection="column">
            <Flex>
                {showDates && (
                    <ClickableUpdateRegion
                        clickable={dates.onUpdate !== undefined}
                        onClick={dates.onUpdate}
                        data-testid="invoice-dates"
                    >
                        <Flex alignItems={"center"}>
                            {showInvoicingDate && (
                                <Flex alignItems={"center"}>
                                    <Text color="grey.dark" mr={2}>
                                        {t("common.invoicingDate")}
                                    </Text>
                                    {dates.value?.invoicingDate ? (
                                        <Text>{formatDate(dates.value.invoicingDate, "P")}</Text>
                                    ) : (
                                        <Text color="grey.dark">—</Text>
                                    )}
                                </Flex>
                            )}
                            {showDueDate && (
                                <Flex alignItems={"center"}>
                                    <Text color="grey.dark" mr={2} ml={4}>
                                        {t("common.dueDate")}
                                    </Text>
                                    {dates.value?.dueDate ? (
                                        <InvoiceDueDate
                                            dueDate={dates.value.dueDate}
                                            isLate={dates.isLate ?? false}
                                        />
                                    ) : (
                                        <Text color="grey.dark">—</Text>
                                    )}
                                </Flex>
                            )}
                        </Flex>
                    </ClickableUpdateRegion>
                )}
            </Flex>
            <Flex mt={3}>
                <Flex flex={1} flexDirection="column" data-testid="invoiced-customer">
                    <Text color="grey.dark" mb={2}>
                        {t("common.customerToInvoice")}
                    </Text>
                    <InvoiceAddress isDebtor company={customer} fromSharing={fromSharing} />
                </Flex>

                <Flex flex={1} flexDirection="column">
                    <Text color="grey.dark" mb={2}>
                        {t("common.carrier")}
                    </Text>
                    <InvoiceAddress company={carrier} fromSharing={fromSharing} />
                </Flex>
            </Flex>
        </Flex>
    );
};
