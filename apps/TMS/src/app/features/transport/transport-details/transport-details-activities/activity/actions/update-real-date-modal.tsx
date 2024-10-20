import {useTimezone} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {DatePicker, Flex, Modal, Text, toast} from "@dashdoc/web-ui";
import {parseAndZoneDate, zoneDateToISO} from "dashdoc-utils";
import React, {useState} from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {fetchAmendRealDate} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {Activity} from "app/types/transport";

function getInitialDate(dateAsString: string | null | undefined, timezone: string): Date | null {
    const parsedDate = parseAndZoneDate(dateAsString ?? null, timezone) ?? new Date();
    parsedDate.setSeconds(0); // BUG-3889
    parsedDate.setMilliseconds(0); // BUG-3889
    return parsedDate;
}

type UpdateRealDateModalProps = {
    activity: Activity;
    onClose: () => void;
    isRental: boolean;
};

type RealDate = "REAL_START" | "REAL_END";

export function UpdateRealDateModal({activity, onClose, isRental}: UpdateRealDateModalProps) {
    const timezone = useTimezone();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const site =
        activity.siteType === "origin" ? activity.segment?.origin : activity.segment?.destination;

    const [onSiteDate, setOnSiteDate] = useState<Date | null>(
        getInitialDate(site?.real_start, timezone)
    );
    const [onCompletedDate, setOnCompletedDate] = useState<Date | null>(
        getInitialDate(site?.real_end, timezone)
    );

    function onSelectDate(date: Date | null, dateType: RealDate) {
        if (dateType === "REAL_START") {
            setOnSiteDate(date);
        } else {
            setOnCompletedDate(date);
        }
    }

    async function onSave() {
        const isValid = onSiteDate && onCompletedDate && onSiteDate <= onCompletedDate;

        if (!isValid) {
            toast.error(t("common.error"));
            return;
        }

        try {
            setLoading(true);
            const fetchAmendRealDateRequest = dispatch(
                fetchAmendRealDate(activity.site.uid, {
                    real_start: zoneDateToISO(onSiteDate, timezone) as string,
                    real_end: zoneDateToISO(onCompletedDate, timezone) as string,
                })
            );
            await fetchAmendRealDateRequest;
            onClose();
        } catch (e) {
            Logger.error("Failed to amend real date", e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            title={t("components.updateRealDate")}
            onClose={onClose}
            id="update-real-date-modal"
            mainButton={{
                children: t("common.save"),
                onClick: onSave,
                disabled: loading,
                "data-testid": "real-hours-save-button",
            }}
        >
            <Flex alignItems="center" flexWrap="wrap" mb={4}>
                <AmendTransportWarningBanner isRental={isRental} />
                <Text mr={2} width={["100%", "45%", "45%"]}>
                    {t("markActivityDone.onSiteDate")}
                </Text>

                <DatePicker
                    showTime
                    date={onSiteDate}
                    onChange={(date) => onSelectDate(date, "REAL_START")}
                    textInputWidth="150px"
                    data-testid="real-start-date-picker"
                    rootId="react-app-modal-root"
                />
            </Flex>
            <Flex alignItems="center" flexWrap="wrap" mb={4}>
                <Text mr={2} width={["100%", "45%", "45%"]}>
                    {t("markActivityDone.completeDate")}
                </Text>
                <DatePicker
                    showTime
                    date={onCompletedDate}
                    onChange={(date) => onSelectDate(date, "REAL_END")}
                    textInputWidth="150px"
                    data-testid="real-end-date-picker"
                    rootId="react-app-modal-root"
                />
            </Flex>
        </Modal>
    );
}
