import {queryService, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Flex,
    Icon,
    IconButton,
    Link,
    Modal,
    Popover,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {fetchCheckOrders, fetchUncheckOrders} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type BulkShipperInvoicingStatusProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    isOrderCheckedTab: boolean;
    refetchTransports: () => void;
};

type BulkShipperInvoicingStatusActionType = "CHECK" | "UNCHECK";

type BulkShipperInvoicingStatusResponse = {
    updatedCount: number;
    notUpdatedCount: number;
    notUpdatedTransports: {uid: string; id: number}[];
};

export function BulkShipperInvoicingStatus({
    isOrderCheckedTab,
    selectedTransportsQuery,
    selectedTransportsCount,
    refetchTransports,
}: BulkShipperInvoicingStatusProps) {
    const dispatch = useDispatch();
    const [actionType, setActionType] = useState<BulkShipperInvoicingStatusActionType>("CHECK");
    const [response, setResponse] = useState<BulkShipperInvoicingStatusResponse | null>(null);
    const [isPopover, openPopover, closePopover] = useToggle();
    const [isFeedbackModal, openFeedbackModal, closeFeedbackModal] = useToggle();

    async function onMarkCheckOrUncheck(checkOrUncheck: BulkShipperInvoicingStatusActionType) {
        let bulkResponse = null;
        const payload = {
            filters: queryService.toQueryString(selectedTransportsQuery),
        };
        if (checkOrUncheck === "CHECK") {
            const {response} = await dispatch(fetchCheckOrders(payload));
            bulkResponse = {
                updatedCount: response.transports_checked_count,
                notUpdatedCount: response.transports_not_checked_count,
                notUpdatedTransports: response.transports_not_checked,
            };
        } else {
            const {response} = await dispatch(fetchUncheckOrders(payload));
            bulkResponse = {
                updatedCount: response.transports_unchecked_count,
                notUpdatedCount: response.transports_not_unchecked_count,
                notUpdatedTransports: response.transports_not_unchecked,
            };
        }
        if (bulkResponse && bulkResponse.notUpdatedCount > 0 && bulkResponse.updatedCount > 0) {
            openFeedbackModal();
        } else {
            const toastMessage =
                checkOrUncheck == "CHECK"
                    ? t("components.transportsSuccessfullyChecked")
                    : t("components.transportsSuccessfullyUnchecked");

            toast.success(toastMessage);
        }

        setResponse(bulkResponse);
        setActionType(checkOrUncheck);
        closePopover();
        refetchTransports();
    }

    if (isOrderCheckedTab) {
        return (
            <IconButton
                name="checkList"
                label={t("order.markUnchecked")}
                data-testid="bulk-mark-unchecked"
                onClick={() => onMarkCheckOrUncheck("UNCHECK")}
                ml={2}
            />
        );
    }

    return (
        <Flex>
            <Popover
                visibility={{
                    isOpen: isPopover,
                    onOpenChange: (value) => {
                        if (!value) {
                            closePopover();
                        }
                    },
                }}
            >
                <Popover.Trigger>
                    <IconButton
                        name="checkList"
                        label={t("bulkAction.markCheckedOrUnchecked")}
                        onClick={openPopover}
                        data-testid="bulk-invoicing-status-by-shipper"
                        ml={2}
                    />
                </Popover.Trigger>
                <Popover.Content minWidth="170px">
                    <Flex flexDirection="column" width="100%">
                        <Flex justifyContent="center" flexDirection="column" style={{gap: "4px"}}>
                            <Button
                                onClick={() => onMarkCheckOrUncheck("CHECK")}
                                data-testid="bulk-mark-checked-by-shipper-button"
                            >
                                {t("order.markChecked")}
                            </Button>
                            <Button
                                onClick={() => onMarkCheckOrUncheck("UNCHECK")}
                                data-testid="bulk-mark-unchecked-by-shipper-button"
                            >
                                {t("order.markUnchecked")}
                            </Button>
                        </Flex>
                    </Flex>
                </Popover.Content>
            </Popover>
            {isFeedbackModal && (
                <BulkShipperInvoicingStatusFeedbackModal
                    onClose={closeFeedbackModal}
                    actionType={actionType}
                    selectedTransportsCount={selectedTransportsCount}
                    totalUpdatedCount={response?.updatedCount}
                    totalNotUpdatedCount={response?.notUpdatedCount}
                    notUpdatedTransports={response?.notUpdatedTransports}
                />
            )}
        </Flex>
    );
}

