import {guid} from "@dashdoc/core";
import {
    getConnectedCompany,
    getConnectedManager,
    useFeatureFlag,
    useTimezone,
} from "@dashdoc/web-common";
import {
    ORDERS_BUSINESS_STATUSES,
    TRANSPORTS_BUSINESS_STATUSES,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, IconButton, Text, theme} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useMemo, useState} from "react";

import ExportTransportsModal from "app/features/export/export-transports/ExportTransportsModal";
import {
    getTransportsQueryParamsFromFiltersQuery,
    type TransportsQueryParams,
} from "app/features/filters/deprecated/utils";
import ArchiveModal from "app/features/transport/actions/archive-modal";
import BulkSetCustomerToInvoiceModal from "app/features/transport/actions/bulk/BulkSetCustomerToInvoiceModal";
import {BulkShipperInvoicingStatus} from "app/features/transport/actions/bulk/BulkShipperInvoicingStatus";
import ConfirmTransportsModal from "app/features/transport/actions/bulk/confirm-transports-modal";
import DeclineTransportsModal from "app/features/transport/actions/bulk/decline-transports-modal";
import {DeleteTransportsModal} from "app/features/transport/actions/bulk/delete-transports-modal";
import InvoiceTransportModal from "app/features/transport/actions/bulk/invoice-transports-modal";
import {MarkMultipleTransportsAsInvoicedModal} from "app/features/transport/actions/bulk/mark-multiple-transports-as-invoiced-modal";
import MarkTransportsAsDoneModal from "app/features/transport/actions/bulk/mark-transports-as-done-modal";
import MarkTransportsPaidModal from "app/features/transport/actions/bulk/mark-transports-paid-modal";
import MarkTransportsVerifiedModal from "app/features/transport/actions/bulk/mark-transports-verified-modal";
import {SendToTruckerAction} from "app/features/transport/actions/bulk/SendToTruckerAction";
import {BulkSetInvoiceItemOrPricingModal} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetInvoiceItemOrPricingModal";
import {SetInvoiceNumberOnMultipleTransportModal} from "app/features/transport/actions/bulk/set-invoice-number-on-multiple-transports-modal";
import {BulkAddTagsModal} from "app/features/transport/actions/bulk/tags/AddTagsModal";
import {BulkRemoveTagsModal} from "app/features/transport/actions/bulk/tags/RemoveTagsModal";
import {useSubcontractOrdersPrice} from "app/features/transport/hooks/useSubcontractOrdersPrice";
import {useTotalTransportsPrice} from "app/features/transport/hooks/useTotalTransportsPrice";
import {BulkAssignAction} from "app/features/transportation-plan/assign/BulkAssignAction";
import {ConfirmDraftAssignedAction} from "app/features/transportation-plan/carrier-draft-assigned/ConfirmDraftAssignedAction";
import {PlanOrCharterBulkAction} from "app/features/transportation-plan/plan-or-subcontract/PlanOrCharterBulkAction";
import {PlanOrSubcontractBulkAction} from "app/features/transportation-plan/plan-or-subcontract/PlanOrSubcontractBulkAction";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useIsReadOnly} from "app/hooks/useIsReadOnly";
import {unselectAllRows} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {InvoicingOnboardingWizard} from "app/taxation/invoicing/features/onboarding-wizard/InvoicingOnboardingWizard";
import {
    ORDERS_CHECKED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
} from "app/types/businessStatus";
import {TRANSPORTS_QUERY_NAME} from "app/types/constants";

import {MoreBulkActions} from "./MoreBulkActions";

export type BulkActionsProps = {
    currentQuery: SearchQuery;
    selectedRows: string[];
    selectedTransportsCount: number;
    selectedTransportsQuery: TransportsQueryParams | {uid__in: string[]};
    allTransportsSelected: boolean;
    allTransportsCount: number;
};

