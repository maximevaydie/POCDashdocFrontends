import {getConnectedManager, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, IconButton, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useMemo} from "react";
import {useSelector} from "react-redux";

import {
    getInvoicesOrCreditNotesQueryParamsFromFiltersQuery,
    InvoicesOrCreditNotesListQuery,
} from "app/features/filters/deprecated/utils";
import {BulkMarkInvoicesPaidModal} from "app/features/pricing/invoices/actions/bulk-mark-invoices-paid-modal";
import {BulkReminderInvoicesModal} from "app/features/pricing/invoices/actions/bulk-reminder-invoices-modal";
import {BulkShareInvoicesModal} from "app/features/pricing/invoices/actions/bulk-share-invoices-modal";
import {BulkDuplicateInvoicesModal} from "app/features/pricing/invoices/actions/BulkDuplicateInvoicesModal";
import {MarkInvoiceFinalModal} from "app/features/pricing/invoices/actions/mark-invoice-final-modal";
import {MoreBulkActions} from "app/features/pricing/invoices/actions/MoreBulkActions";
import {SearchQuery} from "app/redux/reducers/searches";
import {useInvoicesTotalAmount} from "app/screens/invoicing/hooks/useInvoicesTotalAmount";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

export type BulkActionsProps = {
    currentQuery: InvoicesOrCreditNotesListQuery;
    selectedRows: string[];
    selectedInvoicesCount?: number;
    selectedInvoicesQuery: SearchQuery;
    allInvoicesSelected?: boolean;
};