type BulkShipperInvoicingStatusFeedbackModalProps = {
    actionType: BulkShipperInvoicingStatusActionType;
    selectedTransportsCount: number;
    onClose: () => void;
    totalUpdatedCount?: number;
    totalNotUpdatedCount?: number;
    notUpdatedTransports?: {uid: string; id: number}[];
};

function BulkShipperInvoicingStatusFeedbackModal({
    actionType,
    selectedTransportsCount,
    totalNotUpdatedCount,
    totalUpdatedCount,
    notUpdatedTransports,
    onClose,
}: BulkShipperInvoicingStatusFeedbackModalProps) {
    const title = actionType === "CHECK" ? t("order.markChecked") : t("order.markUnchecked");
    const successTitle =
        actionType === "CHECK"
            ? t("chartered.bulkCheckedByShipperSuccess", {smart_count: totalUpdatedCount})
            : t("chartered.bulkUncheckedByShipperSuccess", {smart_count: totalUpdatedCount});

    const failedTitle =
        actionType === "CHECK"
            ? t("chartered.bulkCheckedByShipperFailed", {smart_count: totalNotUpdatedCount})
            : t("chartered.bulkUncheckedByShipperFailed", {smart_count: totalNotUpdatedCount});

    const notUpdatedTransportsLinks =
        notUpdatedTransports?.map((transport, index) => {
            return (
                <>
                    {index > 0 && ", "}
                    <Link target="_blank" href={`/app/orders/${transport.uid}`} key={index}>
                        {transport.id}
                    </Link>
                </>
            );
        }) || [];

    return (
        <Modal
            title={title}
            mainButton={{
                type: "button",
                severity: "warning",
                children: t("common.confirmUnderstanding"),
                "data-testid": "confirm-feedback-bulk-shipper-invoicing-status",
                onClick: onClose,
            }}
            secondaryButton={{
                onClick: onClose,
                variant: "secondary",
            }}
            data-testid="feedback-bulk-shipper-invoicing-status-modal"
            onClose={onClose}
            minWidth="300px"
        >
            <Flex flexDirection="column" css={{rowGap: "16px"}}>
                <Box bg="yellow.ultralight" p={3} width="100%">
                    <Text color="yellow.dark" variant="h2" data-testid="feedback-message">
                        {t("selected.orders", {smart_count: selectedTransportsCount})}
                    </Text>
                </Box>
                <Flex css={{rowGap: "12px"}} flexDirection="column">
                    <Flex css={{columnGap: 8}} alignItems="center">
                        <Icon color="green.default" name="checkCircle" />
                        <Text data-testid="success-message-feedback">{successTitle}</Text>
                    </Flex>
                    <Flex css={{columnGap: 8}} alignItems="center">
                        <Icon color="yellow.default" name="alert" />
                        <Text data-testid="failed-message-feedback">{failedTitle}</Text>
                    </Flex>
                    {notUpdatedTransportsLinks.length > 0 && (
                        <Flex css={{columnGap: 4}} flexWrap="wrap" pl="24px" mt="-8px">
                            {notUpdatedTransportsLinks}
                        </Flex>
                    )}
                </Flex>
                <Callout> {t("callout.makeSureCharterer")}</Callout>
            </Flex>
        </Modal>
    );
}
