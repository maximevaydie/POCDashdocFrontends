import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ClickOutside, Flex, IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {ORDERS_OR_TRANSPORTS_RESULTS_TAB, TabName} from "app/common/tabs";
import {CarbonActions} from "app/features/transport/actions/bulk/carbon/CarbonActions";
import {MoreBulkAction} from "app/features/transport/actions/bulk/MoreBulkAction";
import {useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TAB,
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
} from "app/types/businessStatus";

import type {TransportsQueryParams} from "app/features/filters/deprecated/utils";

type Props = {
    currentQuery: SearchQuery;
    tab: TabName;
    selectedTransportsCount: number;
    selectedTransportsQuery: TransportsQueryParams | {uid__in: string[]};
    openArchiveModal: () => void;
    openUnarchiveModal: () => void;
    openDeleteModal: () => void;
    openExportModal: () => void;
    openBulkSetCustomerToInvoiceModal: () => void;
    openBulkSetInvoiceItemOrPricingModal: () => void;
    openBulkAddTagsModal: () => void;
    openBulkRemoveTagsModal: () => void;
};

export function MoreBulkActions({
    currentQuery,
    tab,
    selectedTransportsCount,
    selectedTransportsQuery,
    openArchiveModal,
    openUnarchiveModal,
    openDeleteModal,
    openExportModal,
    openBulkSetCustomerToInvoiceModal,
    openBulkSetInvoiceItemOrPricingModal,
    openBulkAddTagsModal,
    openBulkRemoveTagsModal,
}: Props) {
    const [
        showMoreActions,
        ,
        /*here we have openMoreActions that is not used */ closeMoreActions,
        toggleMoreActions,
    ] = useToggle(false);

    const connectedManager = useSelector(getConnectedManager);
    const hasAtLeastUserRole = managerService.hasAtLeastUserRole(connectedManager);

    return (
        <ClickOutside position="relative" onClickOutside={closeMoreActions} ml={2}>
            <IconButton
                color="grey.dark"
                name="arrowDown"
                iconPosition="right"
                label={t("common.moreActions")}
                onClick={toggleMoreActions}
                data-testid="transport-more-actions-dropdown-button"
            />

            {showMoreActions && (
                <Flex
                    flexDirection={"column"}
                    width="100%"
                    minWidth="fit-content"
                    position="absolute"
                    backgroundColor="grey.white"
                    boxShadow="large"
                    borderRadius={1}
                    zIndex="level1"
                >
                    {[
                        TRANSPORTS_TAB,
                        TRANSPORTS_BILLING_TAB,
                        TRANSPORTS_DONE_TAB,
                        TRANSPORTS_ONGOING_TAB,
                        TRANSPORTS_TO_APPROVE_TAB,
                        TRANSPORTS_TO_PLAN_TAB,
                        TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
                        ORDERS_OR_TRANSPORTS_RESULTS_TAB,
                    ].includes(tab) && (
                        <CarbonActions
                            onClose={closeMoreActions}
                            selectedTransportsCount={selectedTransportsCount}
                            selectedTransportsQuery={selectedTransportsQuery}
                        />
                    )}
                    {hasAtLeastUserRole &&
                        [TRANSPORTS_DONE_TAB, TRANSPORTS_BILLING_TAB].includes(tab) && (
                            <>
                                <MoreBulkAction
                                    iconName="bulkSetInvoiceItemOrPricing"
                                    label={t("bulkAction.setInvoiceItemOrPricing.title")}
                                    onClick={openBulkSetInvoiceItemOrPricingModal}
                                    data-testid="bulk-set-invoice-item-or-pricing-button"
                                />
                                <MoreBulkAction
                                    iconName="invoice"
                                    label={t("bulkAction.updateCustomerToInvoice")}
                                    onClick={openBulkSetCustomerToInvoiceModal}
                                    data-testid="bulk-set-customer-to-invoice-button"
                                    separateBelow
                                />
                            </>
                        )}

                    <MoreBulkAction
                        iconName="tagsAdd"
                        label={t("bulkAction.addTags.modalTitle")}
                        onClick={openBulkAddTagsModal}
                        data-testid="bulk-add-tags-button"
                    />
                    <MoreBulkAction
                        iconName="tagsRemove"
                        label={t("bulkAction.removeTags.modalTitle")}
                        onClick={openBulkRemoveTagsModal}
                        data-testid="bulk-remove-tags-button"
                        separateBelow
                    />
                    <MoreBulkAction
                        iconName="export"
                        label={t("common.export")}
                        data-testid="export-button"
                        onClick={openExportModal}
                    />
                    <MoreBulkAction
                        iconName="archive"
                        label={currentQuery.archived ? t("common.unarchive") : t("common.archive")}
                        onClick={currentQuery.archived ? openUnarchiveModal : openArchiveModal}
                        data-testid="archive-button"
                    />
                    {[
                        TRANSPORTS_TO_APPROVE_TAB,
                        TRANSPORTS_TO_PLAN_TAB,
                        TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
                        TRANSPORTS_ONGOING_TAB,
                        ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
                        ORDERS_AWAITING_CONFIRMATION_TAB,
                        ORDERS_ONGOING_TAB,
                        ORDERS_TO_SEND_TO_CARRIER_TAB,
                    ].includes(tab) && (
                        <MoreBulkAction
                            separateAbove
                            iconName="bin"
                            label={t("common.delete")}
                            onClick={openDeleteModal}
                            color={"red.dark"}
                            data-testid="delete-button"
                        />
                    )}
                </Flex>
            )}
        </ClickOutside>
    );
}