export const BulkActions: FunctionComponent<BulkActionsProps> = ({
    currentQuery,
    selectedRows,
    selectedInvoicesCount,
    selectedInvoicesQuery,
    allInvoicesSelected,
}) => {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    const [showMarkInvoicesFinalModal, openMarkInvoicesFinalModal, closeMarkInvoicesFinalModal] =
        useToggle();
    const [showMarkInvoicesPaidModal, openMarkInvoicesPaidModal, closeMarkInvoicesPaidModal] =
        useToggle();
    useToggle();
    const [showBulkShareInvoicesModal, openBulkShareInvoicesModal, closeBulkShareInvoicesModal] =
        useToggle();
    const [
        showBulkReminderInvoicesModal,
        openBulkReminderInvoicesModal,
        closeBulkReminderInvoicesModal,
    ] = useToggle();
    const [
        showBulkDuplicateInvoiceModal,
        openBulkDuplicateInvoiceModal,
        closeBulkDuplicateInvoiceModal,
    ] = useToggle();

    const timezone = useTimezone();

    const filters = useMemo(() => {
        let result: SearchQuery = {uid__in: selectedRows};
        if (allInvoicesSelected) {
            result = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(currentQuery, timezone);

            // since we send the filters in a POST request, we need to transform them
            if (result.search && result.search.length > 0) {
                result.search = result.search[0];
            }
            for (const key of Object.keys(result)) {
                if (typeof result[key] === "object" && result[key].length === 0) {
                    delete result[key];
                }
            }
        }
        return result;
    }, [selectedRows, currentQuery, timezone, allInvoicesSelected]);

    const {invoices, credit_notes} = useInvoicesTotalAmount(filters);

    const manager = useSelector(getConnectedManager);
    const managerSelectedColumns = manager ? manager.invoice_columns : [];

    const priceWithoutVat = invoices.price_ex_tax - (credit_notes?.price_ex_tax ?? 0);
    const priceWithVat =
        invoices?.price_incl_tax !== null
            ? invoices?.price_incl_tax - (credit_notes?.price_incl_tax ?? 0)
            : null;
    const canDisplayPriceWithoutVAT = managerSelectedColumns.includes("price");
    const canDisplayPriceWithVat =
        managerSelectedColumns.includes("price_with_vat") && priceWithVat !== null;
    let displayedPrice: "withoutVAT" | "withVAT" | null = canDisplayPriceWithoutVAT
        ? "withoutVAT"
        : canDisplayPriceWithVat
          ? "withVAT"
          : null;

    return (
        <>
            <Flex ml={2} flex={1} alignItems="center" fontWeight={400} fontSize={2}>
                <Flex flexWrap="wrap">
                    <IconButton
                        name="check"
                        mx={2}
                        onClick={openMarkInvoicesFinalModal}
                        label={t("common.finalize")}
                        data-testid="invoices-screen-bulk-mark-final-button"
                        color="blue.default"
                    />
                    <IconButton
                        name="check"
                        mx={2}
                        onClick={openMarkInvoicesPaidModal}
                        label={t("invoice.bulkActions.markPaid", {
                            smart_count: selectedInvoicesCount,
                        })}
                        data-testid="invoices-screen-mark-paid-button"
                        color="blue.default"
                    />
                    <Box
                        height="2em"
                        borderLeftWidth={1}
                        borderLeftStyle="solid"
                        borderLeftColor="grey"
                    />
                    {hasDashdocInvoicingEnabled && (
                        <MoreBulkActions
                            openBulkDuplicateInvoice={openBulkDuplicateInvoiceModal}
                            openBulkShareModal={openBulkShareInvoicesModal}
                            openBulkReminderModal={openBulkReminderInvoicesModal}
                        />
                    )}
                </Flex>
                <Flex
                    data-testid="invoices-total-amount"
                    justifyContent="flex-end"
                    textAlign={"right"}
                    flexShrink={0}
                >
                    {displayedPrice && (
                        <Box ml={2}>
                            <Flex alignItems="center">
                                <Flex mr={2}>
                                    <Text as="span" fontWeight="bold" mr={1}>
                                        {displayedPrice === "withVAT"
                                            ? t("invoices.totalIncludingTax")
                                            : t("invoices.totalExcludingTax")}
                                    </Text>
                                    <Text as="span">
                                        {formatNumber(
                                            displayedPrice === "withVAT"
                                                ? priceWithVat
                                                : priceWithoutVat,
                                            {
                                                style: "currency",
                                                currency: "EUR",
                                            }
                                        )}
                                    </Text>
                                </Flex>
                                <TooltipWrapper
                                    boxProps={{display: "flex", alignItems: "center"}}
                                    placement="left"
                                    content={
                                        <Flex flexDirection={"column"}>
                                            <Flex>
                                                <Text fontWeight="bold" mr={1}>
                                                    {t("common.totalPriceExcludingTax")}
                                                </Text>
                                                <Text mr={1}>
                                                    {t("invoices.selectedAmount", {
                                                        invoicesTotalAmount: formatNumber(
                                                            invoices.price_ex_tax,
                                                            {
                                                                style: "currency",
                                                                currency: "EUR",
                                                            }
                                                        ),
                                                        creditNotesTotalAmount: formatNumber(
                                                            credit_notes?.price_ex_tax ?? 0,
                                                            {
                                                                style: "currency",
                                                                currency: "EUR",
                                                            }
                                                        ),
                                                    })}
                                                </Text>
                                                <Text fontWeight="bold">
                                                    {formatNumber(
                                                        invoices.price_ex_tax -
                                                            (credit_notes?.price_ex_tax ?? 0),
                                                        {
                                                            style: "currency",
                                                            currency: "EUR",
                                                        }
                                                    )}
                                                </Text>
                                            </Flex>
                                            {invoices.price_incl_tax && (
                                                <Flex>
                                                    <Text fontWeight="bold" mr={1}>
                                                        {t("common.totalPriceIncludingTax")}
                                                    </Text>
                                                    <Text mr={1}>
                                                        {t("invoices.selectedAmount", {
                                                            invoicesTotalAmount: formatNumber(
                                                                invoices.price_incl_tax,
                                                                {
                                                                    style: "currency",
                                                                    currency: "EUR",
                                                                }
                                                            ),
                                                            creditNotesTotalAmount: formatNumber(
                                                                credit_notes?.price_incl_tax ?? 0,
                                                                {
                                                                    style: "currency",
                                                                    currency: "EUR",
                                                                }
                                                            ),
                                                        })}
                                                    </Text>
                                                    <Text fontWeight="bold">
                                                        {formatNumber(
                                                            invoices.price_incl_tax -
                                                                (credit_notes?.price_incl_tax ??
                                                                    0),
                                                            {
                                                                style: "currency",
                                                                currency: "EUR",
                                                            }
                                                        )}
                                                    </Text>
                                                </Flex>
                                            )}
                                        </Flex>
                                    }
                                >
                                    <Icon name="info" ml={1} />
                                </TooltipWrapper>
                            </Flex>
                        </Box>
                    )}
                </Flex>
            </Flex>

            {showMarkInvoicesFinalModal && (
                <MarkInvoiceFinalModal
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                    onClose={closeMarkInvoicesFinalModal}
                />
            )}

            {showMarkInvoicesPaidModal && (
                <BulkMarkInvoicesPaidModal
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                    onClose={closeMarkInvoicesPaidModal}
                />
            )}
            {showBulkShareInvoicesModal && (
                <BulkShareInvoicesModal
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                    onClose={closeBulkShareInvoicesModal}
                />
            )}
            {showBulkReminderInvoicesModal && (
                <BulkReminderInvoicesModal
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                    onClose={closeBulkReminderInvoicesModal}
                />
            )}
            {showBulkDuplicateInvoiceModal && (
                <BulkDuplicateInvoicesModal
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                    onClose={closeBulkDuplicateInvoiceModal}
                />
            )}
        </>
    );
};
