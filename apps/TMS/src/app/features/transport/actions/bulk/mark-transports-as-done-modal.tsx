import {t} from "@dashdoc/web-core";
import {Flex, Icon, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {fetchSetTransportsStatusDone} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type MassMarDoneStatus = "pending" | "loading" | "done";
type MarkMultipleTransportsAsDoneResponse = {
    response: {success: boolean; marked_done: number};
};
type MarkTransportsAsDoneModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
    refetchTransports: () => void;
};

const MarkTransportsAsDoneModal: FunctionComponent<MarkTransportsAsDoneModalProps> = ({
    selectedTransportsCount,
    selectedTransportsQuery,
    onClose,
    refetchTransports,
}) => {
    const [massMarkDoneStatus, setMassMarkDoneStatus] = useState<MassMarDoneStatus>("pending");
    const [transportsToMarkAsDoneCount] = useState(selectedTransportsCount);
    const [transportsMarkedAsDoneCount, setTransportsMarkedAsDoneCount] = useState(0);
    const [transportsUnchangedCount, setTransportsUnchangedCount] = useState(0);

    const dispatch = useDispatch();

    const handleMarkDoneSubmit = async () => {
        setMassMarkDoneStatus("loading");
        try {
            const markDoneTransportsResponse: MarkMultipleTransportsAsDoneResponse =
                await dispatch(fetchSetTransportsStatusDone(selectedTransportsQuery));
            const markedDoneCount = markDoneTransportsResponse.response.marked_done;
            setTransportsMarkedAsDoneCount(markedDoneCount);
            setTransportsUnchangedCount(transportsToMarkAsDoneCount - markedDoneCount);
            setMassMarkDoneStatus("done");
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
            title={t("components.markDoneTitle")}
            id="mark-transports-as-done-modal"
            onClose={onClose}
            mainButton={
                massMarkDoneStatus === "done"
                    ? {
                          onClick: onConfirmUnderstanding,
                          children: t("common.confirmUnderstanding"),
                      }
                    : {
                          onClick: handleMarkDoneSubmit,
                          disabled: massMarkDoneStatus !== "pending",
                      }
            }
            // @ts-ignore
            secondaryButton={massMarkDoneStatus === "done" && null}
        >
            {massMarkDoneStatus === "pending" && (
                <>
                    <Text>{t("components.warningDoneTransportsAsCreatorOrCarrier")}</Text>
                    <Text mt={1} variant="h1" textAlign="center">
                        {t("components.countSelectedTransports", {
                            smart_count: transportsToMarkAsDoneCount,
                        })}
                    </Text>
                </>
            )}
            {massMarkDoneStatus === "loading" && <LoadingWheel noMargin />}
            {massMarkDoneStatus === "done" && (
                <>
                    <Text variant="title" textAlign="center" mb={2}>
                        {t("components.done")} !
                    </Text>
                    {transportsMarkedAsDoneCount > 0 && (
                        <Flex>
                            <Icon
                                mr={2}
                                name="checkCircle"
                                color="green.default"
                                alignSelf="center"
                            />
                            <Text>
                                {t("components.countMarkDoneTransports", {
                                    smart_count: transportsMarkedAsDoneCount,
                                })}
                            </Text>
                        </Flex>
                    )}
                    {transportsUnchangedCount > 0 && (
                        <Flex>
                            <Icon
                                mr={2}
                                name="removeCircle"
                                color="red.default"
                                alignSelf="center"
                            />
                            <Text>
                                {t("components.countUnchangedTransports", {
                                    smart_count: transportsUnchangedCount,
                                })}
                            </Text>
                        </Flex>
                    )}
                </>
            )}
        </Modal>
    );
};

export default MarkTransportsAsDoneModal;
