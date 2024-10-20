import {t} from "@dashdoc/web-core";
import {Badge, Box, ClickOutside, Flex, Icon, IconButton, Text} from "@dashdoc/web-ui";
import {formatNumber, Company, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useMemo, useState} from "react";

import {getDraftInvoiceLabel, ExistingDraft} from "app/services/invoicing";
import {getTransportTotalInvoicedPrice} from "app/services/invoicing/pricing.service";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import AddToExistingInvoiceModal from "./add-to-existing-invoice-modal";
import InvoiceableTransportAction from "./invoiceable-transport-action";
import {InvoiceabilityTransport} from "./transports-invoiceability";

type Action =
    | "createNewInvoice"
    | "selectAnotherInvoice"
    | "removeFromInvoice"
    | "groupByTransports"
    | "addToExistingInvoice"
    | "ungroupByTransports";

type InvoiceableTransportsCardProps = {
    existingDrafts: ExistingDraft[];
    debtor: {name: Company["name"]; id: Company["pk"]};
    transports: InvoiceabilityTransport[];
    isUngrouped: boolean;
    selectedDraftInvoice: ExistingDraft | null;
    dataTestId?: string;
    onUngroupInvoicesPerTransport: () => void;
    onGroupInvoicesPerTransport: () => void;
    onAddTransportsToExistingInvoice: (invoiceUid: Invoice["uid"]) => void;
    onAddTransportsToOtherExistingInvoice: (invoiceUid: Invoice["uid"]) => void;
    onCreateNewInvoice: () => void;
    onRemoveTransportsFromInvoicing: undefined | (() => void);
};

