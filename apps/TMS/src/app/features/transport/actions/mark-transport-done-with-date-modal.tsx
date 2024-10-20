import {useTimezone} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Callout, DatePicker, Flex, Icon, Modal, Radio, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, yup, zoneDateToISO} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {useState} from "react";

import {getLastLoadingRealDate} from "app/features/transport/actions/transportDate.service";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {fetchSetTransportsStatusDone} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {checkSegmentsSanity, isTransportRental} from "app/services/transport";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    onClose: () => void;
};

type MarkDoneDateForm = {
    detectedDate: Date;
    date: Date;
};

export function MarkDoneTransportWithDateModal({transport, onClose}: Props) {
    const timezone = useTimezone();

    const transportListRefresher = useRefreshTransportLists();
    const dispatch = useDispatch();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const lastSegment = transport.segments[transport.segments.length - 1];
    const lastActivity = lastSegment.destination;

    const scheduledDate = lastSegment?.scheduled_end_range?.start;
    const askedDate: string | undefined = lastActivity.slots?.[0]?.start;

    const isDetectedDate = Boolean(scheduledDate || askedDate);
    const [selectDetectedDate, setSelectDetectedDate] = useState<boolean>(isDetectedDate);

    const lastLoadingRealDate: Date | null = getLastLoadingRealDate(transport, timezone);

    const validateGivenDate = (date: Date): boolean => {
        return lastLoadingRealDate === null || date >= lastLoadingRealDate;
    };

    const handleSubmit = async ({detectedDate, date}: MarkDoneDateForm) => {
        const lastActivityDate = selectDetectedDate ? detectedDate : date;

        try {
            setIsSubmitting(true);
            await dispatch(
                fetchSetTransportsStatusDone(
                    {uid__in: transport.uid},
                    {
                        last_activity_date_by_transport_uid: {
                            [transport.uid]: zoneDateToISO(lastActivityDate, timezone) as string,
                        },
                    }
                )
            );
            onClose();
            transportListRefresher();
        } catch {
            Logger.log("Failed to mark done transport");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formik = useFormik<MarkDoneDateForm>({
        initialValues: {
            // Technically detectedDate could be null
            // but it will be a date each time it's used (because of the isDetectedDate guard)
            // so we cast it as a Date out of convenience
            detectedDate: parseAndZoneDate(scheduledDate || askedDate, timezone) as Date,
            date: parseAndZoneDate(new Date(), timezone),
        },
        validateOnBlur: true,
        validateOnChange: true,
        validationSchema: yup.object().shape({
            date: yup
                .date()
                .test(
                    "validate-given-date",
                    t("transport.DoneTransportDateMustBeAfterLastLoadingRealDate"),
                    validateGivenDate
                ),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("components.markTransportDone")}
            onClose={onClose}
            id="mark-transport-done-with-date-modal"
            data-testid="mark-transport-done-with-date-modal"
            mainButton={{
                type: "submit",
                form: "form-mark-done-transport-with-date",
                disabled: isSubmitting || !formik.isValid,
                children: t("common.markDone"),
                "data-testid": "button-mark-done",
            }}
            secondaryButton={{
                disabled: isSubmitting,
                onClick: onClose,
            }}
        >
            <FormikProvider value={formik}>
                <Form id="form-mark-done-transport-with-date">
                    <Flex flexDirection="column" style={{rowGap: "12px"}}>
                        <Text>
                            {isTransportRental(transport)
                                ? t("markTransportDoneModal.rentalActivityWillBeClosed")
                                : t("markTransportDoneModal.allActivityWillBeClosedWithDate")}
                        </Text>
                        {isDetectedDate ? (
                            <Flex flexDirection="column" style={{rowGap: "12px"}}>
                                <Callout variant="secondary">
                                    <Text data-testid="callout-detected-date">
                                        {t(
                                            scheduledDate
                                                ? "markTransportDoneModal.plannedDateDetected"
                                                : "markTransportDoneModal.askedDateDetected"
                                        )}
                                    </Text>
                                </Callout>
                                <Radio
                                    name="date"
                                    label={t("markTransportDoneModal.detectedDate")}
                                    data-testid="detected-date-radio"
                                    checked={selectDetectedDate}
                                    onChange={() => {
                                        setSelectDetectedDate(true);
                                    }}
                                    labelProps={{marginBottom: 0}}
                                />
                                {selectDetectedDate && (
                                    <Flex style={{columnGap: "4px"}} ml="5px">
                                        <Flex
                                            borderLeft="2px solid"
                                            borderLeftColor="grey.light"
                                            pl="4"
                                        />
                                        <Flex backgroundColor="grey.light" p={3} flex="1">
                                            <Icon mr={1} name="calendar" color="grey.dark" />
                                            <Text variant="h2" data-testID="detected-date">
                                                {t("common.datetime", {
                                                    date: formatDate(
                                                        formik.values.detectedDate,
                                                        "P"
                                                    ),
                                                    time: formatDate(
                                                        formik.values.detectedDate,
                                                        "p"
                                                    ),
                                                })}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                )}
                                <Radio
                                    name="date"
                                    label={t("markTransportDoneModal.otherDate")}
                                    data-testid="other-date-radio"
                                    checked={!selectDetectedDate}
                                    onChange={() => {
                                        setSelectDetectedDate(false);
                                    }}
                                    labelProps={{marginBottom: 0}}
                                />
                                {!selectDetectedDate && (
                                    <Flex ml="5px">
                                        <Flex
                                            borderLeft="2px solid"
                                            borderLeftColor="grey.light"
                                            pl="4"
                                        />
                                        <DatePicker
                                            date={formik.values.date}
                                            textInputWidth="150px"
                                            data-testid="mark-transport-done-end-date-picker"
                                            showTime={true}
                                            rootId="react-app-modal-root"
                                            error={
                                                formik.errors.date as string | boolean | undefined
                                            }
                                            onChange={(newDate) => {
                                                formik.setFieldValue("date", newDate);
                                            }}
                                        />
                                    </Flex>
                                )}
                            </Flex>
                        ) : (
                            <Flex flexDirection="column">
                                <Text>{t("markTransportDoneModal.dateEndTransport")}</Text>
                                <DatePicker
                                    date={formik.values.date}
                                    textInputWidth="150px"
                                    data-testid="mark-transport-done-end-date-picker"
                                    rootId="react-app-modal-root"
                                    showTime={true}
                                    error={formik.errors.date as string | boolean | undefined}
                                    onChange={(newDate) => {
                                        formik.setFieldValue("date", newDate);
                                    }}
                                />
                            </Flex>
                        )}
                    </Flex>
                </Form>
            </FormikProvider>
            {!checkSegmentsSanity(transport) && (
                <Callout
                    mt={4}
                    variant="warning"
                    data-testid="mark-transport-done-qualimat-warning"
                >
                    {t("markTransportDoneModal.qualimatHistoryWillBeIncompleteOnCarrierSide")}
                </Callout>
            )}
        </Modal>
    );
}
