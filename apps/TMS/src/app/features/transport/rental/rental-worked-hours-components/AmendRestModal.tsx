import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {DatePicker, Flex, Modal, Text} from "@dashdoc/web-ui";
import {Rest, useToggle, zoneDateToISO} from "dashdoc-utils";
import {addHours} from "date-fns";
import React, {useState} from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {fetchAmendAddRest, fetchAmendUpdateRest} from "app/redux/actions";
import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";

export const RentalAmendRestModal = ({
    rest,
    deliveryUid,
    transportUid,
    onClose,
    transportStartDate,
}: {
    rest?: Rest;
    deliveryUid: string;
    transportUid: string;
    onClose: () => void;
    transportStartDate?: Date | null;
}) => {
    const timezone = useTimezone();
    const [isSubmitted, setSubmitted] = useState(false);
    const [loading, startLoading, endLoading] = useToggle();
    const defaultStartDate = transportStartDate ? new Date(transportStartDate) : new Date();
    const [startDate, setStartDate] = useState<Date | null>(() => {
        if (rest?.start) {
            return new Date(rest?.start);
        }
        return transportStartDate ? new Date(transportStartDate) : new Date();
    });

    const [endDate, setEndDate] = useState<Date | null>(() => {
        if (rest?.end) {
            return new Date(rest?.end);
        }
        return addHours(defaultStartDate, 1);
    });
    const dispatch = useDispatch();
    const hasMissingDate = !endDate || !startDate;
    const hasInconsistentDate = !hasMissingDate && endDate < startDate;

    return (
        <Modal
            title={rest ? t("rental.editRest.modalTitle") : t("rental.addRest.modalTitle")}
            onClose={onClose}
            id="edit-rental-rest-modal"
            data-testid="edit-rental-rest-modal"
            mainButton={{
                ["data-testid"]: "rest-modal-submit",
                type: "button",
                disabled: loading,
                loading: loading,
                children: t("common.save"),
                onClick: handleSubmit,
            }}
            secondaryButton={{}}
        >
            <AmendTransportWarningBanner isRental />
            <Flex alignItems="center">
                <Text variant="captionBold" mr={2} mb={2} width="40%">
                    {t("rental.startRest")}
                </Text>
                <DatePicker
                    date={startDate}
                    onChange={setStartDate}
                    showTime={true}
                    disabled={loading}
                    textInputWidth="150px"
                    rootId="react-app-modal-root"
                    error={isSubmitted && (!startDate || hasInconsistentDate)}
                    data-testid="rest-start-datetimepicker"
                />
            </Flex>
            {!startDate && isSubmitted && (
                <Text color="red.default">{t("common.mandatoryField")}</Text>
            )}
            <Flex alignItems="center">
                <Text variant="captionBold" mr={2} mb={2} width="40%">
                    {t("rental.endRest")}
                </Text>
                <DatePicker
                    date={endDate}
                    onChange={setEndDate}
                    showTime={true}
                    disabled={loading}
                    textInputWidth="150px"
                    rootId="react-app-modal-root"
                    error={isSubmitted && (!endDate || hasInconsistentDate)}
                    data-testid="rest-end-datetimepicker"
                />
            </Flex>
            {!endDate && isSubmitted && (
                <Text color="red.default">{t("common.mandatoryField")}</Text>
            )}
            {hasInconsistentDate && isSubmitted && (
                <Text color="red.default">{t("rental.inconsistentRestDates")}</Text>
            )}
        </Modal>
    );

    async function handleSubmit() {
        setSubmitted(true);

        if (hasMissingDate || hasInconsistentDate) {
            return;
        }
        startLoading();
        const data = {
            start: zoneDateToISO(startDate, timezone) as string,
            end: zoneDateToISO(endDate, timezone) as string,
        };
        if (rest) {
            await dispatch(fetchAmendUpdateRest(deliveryUid, {...rest, ...data}));
        } else {
            await dispatch(fetchAmendAddRest(deliveryUid, data));
        }
        dispatch(fetchRetrieveTransport(transportUid));
        endLoading();
        onClose();
    }
};