const InvoiceableTransportsCard: FunctionComponent<InvoiceableTransportsCardProps> = ({
    debtor,
    transports,
    isUngrouped,
    existingDrafts,
    selectedDraftInvoice,
    dataTestId,
    onUngroupInvoicesPerTransport,
    onAddTransportsToExistingInvoice,
    onGroupInvoicesPerTransport,
    onAddTransportsToOtherExistingInvoice,
    onCreateNewInvoice,
    onRemoveTransportsFromInvoicing,
}) => {
    const [showMoreActions, setShowMoreActions] = useState(false);
    const [
        showAddTransportToExistingInvoiceModal,
        openAddTransportToExistingInvoiceModal,
        closeAddTransportToExistingInvoiceModal,
    ] = useToggle(false);

    const [
        showSelectOtherInvoiceModal,
        openSelectOtherInvoiceModal,
        closeSelectOtherInvoiceModal,
    ] = useToggle(false);

    const invoiceCreationInfo = useMemo(() => {
        if (selectedDraftInvoice) {
            const label = getDraftInvoiceLabel(selectedDraftInvoice);
            return t("components.additionToInvoice", {
                invoice: label,
            });
        }

        return t("common.xNewDrafts", {smart_count: isUngrouped ? transports.length : 1});
    }, [selectedDraftInvoice, isUngrouped, transports.length]);

    let actions: Action[] = [];
    if (selectedDraftInvoice) {
        actions = ["createNewInvoice", "selectAnotherInvoice"];
    } else if (isUngrouped) {
        actions = ["groupByTransports", "addToExistingInvoice"];
    } else {
        actions = ["ungroupByTransports", "addToExistingInvoice"];
    }
    if (onRemoveTransportsFromInvoicing) {
        // FIXME : This is a quick fix because this doesn't work if allTransportsSelected is true
        actions.push("removeFromInvoice");
    }

    const _renderAction = (action: Action) => {
        if (action === "createNewInvoice") {
            return (
                <InvoiceableTransportAction
                    key={1}
                    label={t("components.createNewInvoice")}
                    iconName="invoice"
                    onClickAction={() => {
                        onCreateNewInvoice();
                        setShowMoreActions(false);
                    }}
                />
            );
        }
        if (action === "selectAnotherInvoice") {
            return (
                <InvoiceableTransportAction
                    key={2}
                    borderTop="1px solid"
                    borderTopColor="grey.light"
                    label={t("components.selectAnotherInvoice")}
                    iconName="select"
                    onClickAction={() => {
                        openSelectOtherInvoiceModal();
                        setShowMoreActions(false);
                    }}
                />
            );
        }
        if (action === "removeFromInvoice") {
            return (
                <InvoiceableTransportAction
                    key={3}
                    borderTop="1px solid"
                    borderTopColor="grey.light"
                    label={t("invoicingFlow.removeDraftFromBilling")}
                    iconName="close"
                    onClickAction={() => {
                        // @ts-ignore
                        onRemoveTransportsFromInvoicing();
                        setShowMoreActions(false);
                    }}
                />
            );
        }
        if (action === "groupByTransports") {
            if (transports.length <= 1) {
                return null;
            }

            return (
                <InvoiceableTransportAction
                    key={4}
                    label={t("invoicingFlow.groupByTransports")}
                    iconName="merge"
                    iconRotation={-90}
                    onClickAction={() => {
                        onGroupInvoicesPerTransport();
                        setShowMoreActions(false);
                    }}
                />
            );
        }
        if (action === "addToExistingInvoice") {
            if (existingDrafts.length <= 0) {
                return null;
            }
            return (
                <InvoiceableTransportAction
                    key={5}
                    borderTop="1px solid"
                    borderTopColor="grey.light"
                    label={t("invoicingFlow.addToExistingInvoice")}
                    iconName="add"
                    onClickAction={() => {
                        openAddTransportToExistingInvoiceModal();
                        setShowMoreActions(false);
                    }}
                    dataTestId="invoice-transport-add-to-existing-invoice-button"
                />
            );
        }
        if (action === "ungroupByTransports") {
            if (transports.length <= 1) {
                return null;
            }
            return (
                <InvoiceableTransportAction
                    key={6}
                    label={t("invoicingFlow.ungroupByTransports")}
                    iconName="split"
                    onClickAction={() => {
                        onUngroupInvoicesPerTransport();
                        setShowMoreActions(false);
                    }}
                />
            );
        }

        return null;
    };

    const totalPriceOfTransports = transports.reduce((total, transport) => {
        return total + Number(getTransportTotalInvoicedPrice(transport));
    }, 0);

    return (
        <Flex
            data-testid={dataTestId}
            borderColor="grey.light"
            borderWidth="1px"
            borderStyle="solid"
            borderRadius={1}
            flexDirection="row"
            flexWrap="wrap"
            mt={2}
            p={4}
            alignItems="center"
            justifyContent="space-between"
        >
            <Flex flexShrink="0" flexDirection="column">
                <Text data-testid="debtor-name">{debtor.name}</Text>
                <Flex style={{columnGap: "8px"}} alignItems="center">
                    <Text variant="caption" data-testid="transports-count">
                        {t("common.xTransports", {smart_count: transports.length})}
                    </Text>
                    <Text>-</Text>
                    <Text color="grey.dark" data-testid="price">
                        {formatNumber(totalPriceOfTransports, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                </Flex>
            </Flex>
            <Flex alignItems="center" justifyContent="flex-end">
                <Badge display="flex" alignItems="center" variant="neutral">
                    {!selectedDraftInvoice && (
                        <Icon
                            name={isUngrouped ? "split" : "merge"}
                            mr={2}
                            rotation={isUngrouped ? 0 : -90}
                            color="grey.dark"
                        />
                    )}
                    <Text
                        maxWidth={160}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        color="grey.dark"
                    >
                        {invoiceCreationInfo}
                    </Text>
                </Badge>

                {actions.length > 0 && (
                    <ClickOutside onClickOutside={() => setShowMoreActions(false)}>
                        <Flex
                            position="relative"
                            ml={3}
                            alignItems="center"
                            justifyContent="flex-end"
                        >
                            <IconButton
                                name="moreActions"
                                onClick={() => setShowMoreActions((lastValue) => !lastValue)}
                                data-testid="invoice-transport-more-actions-button"
                            />
                            {showMoreActions && (
                                <Box
                                    position="absolute"
                                    top={64}
                                    right={-16}
                                    backgroundColor="grey.white"
                                    boxShadow="large"
                                    zIndex="level1"
                                >
                                    {actions.map((action) => _renderAction(action))}
                                </Box>
                            )}
                        </Flex>
                    </ClickOutside>
                )}
            </Flex>

            {showAddTransportToExistingInvoiceModal && (
                <AddToExistingInvoiceModal
                    debtorName={debtor.name}
                    existingDrafts={existingDrafts}
                    onClose={closeAddTransportToExistingInvoiceModal}
                    onSubmit={onAddTransportsToExistingInvoice}
                />
            )}

            {showSelectOtherInvoiceModal && (
                <AddToExistingInvoiceModal
                    debtorName={debtor.name}
                    existingDrafts={existingDrafts}
                    selectedDraftUid={selectedDraftInvoice?.uid}
                    onClose={closeSelectOtherInvoiceModal}
                    onSubmit={onAddTransportsToOtherExistingInvoice}
                />
            )}
        </Flex>
    );
};

export default InvoiceableTransportsCard;