export const BulkActions: FunctionComponent<BulkActionsProps> = ({
    currentQuery,
    selectedRows,
    selectedTransportsCount,
    selectedTransportsQuery,
    allTransportsSelected,
    allTransportsCount,
}) => {
    const timezone = useTimezone();
    const dispatch = useDispatch();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);
    const [key, setKey] = useState("_");
    const transportListRefresher = useRefreshTransportLists();

    const isReadOnly = useIsReadOnly();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    // Modals states
    const [isExportModalOpen, openExportModal, closeExportModal] = useToggle();
    const [isArchiveModalOpen, openArchiveModal, closeArchiveModal] = useToggle();
    // const [isCancelModalOpen, openCancelModal, closeCancelModal] = useToggle();
    const [isUnarchiveModalOpen, openUnarchiveModal, closeUnarchiveModal] = useToggle();
    const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle();

    const [isMarkVerifiedModalOpen, openMarkVerifiedModal, closeMarkVerifiedModal] = useToggle();
    const [
        isMarkMultipleTransportsAsInvoicedModalOpen,
        openMarkMultipleTransportsAsInvoicedModal,
        closeMarkMultipleTransportsAsInvoicedModal,
    ] = useToggle();
    const [isSetInvoiceNumberModalOpen, openSetInvoiceNumberModal, closeSetInvoiceNumberModal] =
        useToggle();
    const [isMarkAsDoneModalOpen, openMarkAsDoneModal, closeMarkAsDoneModal] = useToggle();
    const [isMarkPaidModalOpen, openMarkPaidModal, closeMarkPaidModal] = useToggle();
    const [isInvoiceTransportModalOpen, openInvoiceTransportModal, closeInvoiceTransportModal] =
        useToggle();
    const [isConfirmTransportsModal, openConfirmTransportsModal, closeConfirmTransportsModal] =
        useToggle();
    const [isDeclineTransportsModal, openDeclineTransportsModal, closeDeclineTransportsModal] =
        useToggle();
    const [
        isBulkSetCustomerToInvoiceModalOpen,
        openBulkSetCustomerToInvoiceModal,
        closeBulkSetCustomerToInvoiceModal,
    ] = useToggle();
    const [
        isInvoicingOnboardingModalOpen,
        openInvoicingOnboardingModal,
        closeInvoicingOnboardingModal,
    ] = useToggle();
    const [
        isBulkSetInvoiceItemOrPricingModalOpen,
        openBulkSetInvoiceItemOrPricingModal,
        closeBulkSetInvoiceItemOrPricingModal,
    ] = useToggle();

    const [isBulkAddTagsModalOpen, openBulkAddTagsModal, closeBulkAddTagsModal] = useToggle();
    const [isBulkRemoveTagsModalOpen, openBulkRemoveTagsModal, closeBulkRemoveTagsModal] =
        useToggle();
    const filters = useMemo(() => {
        let result: SearchQuery = {uid__in: selectedRows};
        if (allTransportsSelected) {
            result = getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true);
        }
        return result;
    }, [selectedRows, currentQuery, timezone, allTransportsSelected]);

    const tab = currentQuery.tab;

    const snakeCaseCurrentTab = tab.replace(
        /[A-Z]/g,
        (letter: string) => `_${letter.toLowerCase()}`
    );

    const managerSelectedColumns = manager
        ? manager.transport_columns[snakeCaseCurrentTab] || manager.shipment_columns
        : [];

    const isOrderTab = ORDERS_BUSINESS_STATUSES.includes(tab);
    const isTransportTab = TRANSPORTS_BUSINESS_STATUSES.includes(tab);

    const subcontractorColumns = ["all_prices", "parent_prices", "margin"];
    const isSomeSubcontractorColumnsSelected = subcontractorColumns.some((column) =>
        managerSelectedColumns.includes(column)
    );
    const isMarginColumnSelected = managerSelectedColumns.includes("margin");
    const isAllPricesColumnSelected = managerSelectedColumns.includes("all_prices");
    const isParentPricesColumnSelected = managerSelectedColumns.includes("parent_prices");
    const {
        margin,
        totalWeightedParentTransportPrice,
        totalTransportPrice: totalChildTransportPrice,
    } = useSubcontractOrdersPrice(tab, filters);
    const totalTransportsPrice = useTotalTransportsPrice(tab, filters);

    const InvoicingButtons = () => {
        return (
            <>
                {!hasInvoiceEntityEnabled && (
                    <>
                        <IconButton
                            ml={2}
                            name="check"
                            label={t("components.markInvoiced")}
                            onClick={openMarkMultipleTransportsAsInvoicedModal}
                            data-testid="transports-screen-bulk-invoice-button"
                        />
                        <IconButton
                            ml={2}
                            name="check"
                            label={t("components.markPaid")}
                            onClick={openMarkPaidModal}
                            data-testid="transports-screen-bulk-mark-paid-button"
                        />
                    </>
                )}
                {hasInvoiceEntityEnabled && tab !== TRANSPORTS_DONE_TAB && (
                    <IconButton
                        ml={2}
                        name="accountingInvoice"
                        label={t("action.invoice")}
                        onClick={openInvoiceTransportModal}
                        data-testid="transports-screen-bulk-invoice-button"
                    />
                )}
            </>
        );
    };

    return (
        <>
            <Flex
                flex={1}
                alignItems="center"
                fontWeight={400}
                fontSize={2}
                justifyContent="space-between"
            >
                <Flex
                    flexWrap="wrap"
                    flex={3}
                    alignItems="center"
                    css={{
                        // Add separator between each bulk action aside the last one
                        "> *:not(:nth-last-child(-n + 2))": {
                            borderRight: `1px solid ${theme.colors.grey.dark}`,
                            paddingRight: "8px",
                            height: "2em",
                            borderRadius: 0,
                        },
                    }}
                >
                    {/* ORDERS TAB MAIN BULK ACTIONS */}
                    {tab === ORDERS_TO_ASSIGN_OR_DECLINED_TAB && (
                        <BulkAssignAction query={filters} />
                    )}
                    {tab === ORDERS_TO_SEND_TO_CARRIER_TAB && !isReadOnly && (
                        <>
                            <ConfirmDraftAssignedAction
                                selectedTransportsQuery={selectedTransportsQuery}
                                selectedTransportsCount={selectedTransportsCount}
                                onSubmit={transportListRefresher}
                            />
                            {/* Uncomment when bulk assign carrier is ready */}
                            {/* <Button
                                ml={2}
                                onClick={}
                                variant="plain"
                                data-testid="mass-assign-carrier"
                            >
                                <Icon name="truck" mr={3} />
                                {t("components.assignCarrier")}
                            </Button> */}
                            <IconButton
                                ml={2}
                                name="check"
                                label={t("common.markDone")}
                                onClick={openMarkAsDoneModal}
                                data-testid="mark-done-button"
                            />
                        </>
                    )}
                    {tab == ORDERS_ONGOING_TAB && (
                        <Button
                            ml={2}
                            onClick={openMarkAsDoneModal}
                            variant="plain"
                            data-testid="mark-done-button"
                        >
                            <Icon name="check" mr={2} />
                            {t("common.markDone")}
                        </Button>
                    )}
                    {/* TRANSPORTS TAB MAIN BULK ACTIONS */}
                    {tab === TRANSPORTS_TO_APPROVE_TAB && (
                        <>
                            <Flex>
                                <IconButton
                                    name="check"
                                    color="blue.default"
                                    onClick={openConfirmTransportsModal}
                                    ml={2}
                                    label={t("common.accept")}
                                />
                            </Flex>
                            <Flex>
                                <IconButton
                                    name="removeCircle"
                                    label={t("common.decline")}
                                    onClick={openDeclineTransportsModal}
                                    color="red.default"
                                    ml={2}
                                />
                            </Flex>

                            <PlanOrSubcontractBulkAction query={filters} />
                            <IconButton
                                ml={2}
                                onClick={openMarkAsDoneModal}
                                name="check"
                                label={t("common.markDone")}
                                data-testid="mark-done-button"
                            />
                        </>
                    )}
                    {tab === TRANSPORTS_TO_PLAN_TAB && (
                        <>
                            <PlanOrSubcontractBulkAction query={filters} color="blue.default" />

                            <IconButton
                                ml={2}
                                onClick={openMarkAsDoneModal}
                                name="check"
                                label={t("common.markDone")}
                                data-testid="mark-done-button"
                            />
                        </>
                    )}
                    {tab === TRANSPORTS_TO_SEND_TO_TRUCKER_TAB && (
                        <>
                            <SendToTruckerAction
                                currentSelection={selectedRows}
                                // @ts-ignore
                                currentQuery={currentQuery}
                                allTransportsSelected={allTransportsSelected}
                                timezone={timezone}
                                refetchTransports={transportListRefresher}
                            />
                            {company?.settings?.bulk_charter_dedicated_transport ? (
                                <PlanOrCharterBulkAction
                                    query={filters}
                                    iconButtonProps={{
                                        ml: 2,
                                        name: "truck",
                                        label: t("components.rePlanOrCharterDedicated"),
                                    }}
                                />
                            ) : (
                                <PlanOrSubcontractBulkAction
                                    query={filters}
                                    label={t("components.rePlanOrCharter")}
                                />
                            )}

                            <IconButton
                                ml={2}
                                onClick={openMarkAsDoneModal}
                                name="check"
                                label={t("common.markDone")}
                                data-testid="mark-done-button"
                            />
                        </>
                    )}
                    {tab === TRANSPORTS_ONGOING_TAB && (
                        <>
                            <IconButton
                                name="check"
                                label={t("common.markDone")}
                                ml={2}
                                onClick={openMarkAsDoneModal}
                                color="blue.default"
                                data-testid="mark-done-button"
                            />

                            <PlanOrSubcontractBulkAction
                                query={filters}
                                label={t("components.rePlanOrCharter")}
                            />
                        </>
                    )}
                    {tab === TRANSPORTS_DONE_TAB && (
                        <>
                            <IconButton
                                name="check"
                                label={t("components.markVerified")}
                                ml={2}
                                onClick={openMarkVerifiedModal}
                                color="blue.default"
                                data-testid="mark-verified-button"
                            />
                            <InvoicingButtons />
                        </>
                    )}
                    {tab === TRANSPORTS_BILLING_TAB && <InvoicingButtons />}
                    {/* TODO: Mark as not verified bulk actions */}
                    {/* TODO: Uncomment when bulk cancel order is implemented */}
                    {/* {tab === ORDERS_AWAITING_CONFIRMATION_TAB && (
                    <IconButton
                    ml={2}
                    key="cancel-order"
                    name="cancel"
                    onClick={openCancelModal}
                    label={t("common.cancel")}
                />
                )} */}

                    {isOrderTab && (
                        <>
                            <BulkShipperInvoicingStatus
                                refetchTransports={transportListRefresher}
                                selectedTransportsQuery={selectedTransportsQuery}
                                selectedTransportsCount={selectedTransportsCount}
                                isOrderCheckedTab={tab === ORDERS_CHECKED_TAB}
                            />
                            <Box>
                                <IconButton
                                    ml={2}
                                    name="checkList"
                                    label={t("components.setInvoiceNumberBulkAction")}
                                    onClick={openSetInvoiceNumberModal}
                                    data-testid="transports-screen-bulk-set-invoice-number"
                                />
                            </Box>
                        </>
                    )}

                    <MoreBulkActions
                        key={key}
                        selectedTransportsCount={selectedTransportsCount}
                        selectedTransportsQuery={selectedTransportsQuery}
                        currentQuery={currentQuery}
                        tab={tab}
                        openArchiveModal={openArchiveModal}
                        openUnarchiveModal={openUnarchiveModal}
                        openExportModal={openExportModal}
                        openDeleteModal={openDeleteModal}
                        openBulkSetCustomerToInvoiceModal={openBulkSetCustomerToInvoiceModal}
                        openBulkSetInvoiceItemOrPricingModal={openBulkSetInvoiceItemOrPricingModal}
                        openBulkAddTagsModal={openBulkAddTagsModal}
                        openBulkRemoveTagsModal={openBulkRemoveTagsModal}
                    />
                </Flex>
                {/* SECTION: Total transports price */}
                {isTransportTab && totalTransportsPrice && (
                    <Flex justifyContent="flex-end" ml={3}>
                        <Flex alignItems="center" style={{columnGap: "4px"}}>
                            <Text fontWeight="bold">{t("common.totalPriceExcludingTax")}</Text>
                            <Text data-testid="total-transports-price">
                                {formatNumber(totalTransportsPrice.price_without_tax, {
                                    style: "currency",
                                    currency: "EUR",
                                })}
                            </Text>
                        </Flex>
                    </Flex>
                )}
                {/* SECTION: Orders only -> show total (parent_transport, transport and margin)*/}
                {isOrderTab && isSomeSubcontractorColumnsSelected && (
                    <Flex
                        alignItems="center"
                        style={{columnGap: "4px"}}
                        ml={3}
                        flexWrap="wrap"
                        flex={2}
                        justifyContent="flex-end"
                    >
                        <Text flexShrink={0} fontWeight="bold">
                            {t("common.total")} :{" "}
                        </Text>
                        {isAllPricesColumnSelected && (
                            <Text flexShrink={0} data-testid="total-child-transport-price">
                                {t("chartering.charter")}
                                <span> : </span>
                                {formatNumber(totalChildTransportPrice, {
                                    style: "currency",
                                    currency: "EUR",
                                })}
                                {(isParentPricesColumnSelected || isMarginColumnSelected) && (
                                    <span> | </span>
                                )}
                            </Text>
                        )}
                        {isParentPricesColumnSelected && (
                            <Text flexShrink={0} data-testid="total-weighted-parent-price">
                                {t("common.originalTransport")}
                                <span> : </span>
                                {formatNumber(totalWeightedParentTransportPrice, {
                                    style: "currency",
                                    currency: "EUR",
                                })}
                                {isMarginColumnSelected && <span> | </span>}
                            </Text>
                        )}
                        {isMarginColumnSelected && (
                            <Text flexShrink={0}>
                                {t("common.margin")}
                                <span> : </span>
                                <Text
                                    display="inline"
                                    color={
                                        margin === null
                                            ? "grey"
                                            : margin > 0
                                              ? "green.dark"
                                              : "red.dark"
                                    }
                                    data-testid="total-margin"
                                >
                                    {formatNumber(margin, {
                                        style: "currency",
                                        currency: "EUR",
                                    })}
                                </Text>
                            </Text>
                        )}
                    </Flex>
                )}
            </Flex>
            {/* Modals */}
            {isExportModalOpen && (
                <ExportTransportsModal
                    onClose={closeExportModal}
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    isOrderTab={tab === "results" || isOrderTab}
                    isTransportTab={tab === "results" || isTransportTab}
                />
            )}
            {/* {isCancelModalOpen && (
                <CancelTransportModal onClose={closeCancelModal} transportUid={transport.uid} />
            )} */}
            {(isArchiveModalOpen || isUnarchiveModalOpen) && (
                <ArchiveModal
                    onSubmit={transportListRefresher}
                    onClose={isArchiveModalOpen ? closeArchiveModal : closeUnarchiveModal}
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    type={isArchiveModalOpen ? "archive" : "unarchive"}
                />
            )}
            {isDeleteModalOpen && (
                <DeleteTransportsModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    refetchTransports={transportListRefresher}
                    unselectAllRows={() => dispatch(unselectAllRows(TRANSPORTS_QUERY_NAME))}
                    onClose={closeDeleteModal}
                />
            )}
            {isMarkAsDoneModalOpen && (
                <MarkTransportsAsDoneModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={closeMarkAsDoneModal}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isMarkVerifiedModalOpen && (
                <MarkTransportsVerifiedModal
                    onClose={closeMarkVerifiedModal}
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isMarkMultipleTransportsAsInvoicedModalOpen && (
                <MarkMultipleTransportsAsInvoicedModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={closeMarkMultipleTransportsAsInvoicedModal}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isSetInvoiceNumberModalOpen && (
                <SetInvoiceNumberOnMultipleTransportModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={closeSetInvoiceNumberModal}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isMarkPaidModalOpen && (
                <MarkTransportsPaidModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={closeMarkPaidModal}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isInvoiceTransportModalOpen && (
                <InvoiceTransportModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={closeInvoiceTransportModal}
                    onDashdocInvoicingNotReady={openInvoicingOnboardingModal}
                />
            )}
            {isConfirmTransportsModal && (
                <ConfirmTransportsModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={closeConfirmTransportsModal}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isDeclineTransportsModal && (
                <DeclineTransportsModal
                    bulk={true}
                    selectedTransports={selectedRows}
                    allTransportsSelected={allTransportsSelected}
                    allTransportsCount={allTransportsCount || 0}
                    onClose={closeDeclineTransportsModal}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isBulkSetCustomerToInvoiceModalOpen && (
                <BulkSetCustomerToInvoiceModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={() => {
                        closeBulkSetCustomerToInvoiceModal();
                        closeMoreActions();
                    }}
                    refetchTransports={transportListRefresher}
                />
            )}
            {isInvoicingOnboardingModalOpen && (
                <InvoicingOnboardingWizard onClose={closeInvoicingOnboardingModal} />
            )}
            {isBulkSetInvoiceItemOrPricingModalOpen && (
                <BulkSetInvoiceItemOrPricingModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={() => {
                        closeBulkSetInvoiceItemOrPricingModal();
                        closeMoreActions();
                    }}
                />
            )}
            {isBulkAddTagsModalOpen && (
                <BulkAddTagsModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={() => {
                        closeBulkAddTagsModal();
                        closeMoreActions();
                    }}
                />
            )}
            {isBulkRemoveTagsModalOpen && (
                <BulkRemoveTagsModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={() => {
                        closeBulkRemoveTagsModal();
                        closeMoreActions();
                    }}
                />
            )}
        </>
    );

    function closeMoreActions() {
        // update the key to reset the state of the more actions
        setKey(guid());
    }
};
