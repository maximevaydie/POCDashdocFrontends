import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {fetchSetTransportsStatusVerified} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type MassMarkVerifiedStatus = "pending" | "loading" | "done";
type MarkMultipleTransportsAsVerifiedResponse = {
    response: {success: boolean; verified: number};
};
type MarkTransportsVerifiedProps = {
    onClose: () => void;
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    refetchTransports: () => void;
};

const MarkTransportsVerified: FunctionComponent<MarkTransportsVerifiedProps> = ({
    onClose,
    selectedTransportsQuery,
    selectedTransportsCount,
    refetchTransports,
}) => {
    const [massMarkVerifiedStatus, setMassMarkVerifiedStatus] =
        useState<MassMarkVerifiedStatus>("pending");
    const [transportsToMarkAsVerfiedCount] = useState(selectedTransportsCount);
    const [transportsMarkedVerifiedCount, setTransportsMarkedVerifiedCount] = useState(0);
    const [transportUnchangedCount, setTransportsUnchangedCount] = useState(0);
    const dispatch = useDispatch();

    const handleMarkVerifiedSubmit = async () => {
        setMassMarkVerifiedStatus("loading");
        try {
            const markVerifiedTransportsResponse: MarkMultipleTransportsAsVerifiedResponse =
                await dispatch(fetchSetTransportsStatusVerified(selectedTransportsQuery));
            const markedVerifiedCount = markVerifiedTransportsResponse.response.verified;
            setTransportsMarkedVerifiedCount(markedVerifiedCount);
            setTransportsUnchangedCount(transportsToMarkAsVerfiedCount - markedVerifiedCount);
            setMassMarkVerifiedStatus("done");
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
            title={t("components.markVerifiedTransports")}
            id="mark-transports-as-verified-modal"
            onClose={onClose}
            // @ts-ignore
            secondaryButton={massMarkVerifiedStatus === "done" && null}
            mainButton={
                massMarkVerifiedStatus === "done"
                    ? {
                          onClick: onConfirmUnderstanding,
                          children: t("common.confirmUnderstanding"),
                      }
                    : {
                          onClick: handleMarkVerifiedSubmit,
                          disabled: massMarkVerifiedStatus !== "pending",
                      }
            }
        >
            {massMarkVerifiedStatus === "pending" && (
                <Box>
                    <Text>{t("components.warningVerifiedTransports")}</Text>
                    <Text p={1} textAlign="center">
                        {t("components.countSelectedTransports", {
                            smart_count: transportsToMarkAsVerfiedCount,
                        })}
                    </Text>
                </Box>
            )}
            {massMarkVerifiedStatus === "loading" && <LoadingWheel noMargin />}
            {massMarkVerifiedStatus === "done" && (
                <>
                    <Text variant="title" textAlign="center" mb={2}>
                        {t("components.done")} !
                    </Text>
                    {transportsMarkedVerifiedCount > 0 && (
                        <Flex>
                            <Icon
                                mr={2}
                                name="checkCircle"
                                color="green.default"
                                alignSelf="center"
                            />
                            <Text>
                                {t("components.countMarkVerifiedTransports", {
                                    smart_count: transportsMarkedVerifiedCount,
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

export default MarkTransportsVerified;
