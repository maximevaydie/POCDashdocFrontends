import {t} from "@dashdoc/web-core";
import {Box, Flex, LoadingWheel, Modal, ProgressBar, Text} from "@dashdoc/web-ui";
import {usePrevious} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";

import {fetchConfirmTransports} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {getLastBulkConfirmTransportsEvent, getLastTransportEvent} from "app/redux/selectors";

type BulkConfirmTransportsStatus = "pending" | "loading" | "done";

type ConfirmTransportModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    refetchTransports?: () => void;
    onClose: () => void;
};

const ConfirmTransportsModal: FunctionComponent<ConfirmTransportModalProps> = ({
    selectedTransportsQuery,
    selectedTransportsCount,
    refetchTransports,
    onClose,
}) => {
    const dispatch = useDispatch();

    const lastTransportEvent = useSelector(getLastTransportEvent);
    const lastBulkConfirmEvent = useSelector(getLastBulkConfirmTransportsEvent);

    const previousBulkConfirmEventTimestamp = usePrevious(lastBulkConfirmEvent?.timestamp);
    const previousTransportEventTimestamp = usePrevious(lastTransportEvent?.timestamp);

    const [bulkConfirmStatus, setBulkConfirmStatus] =
        useState<BulkConfirmTransportsStatus>("pending");

    const [progress, setProgress] = useState(0);
    const [confirmedOrders, setConfirmedOrders] = useState(0);

    const handleSubmitConfirm = useCallback(async () => {
        setBulkConfirmStatus("loading");
        await dispatch(fetchConfirmTransports(selectedTransportsQuery));
    }, [setBulkConfirmStatus, selectedTransportsQuery, onClose, dispatch]);

    useEffect(() => {
        if (bulkConfirmStatus === "loading") {
            if (lastTransportEvent?.timestamp !== previousTransportEventTimestamp) {
                if (lastTransportEvent?.data.type === "confirmed") {
                    setConfirmedOrders(confirmedOrders + 1);
                    setProgress(Math.floor((confirmedOrders / selectedTransportsCount) * 100));
                }
            }

            if (lastBulkConfirmEvent?.timestamp !== previousBulkConfirmEventTimestamp) {
                const data = lastBulkConfirmEvent?.data;
                if (data?.success) {
                    const confirmedCount = data?.confirmed?.count || confirmedOrders;
                    setConfirmedOrders(confirmedCount);

                    setBulkConfirmStatus("done");
                    // @ts-ignore
                    refetchTransports();
                }
            }
        }
    }, [lastTransportEvent, lastBulkConfirmEvent]);

    return (
        <Modal
            title={t("components.acceptOrders")}
            id="confirm-shipment-modal"
            onClose={onClose}
            mainButton={
                bulkConfirmStatus !== "done"
                    ? {
                          onClick: handleSubmitConfirm,
                          children: (
                              <>
                                  {t("common.accept")}
                                  {bulkConfirmStatus === "loading" && (
                                      <Box ml={2}>
                                          <LoadingWheel small inline />
                                          &nbsp;
                                      </Box>
                                  )}
                              </>
                          ),
                          disabled: bulkConfirmStatus !== "pending",
                      }
                    : {
                          onClick: onClose,
                          children:
                              bulkConfirmStatus === "done"
                                  ? t("common.confirmUnderstanding")
                                  : selectedTransportsCount > 1
                                    ? t("components.acceptOrders")
                                    : t("components.acceptOrder"),
                      }
            }
            secondaryButton={
                bulkConfirmStatus === "done"
                    ? null
                    : {
                          disabled: bulkConfirmStatus === "loading",
                      }
            }
        >
            {bulkConfirmStatus === "pending" && (
                <Text variant="h1" textAlign="center">
                    {t("component.acceptOrdersCount", {smart_count: selectedTransportsCount})}
                </Text>
            )}
            {bulkConfirmStatus === "loading" && (
                <>
                    <ProgressBar progress={progress} />
                    <Flex justifyContent="space-evenly" mb={2}>
                        <Text>
                            {t("components.acceptedOrdersCount", {
                                smart_count: confirmedOrders,
                            })}
                        </Text>
                    </Flex>
                </>
            )}
            {bulkConfirmStatus === "done" && (
                <Text>
                    {t("components.acceptedOrdersCount", {
                        smart_count: confirmedOrders,
                    })}
                </Text>
            )}
        </Modal>
    );
};

export default ConfirmTransportsModal;
