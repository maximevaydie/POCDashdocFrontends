import {Logger, t} from "@dashdoc/web-core";
import {Box, Callout, DatePicker, Flex, Modal, Text} from "@dashdoc/web-ui";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useState} from "react";
import {tz} from "services/date";
import {TzDate} from "types";

type Props = {
    actionLabel: string;
    limitDate?: TzDate;
    onSubmit: (timestamp: string) => void;
    onClose: () => void;
};

export function ConfirmSlotCustomHourModal({actionLabel, limitDate, onSubmit, onClose}: Props) {
    const timezone = useSiteTimezone();
    const [time, setTime] = useState<Date | null>(() => {
        if (limitDate) {
            // The DatePicker component use the browser timezone
            // We need to convert the limitDate to the browser timezone
            const timeBrowserTimezone = new Date(
                limitDate.getFullYear(),
                limitDate.getMonth(),
                limitDate.getDate(),
                limitDate.getHours(),
                limitDate.getMinutes()
            );
            return timeBrowserTimezone;
        }
        const now = tz.now(timezone);
        now.setUTCSeconds(0, 0);
        return now;
    });

    const isInvalid = !!limitDate && !!time && limitDate.getTime() > time.getTime();
    return (
        <Modal
            title={t("flow.confirmAndSetCustomTime")}
            mainButton={{
                variant: "primary",
                onClick: onCancel,
                children: actionLabel,
                disabled: isInvalid,
            }}
            secondaryButton={{variant: "secondary", onClick: onClose}}
            onClose={onClose}
            data-testid="confirm-and-set-custom-time-modal"
        >
            <Text>{t("flow.confirmAndSetCustomTimeDetails")}</Text>

            {limitDate && (
                <Callout variant={isInvalid ? "danger" : "informative"} mt={4}>
                    {t("flow.error.maintainTemporalLogicOnCustomTime", {
                        date: tz.format(limitDate, "PPPPp"),
                    })}
                </Callout>
            )}
            <Flex mt={4} mb={6}>
                <Box>
                    <DatePicker
                        date={time}
                        onChange={setTime}
                        clearable={false}
                        required={true}
                        fallbackInvalidDate={false}
                        minDate={limitDate}
                        showTime
                        rootId="react-app-modal-root"
                        data-testid="start-time-date"
                        error={isInvalid}
                    />
                </Box>
            </Flex>
        </Modal>
    );
    function onCancel() {
        if (!time) {
            // should never happen
            Logger.error("No time selected");
            return;
        }
        if (isInvalid) {
            return;
        }
        // The DatePicker component returns a date in the browser timezone
        // We need to convert it to the site timezone in keeping the same day/hour/minutes
        const timeInSiteTimezone = tz.convert(time, timezone);
        timeInSiteTimezone.setFullYear(time.getFullYear());
        timeInSiteTimezone.setMonth(time.getMonth());
        timeInSiteTimezone.setDate(time.getDate());
        timeInSiteTimezone.setHours(time.getHours(), time.getMinutes(), 0, 0);
        const timestamp = tz.dateToISO(timeInSiteTimezone);
        onSubmit(timestamp);
    }
}
