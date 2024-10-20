import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, LoadingWheel, Modal, Text, TextInput} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {fetchSetTransportsStatusInvoiced} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type MassMarkInvoicedStatus = "pending" | "loading" | "done";
type MarkMultipleTransportsAsInvoicedResponse = {
    response: {success: boolean; invoiced: number};
};
type MarkMultipleTransportsAsInvoicedModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
    refetchTransports: () => void;
};

export const MarkMultipleTransportsAsInvoicedModal: FunctionComponent<
    MarkMultipleTransportsAsInvoicedModalProps
> = ({selectedTransportsQuery, selectedTransportsCount, onClose, refetchTransports}) => {
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [massMarkInvoicedStatus, setMassMarkInvoicedStatus] =
        useState<MassMarkInvoicedStatus>("pending");
    const [transportsToMarkAsInvoicedCount] = useState(selectedTransportsCount);
    const [transportsMarkedInvoicedCount, setTransportsMarkedInvoicedCount] = useState(0);
    const [transportUnchangedCount, setTransportsUnchangedCount] = useState(0);

    const dispatch = useDispatch();

    const handleMarkInvoicedSubmit = async () => {
        setMassMarkInvoicedStatus("loading");
        try {
            const markInvoicedTransportsResponse: MarkMultipleTransportsAsInvoicedResponse =
                await dispatch(
                    fetchSetTransportsStatusInvoiced(selectedTransportsQuery, invoiceNumber)
                );
            const markedInvoicedCount = markInvoicedTransportsResponse.response.invoiced;
            setTransportsMarkedInvoicedCount(markedInvoicedCount);
            setTransportsUnchangedCount(transportsToMarkAsInvoicedCount - markedInvoicedCount);
            setMassMarkInvoicedStatus("done");
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
            title={t("markInvoicedModal.title")}
            id="mark-multiple-transports-as-invoiced-modal"
            onClose={onClose}
            mainButton={
                massMarkInvoicedStatus === "done"
                    ? {
                          onClick: onConfirmUnderstanding,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "confirm-understanding-button",
                      }
                    : {
                          onClick: handleMarkInvoicedSubmit,
                          disabled: massMarkInvoicedStatus !== "pending",
                          "data-testid": "save-button",
                      }
            }
            // @ts-ignore
            secondaryButton={massMarkInvoicedStatus === "done" && null}
        >
            {massMarkInvoicedStatus === "pending" && (
                <>
                    <Text>{t("markInvoicedModal.invoiceNumberHelpText")}</Text>
                    <Box my={2}>
                        <TextInput
                            data-testid="invoice-number-input"
                            label={t("markInvoicedModal.invoiceNumber")}
                            name="invoiceNumber"
                            value={invoiceNumber}
                            onChange={(value: string) => {
                                setInvoiceNumber(value);
                            }}
                        />
                    </Box>
                    <Text>{t("components.warningInvoicedTransports")}</Text>
                </>
            )}
            {massMarkInvoicedStatus === "loading" && <LoadingWheel noMargin />}
            {massMarkInvoicedStatus === "done" && (
                <>
                    <Text variant="title" textAlign="center" mb={2}>
                        {t("components.doneExclamation")}
                    </Text>
                    {transportsMarkedInvoicedCount > 0 && (
                        <Flex>
                            <Icon
                                mr={2}
                                name="checkCircle"
                                color="green.default"
                                alignSelf="center"
                            />
                            <Text>
                                {t("components.countMarkInvoicedTransports", {
                                    smart_count: transportsMarkedInvoicedCount,
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
                            <Text data-testid={"unchanged-transports-count"}>
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
