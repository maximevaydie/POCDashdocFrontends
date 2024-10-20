import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, LoadingWheel, Modal, ProgressBar, Text} from "@dashdoc/web-ui";
import {usePrevious} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";

import {fetchDeleteTransports} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {getLastBulkDeleteTransportsEvent, getLastTransportEvent} from "app/redux/selectors";

type BulkDeleteTransportsStatus = "pending" | "loading" | "done";

interface Props {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    refetchTransports: () => void;
    unselectAllRows: () => any;
    onClose: () => void;
}

export const DeleteTransportsModal: FunctionComponent<Props> = ({
    selectedTransportsQuery,
    selectedTransportsCount,
    refetchTransports,
    unselectAllRows,
    onClose,
}) => {
    const dispatch = useDispatch();

    const lastTransportEvent = useSelector(getLastTransportEvent);
    const lastBulkDeleteEvent = useSelector(getLastBulkDeleteTransportsEvent);

    const previousBulkDeleteEventTimestamp = usePrevious(lastBulkDeleteEvent?.timestamp);
    const previousTransportEventTimestamp = usePrevious(lastTransportEvent?.timestamp);

    const [deletedTransports, setDeletedTransports] = useState(0);
    const [cancelledTransports, setCancelledTransports] = useState(0);
    const [unchangedTransports, setUnchangedTransports] = useState(0);
    const [bulkDeleteStatus, setBulkDeleteStatus] =
        useState<BulkDeleteTransportsStatus>("pending");
    const [progress, setProgress] = useState(0);

    const handleSubmit = useCallback(async () => {
        setBulkDeleteStatus("loading");
        await dispatch(fetchDeleteTransports(selectedTransportsQuery));
    }, [selectedTransportsQuery]);

    useEffect(() => {
        if (bulkDeleteStatus === "loading") {
            if (lastTransportEvent?.timestamp !== previousTransportEventTimestamp) {
                const data = lastTransportEvent?.data;
                if (data?.type === "deleted") {
                    setDeletedTransports(deletedTransports + 1);
                } else if (data?.type === "cancelled") {
                    setCancelledTransports(cancelledTransports + 1);
                }
                setProgress(
                    Math.floor(
                        ((deletedTransports + cancelledTransports) / selectedTransportsCount) * 100
                    )
                );
            }

            if (lastBulkDeleteEvent?.timestamp !== previousBulkDeleteEventTimestamp) {
                const data = lastBulkDeleteEvent?.data;
                if (data?.success) {
                    const deletedCount = data?.deleted?.count || deletedTransports;
                    const cancelledCount = data?.cancelled?.count || cancelledTransports;
                    setDeletedTransports(deletedCount);
                    setCancelledTransports(cancelledCount);
                    setUnchangedTransports(
                        selectedTransportsCount - deletedCount - cancelledCount
                    );
                    setBulkDeleteStatus("done");
                }
            }
        }
    }, [lastTransportEvent, lastBulkDeleteEvent]);

    const handleClose = () => {
        if (bulkDeleteStatus === "loading") {
            unselectAllRows();
        }
        refetchTransports();
        onClose();
    };

    return (
        <Modal
            title={<Text variant="title">{t("components.deleteTransports")}</Text>}
            id="delete-transports-modal"
            data-testid="delete-transports-modal"
            onClose={handleClose}
            mainButton={
                bulkDeleteStatus !== "done"
                    ? {
                          severity: "danger",
                          onClick: handleSubmit,
                          children: (
                              <>
                                  {t("components.deleteTransports")}
                                  {bulkDeleteStatus === "loading" && (
                                      <Box ml={2}>
                                          <LoadingWheel small inline />
                                          &nbsp;
                                      </Box>
                                  )}
                              </>
                          ),
                          disabled: bulkDeleteStatus !== "pending",
                      }
                    : {
                          onClick: handleClose,
                          children: t("common.confirmUnderstanding"),
                      }
            }
            // @ts-ignore
            secondaryButton={
                bulkDeleteStatus === "pending" && {type: "button", onClick: handleClose}
            }
            calloutProps={
                bulkDeleteStatus === "pending"
                    ? {
                          variant: "danger",
                          children: (
                              <Text>
                                  {t("components.countSelectedTransports", {
                                      smart_count: selectedTransportsCount,
                                  })}
                              </Text>
                          ),
                          iconDisabled: true,
                      }
                    : undefined
            }
        >
            <Box>
                {bulkDeleteStatus === "pending" && (
                    <>
                        <Text>
                            {t("components.confirmDeletingSelectedTransports", {
                                smart_count: selectedTransportsCount,
                            })}
                        </Text>
                        <Callout p={4} mt={3} iconDisabled>
                            <Text>{t("components.transportsBulk.deleteOrCancel")}</Text>
                        </Callout>
                        <Callout p={4} mt={3} iconDisabled variant="danger">
                            <Text>{t("components.transportDetails.confirmDeleteTransport")}</Text>
                        </Callout>
                    </>
                )}
                {bulkDeleteStatus === "loading" && (
                    <>
                        <ProgressBar progress={progress} />
                        <Flex justifyContent="space-evenly" mb={2}>
                            <Text>
                                {t("components.countDeletedTransports", {
                                    smart_count: deletedTransports,
                                })}
                            </Text>
                            <Text>
                                {t("components.countCancelledTransports", {
                                    smart_count: cancelledTransports,
                                })}
                            </Text>
                        </Flex>
                    </>
                )}
                {bulkDeleteStatus === "done" && (
                    <>
                        <Text variant="title" textAlign="center" mb={2}>
                            {t("components.done")} !
                        </Text>
                        {deletedTransports > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.default"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("components.countDeletedTransports", {
                                        smart_count: deletedTransports,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {cancelledTransports > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="warning"
                                    color="yellow.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("components.countCancelledTransports", {
                                        smart_count: cancelledTransports,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {unchangedTransports > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.default"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t("components.countUnchangedTransports", {
                                        smart_count: unchangedTransports,
                                    })}
                                </Text>
                            </Flex>
                        )}
                    </>
                )}
            </Box>
        </Modal>
    );
};
