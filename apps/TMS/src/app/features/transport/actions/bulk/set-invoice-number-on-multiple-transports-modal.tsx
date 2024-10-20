import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, LoadingWheel, Modal, Text, TextInput} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {fetchSetInvoiceNumberInBulk} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type SetInvoiceNumberOnMultipleTransportModalPropsPropType = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
    refetchTransports: () => void;
};

/** This modal is used to set the invoice number of transports (as a shipper) and mark them invoiced at the same time.
 *
 */
export const SetInvoiceNumberOnMultipleTransportModal: FunctionComponent<
    SetInvoiceNumberOnMultipleTransportModalPropsPropType
> = ({selectedTransportsQuery, selectedTransportsCount, onClose, refetchTransports}) => {
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [massMarkInvoicedStatus, setMassMarkInvoicedStatus] = useState<
        "pending" | "loading" | "done"
    >("pending");
    const [transportsToMarkAsInvoicedCount] = useState(selectedTransportsCount);
    const [transportsMarkedInvoicedCount, setTransportsMarkedInvoicedCount] = useState(0);
    const [transportUnchangedCount, setTransportsUnchangedCount] = useState(0);
    const error = invoiceNumber === "";
    const dispatch = useDispatch();

    const handleMarkInvoicedSubmit = async () => {
        setMassMarkInvoicedStatus("loading");
        try {
            const markInvoicedTransportsResponse: {
                response: {success: boolean; invoiced: number};
            } = await dispatch(
                fetchSetInvoiceNumberInBulk(selectedTransportsQuery, invoiceNumber)
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
            title={t("AddInvoiceNumberModal.title")}
            id="mark-multiple-transports-as-invoiced-modal"
            onClose={onClose}
            bannerContent={
                massMarkInvoicedStatus !== "done" ? (
                    <Text variant="h2" color={`blue.dark`}>
                        {t("components.countSselectedOrder", {
                            smart_count: transportsToMarkAsInvoicedCount,
                        })}
                    </Text>
                ) : undefined
            }
            mainButton={
                massMarkInvoicedStatus === "done"
                    ? {
                          onClick: onConfirmUnderstanding,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "confirm-understanding-button",
                      }
                    : {
                          onClick: handleMarkInvoicedSubmit,
                          disabled: massMarkInvoicedStatus !== "pending" || error,
                          "data-testid": "save-button",
                      }
            }
            secondaryButton={massMarkInvoicedStatus === "pending" ? {onClick: onClose} : null}
        >
            {massMarkInvoicedStatus === "pending" && (
                <>
                    <Text>{t("addInvoiceNumberModal.carrierWillBeInformedWarning")}</Text>

                    <Box my={2}>
                        <TextInput
                            data-testid="invoice-number-input"
                            label={t("markInvoicedModal.invoiceNumber")}
                            name="invoiceNumber"
                            value={invoiceNumber}
                            required={true}
                            onChange={(value: string) => {
                                setInvoiceNumber(value);
                            }}
                        />
                    </Box>
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
                            <Text data-testid={"successfull-transports-count"}>
                                {t("components.countChangedTransports", {
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
