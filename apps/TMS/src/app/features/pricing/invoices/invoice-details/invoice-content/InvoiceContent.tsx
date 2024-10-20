import {useFeatureFlag} from "@dashdoc/web-common/src/hooks/useFeatureFlag";
import {t} from "@dashdoc/web-core";
import {Box, Button, Callout, Card, ConfirmationModal, Flex, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {GroupAction} from "app/features/pricing/invoices/invoice-details/invoice-content/actions/GroupAction";
import {GroupActionTooltip} from "app/features/pricing/invoices/invoice-details/invoice-content/actions/GroupActionTooltip";
import {InvoiceGroupedLineGroups} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-groupes-line-groups/InvoiceGroupedLineGroups";
import {InvoiceMergedLineGroups} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-merged-line-groups/InvoiceMergedLineGroups";
import {fetchUpdateInvoice} from "app/redux/actions";
import {CarbonFootprintLine} from "app/taxation/invoicing/features/invoice-or-credit-note/carbon-footprint/CarbonFootprintLine";
import {AddFreeTextButton} from "app/taxation/invoicing/features/invoice-or-credit-note/free-text/AddFreeTextButton";
import {FreeTextLine} from "app/taxation/invoicing/features/invoice-or-credit-note/free-text/FreeTextLine";

import {GroupUngroupContext, GroupUngroupContextProvider} from "./contexts/GroupUngroupContext";
import {InvoiceOrCreditNoteContext} from "./contexts/InvoiceOrCreditNoteContext";
import {InvoiceOrCreditNoteLineGroups} from "./lines/invoice-line-groups/InvoiceLineGroups";
import {StandaloneInvoiceLines} from "./lines/invoice-lines/StandaloneInvoiceLines";

import type {
    AddOrUpdateInvoiceLine,
    Invoice,
    InvoiceLineGroup,
} from "app/taxation/invoicing/types/invoice.types";
import type {InvoiceLine} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

export type InvoiceContentProps = {
    invoice: Invoice;
    fromSharing: boolean;
    onRemoveTransportFromInvoice: (transportUid: string) => void;
    onEditInvoiceLineGroupDescription: (invoiceLineGroupUid: InvoiceLineGroup["id"]) => void;
    onAddInvoiceLine: () => void;
    onRemoveStandaloneInvoiceLine: (invoiceLineId: InvoiceLine["id"]) => void;
    onUpdateStandaloneInvoiceLine: (
        invoiceLineId: InvoiceLine["id"],
        newInvoiceLine: AddOrUpdateInvoiceLine
    ) => void;
    onAddOrUpdateGasIndex: () => void;
};

/**
 * Warning, take care to bugfix InvoiceContent.tsx & deprecated/invoice-content.tsx in the same way.
 */
export const InvoiceContent: FC<InvoiceContentProps> = ({
    invoice,
    fromSharing,
    onRemoveTransportFromInvoice,
    onEditInvoiceLineGroupDescription,
    onAddInvoiceLine,
    onRemoveStandaloneInvoiceLine,
    onUpdateStandaloneInvoiceLine,
    onAddOrUpdateGasIndex,
}) => {
    const hasFuelSurchargeInInvoiceFooter = useFeatureFlag("fuelSurchargeInInvoiceFooter");

    return (
        <InvoiceOrCreditNoteContext.Consumer>
            {({readOnly, isMergeByErrorModalOpen, clearError}) => (
                <>
                    <Card flex="1 1 400px" mt={4} py={4}>
                        {fromSharing && !invoice?.is_dashdoc && (
                            <Callout mx={5} mb={4}>
                                <Text ml={4}>{t("sharedInvoice.warning")}</Text>
                            </Callout>
                        )}
                        <GroupUngroupContextProvider>
                            <GroupUngroupContext.Consumer>
                                {({canMergeByAllGroups}) => (
                                    <>
                                        <Flex px={5} mb={4}>
                                            {!invoice.is_bare_invoice && canMergeByAllGroups && (
                                                <Flex
                                                    width="100%"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                >
                                                    <Text
                                                        variant="h2"
                                                        color="grey.dark"
                                                        data-testid="invoice-content-header"
                                                    >
                                                        {t("invoice.editPDFOutput")}
                                                    </Text>
                                                    {!fromSharing && (
                                                        <Flex flexDirection={"row"}>
                                                            <GroupAction
                                                                invoice={invoice}
                                                                readOnly={readOnly}
                                                                isMergeByErrorModalOpen={
                                                                    isMergeByErrorModalOpen
                                                                }
                                                            />
                                                            <GroupActionTooltip />
                                                        </Flex>
                                                    )}
                                                </Flex>
                                            )}
                                        </Flex>

                                        <Box>
                                            {!invoice.is_bare_invoice && (
                                                <>
                                                    {invoice.group_mode === "MERGED" && (
                                                        <InvoiceMergedLineGroups
                                                            onRemoveTransportFromInvoice={
                                                                onRemoveTransportFromInvoice
                                                            }
                                                            displayThirdPartyCallout={
                                                                !fromSharing &&
                                                                !invoice.is_dashdoc &&
                                                                invoice.status === "draft"
                                                            }
                                                        />
                                                    )}
                                                    {invoice.group_mode === "GROUPED" && (
                                                        <InvoiceGroupedLineGroups
                                                            onRemoveTransportFromInvoice={
                                                                onRemoveTransportFromInvoice
                                                            }
                                                            onEditInvoiceLineGroupDescription={
                                                                onEditInvoiceLineGroupDescription
                                                            }
                                                        />
                                                    )}
                                                    <InvoiceOrCreditNoteLineGroups
                                                        onRemoveTransportFromInvoice={
                                                            onRemoveTransportFromInvoice
                                                        }
                                                        onEditInvoiceLineGroupDescription={
                                                            onEditInvoiceLineGroupDescription
                                                        }
                                                    />
                                                </>
                                            )}

                                            <StandaloneInvoiceLines
                                                onRemoveInvoiceLine={onRemoveStandaloneInvoiceLine}
                                                onUpdateInvoiceLine={onUpdateStandaloneInvoiceLine}
                                                hideIfEmpty={
                                                    fromSharing || invoice.status !== "draft"
                                                }
                                            />
                                            <FreeTextLine
                                                itemUid={invoice.uid}
                                                freeText={invoice.free_text}
                                                fetchUpdate={fetchUpdateInvoice}
                                                readOnly={readOnly}
                                            />
                                            {hasFuelSurchargeInInvoiceFooter && (
                                                <CarbonFootprintLine
                                                    showCarbonFootprint={
                                                        invoice.show_carbon_footprint
                                                    }
                                                    totalCarbonFootprint={
                                                        invoice.total_carbon_footprint
                                                    }
                                                    numTransportWithoutCarbonFootprint={
                                                        invoice.number_of_transports_without_carbon_footprint
                                                    }
                                                />
                                            )}
                                        </Box>
                                    </>
                                )}
                            </GroupUngroupContext.Consumer>
                        </GroupUngroupContextProvider>
                        {!fromSharing && invoice.status === "draft" && (
                            <Flex px={5} mt={5}>
                                <Button
                                    mr={5}
                                    variant="secondary"
                                    onClick={onAddInvoiceLine}
                                    disabled={readOnly}
                                    data-testid="add-invoice-line-button"
                                >
                                    {t("invoice.addInvoiceLine")}
                                </Button>

                                {!invoice.is_bare_invoice && (
                                    <Button
                                        mr={5}
                                        variant="secondary"
                                        onClick={onAddOrUpdateGasIndex}
                                        disabled={readOnly}
                                        data-testid="edit-invoice-gas-index-modal-open"
                                    >
                                        {t("invoice.addOrUpdateGasIndex")}
                                    </Button>
                                )}
                                {invoice.is_dashdoc && (
                                    <AddFreeTextButton
                                        itemUid={invoice.uid}
                                        fetchUpdate={fetchUpdateInvoice}
                                        freeText={invoice.free_text}
                                        readOnly={readOnly}
                                    />
                                )}
                            </Flex>
                        )}
                    </Card>
                    {isMergeByErrorModalOpen && (
                        <ConfirmationModal
                            title={t("components.invoice.cannotMergeTitle")}
                            confirmationMessage={
                                <Callout variant="warning">
                                    <Text>{t("components.invoice.cannotMerge")}</Text>
                                </Callout>
                            }
                            mainButton={{
                                "data-testid": "invoice-not-merged-confirmation-button",
                                children: t("common.confirmUnderstanding"),
                                severity: "warning",
                                onClick: clearError,
                            }}
                            secondaryButton={null}
                        />
                    )}
                </>
            )}
        </InvoiceOrCreditNoteContext.Consumer>
    );
};
