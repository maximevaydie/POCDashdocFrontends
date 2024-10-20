import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, ProgressBar, Text, TextInput} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {usePrevious, yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";

import {fetchDeclineTransport, fetchDeclineTransports} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getLastBulkDeclineTransportsEvent,
    getLastTransportEvent,
    getTransportsCurrentQuery,
} from "app/redux/selectors";

type BulkDeclineTransportsStatus = "pending" | "loading" | "done";

type DeclineTransportModalProps = {
    selectedTransports: string[];
    allTransportsSelected?: boolean;
    allTransportsCount?: number;
    bulk: boolean;
    refetchTransports?: () => void;
    onClose: () => void;
};

type DeclineTransportsModalForm = {
    declineReason: string;
};

const DeclineTransportsModal: FunctionComponent<DeclineTransportModalProps> = ({
    selectedTransports,
    allTransportsSelected,
    allTransportsCount,
    refetchTransports,
    bulk,
    onClose,
}) => {
    const dispatch = useDispatch();
    const query = useSelector(getTransportsCurrentQuery);

    const lastTransportEvent = useSelector(getLastTransportEvent);
    const lastBulkDeclineEvent = useSelector(getLastBulkDeclineTransportsEvent);

    const previousBulkDeclineEventTimestamp = usePrevious(lastBulkDeclineEvent?.timestamp);
    const previousTransportEventTimestamp = usePrevious(lastTransportEvent?.timestamp);

    const selectedTransportsCount = allTransportsSelected
        ? allTransportsCount
        : selectedTransports?.length;

    const [bulkDeclineStatus, setBulkDeclineStatus] =
        useState<BulkDeclineTransportsStatus>("pending");

    const [progress, setProgress] = useState(0);
    const [declinedOrders, setDeclinedOrders] = useState(0);

    const handleSubmitDecline = useCallback(
        async ({declineReason}: DeclineTransportsModalForm) => {
            if (bulk === true) {
                const filters = allTransportsSelected
                    ? query
                    : {...query, uid__in: selectedTransports};
                setBulkDeclineStatus("loading");
                await dispatch(fetchDeclineTransports(filters, declineReason));
            } else {
                await dispatch(fetchDeclineTransport(selectedTransports[0], declineReason));
                refetchTransports?.();
                onClose();
            }
        },
        [
            refetchTransports,
            setBulkDeclineStatus,
            selectedTransports,
            onClose,
            query,
            allTransportsSelected,
            bulk,
            dispatch,
        ]
    );

    useEffect(() => {
        if (bulkDeclineStatus === "loading") {
            if (lastTransportEvent?.timestamp !== previousTransportEventTimestamp) {
                if (lastTransportEvent?.data.type === "declined") {
                    setDeclinedOrders(declinedOrders + 1);
                    // @ts-ignore
                    setProgress(Math.floor((declinedOrders / selectedTransportsCount) * 100));
                }
            }

            if (lastBulkDeclineEvent?.timestamp !== previousBulkDeclineEventTimestamp) {
                const data = lastBulkDeclineEvent?.data;
                if (data?.success) {
                    const declinedCount = data?.declined?.count || declinedOrders;
                    setDeclinedOrders(declinedCount);

                    setBulkDeclineStatus("done");
                    refetchTransports?.();
                }
            }
        }
    }, [lastTransportEvent, lastBulkDeclineEvent]);

    const formik = useFormik({
        initialValues: {
            declineReason: "",
        },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object().shape({
            declineReason: yup.string().trim().required(t("common.mandatoryField")),
        }),
        onSubmit: handleSubmitDecline,
    });

    return (
        <Modal
            title={t("components.declineOrders")}
            id="decline-shipment-modal"
            onClose={onClose}
            mainButton={
                bulkDeclineStatus !== "done"
                    ? {
                          severity: "danger",
                          onClick: formik.submitForm,
                          form: "decline-order-form",
                          type: "submit",
                          children: (
                              <>
                                  {t("common.decline")}
                                  {bulkDeclineStatus === "loading" && (
                                      <Box ml={2}>
                                          <LoadingWheel small inline />
                                          &nbsp;
                                      </Box>
                                  )}
                              </>
                          ),
                          disabled: bulkDeclineStatus !== "pending",
                      }
                    : {
                          onClick: onClose,
                          children:
                              bulkDeclineStatus === "done"
                                  ? t("common.confirmUnderstanding")
                                  : // @ts-ignore
                                    selectedTransportsCount > 1
                                    ? t("components.declineOrders")
                                    : t("components.declineOrder"),
                      }
            }
            secondaryButton={
                bulkDeclineStatus === "done"
                    ? null
                    : {
                          disabled: bulkDeclineStatus === "loading",
                      }
            }
        >
            {bulkDeclineStatus === "pending" && (
                <FormikProvider value={formik}>
                    <TextInput
                        {...formik.getFieldProps("declineReason")}
                        label={t("components.declineOrderReason")}
                        id="decline-declineReason-input"
                        placeholder={t("common.typeHere")}
                        onChange={(declineReason: string) => {
                            formik.setFieldValue("declineReason", declineReason);
                        }}
                        error={formik.errors.declineReason}
                    />
                </FormikProvider>
            )}
            {bulkDeclineStatus === "loading" && (
                <>
                    <ProgressBar progress={progress} />
                    <Flex justifyContent="space-evenly" mb={2}>
                        <Text>
                            {t("components.declinedOrdersCount", {
                                smart_count: declinedOrders,
                            })}
                        </Text>
                    </Flex>
                </>
            )}
            {bulkDeclineStatus === "done" && (
                <Text>
                    {t("components.declinedOrdersCount", {
                        smart_count: declinedOrders,
                    })}
                </Text>
            )}
        </Modal>
    );
};

export default DeclineTransportsModal;
