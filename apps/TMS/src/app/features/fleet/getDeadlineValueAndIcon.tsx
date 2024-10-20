import {t} from "@dashdoc/web-core";
import {Flex, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import differenceInDays from "date-fns/differenceInDays";
import isAfter from "date-fns/isAfter";
import React, {ReactElement} from "react";

export type deadlineStatus = "Expired" | "ExpiresSoon" | "Ok";
export enum deadlineColors {
    Expired = "red.default",
    ExpiresSoon = "yellow.dark",
}
export enum deadlineBackgroundColors {
    Expired = "red.ultralight",
    ExpiresSoon = "yellow.ultralight",
    Ok = "grey.light",
}

export const getDeadlineValueAndStatus = (
    dateString?: string,
    format = "P"
): {formattedDate: string | null; deadlineStatus: deadlineStatus} => {
    if (!dateString) {
        return {formattedDate: "", deadlineStatus: "Ok"};
    }

    const date = new Date(dateString);
    const now = new Date();

    let deadlineStatus: deadlineStatus;
    if (isAfter(now, date)) {
        deadlineStatus = "Expired";
    } else if (differenceInDays(date, now) <= 90) {
        deadlineStatus = "ExpiresSoon";
    } else {
        deadlineStatus = "Ok";
    }

    return {formattedDate: formatDate(dateString, format), deadlineStatus};
};

export const getDeadlineValueAndIcon = (
    dateString?: string,
    format = "P"
): ReactElement | null => {
    if (!dateString) {
        return null;
    }

    const {formattedDate, deadlineStatus} = getDeadlineValueAndStatus(dateString, format);
    const deadlineTooltipText =
        // nosemgrep
        deadlineStatus !== "Ok" ? t(`fleet.common.deadline${deadlineStatus}`) : "";

    return (
        <Flex alignItems="center" style={{gap: "8px"}}>
            {formattedDate}
            {deadlineStatus !== "Ok" && (
                <TooltipWrapper content={deadlineTooltipText} boxProps={{display: "inline-flex"}}>
                    <Icon name="alert" color={deadlineColors[deadlineStatus]} />
                </TooltipWrapper>
            )}
        </Flex>
    );
};
