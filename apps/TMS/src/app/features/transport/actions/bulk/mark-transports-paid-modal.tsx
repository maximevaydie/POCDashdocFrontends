import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {fetchSetTransportsStatusPaid} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type MassMarkPaidStatus = "pending" | "loading" | "done";
type MarkMultipleTransportsAsPaidResponse = {
    response: {success: boolean; marked_paid: number};
};
type MarkTransportsPaidProps = {
    onClose: () => void;
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    refetchTransports: () => void;
};

const MarkTransportsPaidModal: FunctionComponent<MarkTransportsPaidProps> = ({
    onClose,
    selectedTransportsCount,
    selectedTransportsQuery,
    refetchTransports,
}) => {
    const [massMarkPaidStatus, setMassMarkPaidStatus] = useState<MassMarkPaidStatus>("pending");
    const [transportsToMarkAsVerfiedCount] = useState(selectedTransportsCount);
    const [transportsMarkedPaidCount, setTransportsMarkedPaidCount] = useState(0);
    const [transportUnchangedCount, setTransportsUnchangedCount] = useState(0);
    const dispatch = useDispatch();

    const handleMarkPaidSubmit = async () => {
        setMassMarkPaidStatus("loading");
        try {
            const markPaidTransportsResponse: MarkMultipleTransportsAsPaidResponse =
                await dispatch(fetchSetTransportsStatusPaid(selectedTransportsQuery));
            const markedPaidCount = markPaidTransportsResponse.response.marked_paid;
            setTransportsMarkedPaidCount(markedPaidCount);
            setTransportsUnchangedCount(transportsToMarkAsVerfiedCount - markedPaidCount);
            setMassMarkPaidStatus("done");
        } catch (error) {
            onClose();
        }
    };

    const onConfirmUnderstanding = () => {
        refetchTransports();
        onClose();
    };

    return (
        <Modal
            title={t("components.markPaidTransports")}
            id="mark-transports-as-Paid-modal"
            onClose={onClose}
            // @ts-ignore
            secondaryButton={massMarkPaidStatus === "done" && null}
            mainButton={
                massMarkPaidStatus === "done"
                    ? {
                          onClick: onConfirmUnderstanding,
                          children: t("common.confirmUnderstanding"),
                      }
                    : {
                          onClick: handleMarkPaidSubmit,
                          disabled: massMarkPaidStatus !== "pending",
                      }
            }
        >
            {massMarkPaidStatus === "pending" && (
                <Box>
                    <Text>{t("components.warningPaidTransports")}</Text>
                    <Text p={1} textAlign="center">
                        {t("components.countSelectedTransports", {
                            smart_count: transportsToMarkAsVerfiedCount,
                        })}
                    </Text>
                </Box>
            )}
            {massMarkPaidStatus === "loading" && <LoadingWheel noMargin />}
            {massMarkPaidStatus === "done" && (
                <>
                    <Text variant="title" textAlign="center" mb={2}>
                        {t("components.done")} !
                    </Text>
                    {transportsMarkedPaidCount > 0 && (
                        <Flex>
                            <Icon
                                mr={2}
                                name="checkCircle"
                                color="green.default"
                                alignSelf="center"
                            />
                            <Text>
                                {t("components.countMarkPaidTransports", {
                                    smart_count: transportsMarkedPaidCount,
                                })}
                            </Text>
                        </Flex>
                    )}
                    {transportUnchangedCount > 0 && (
                        <Flex>
                            <Icon
                                mr={2}
                                name="removeCircle"
                                color="red.default"
                                alignSelf="center"
                            />
                            <Text>
                                {t("components.countUnchangedTransports", {
                                    smart_count: transportUnchangedCount,
                                })}
                            </Text>
                        </Flex>
                    )}
                </>
            )}
        </Modal>
    );
};

export default MarkTransportsPaidModal;
