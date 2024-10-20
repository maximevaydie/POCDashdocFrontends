import {t} from "@dashdoc/web-core";
import React from "react";

import MarkBreakSiteDoneForm from "./mark-break-site-done-form";
import {MarkActivityDoneForm} from "./mark-site-done-form";

import type {Activity} from "app/types/transport";

interface MarkActivityDoneModalProps {
    activity: Activity;
    resumeIsDone?: boolean;
    isOnlyCreator: boolean;
    onClose: () => void;
}

export function getMarkActivityDoneTitle(activity: Activity) {
    let title = "";

    if (activity.type === "unloading") {
        title = t("markActivityDone.markUnloadingDone");
    } else if (activity.type === "loading") {
        title = t("markActivityDone.markLoadingDone");
    } else if (activity.siteType === "bulkingBreak") {
        title = t("markActivityDone.markBulkingBreakStartDone");
    }

    return title;
}

export function MarkActivityDoneModal({
    activity,
    onClose,
    resumeIsDone,
    isOnlyCreator,
}: MarkActivityDoneModalProps) {
    const title = getMarkActivityDoneTitle(activity);

    if (activity.type === "bulkingBreakStart" || activity.type === "bulkingBreakEnd") {
        return (
            <MarkBreakSiteDoneForm
                title={title}
                activity={activity}
                resumeIsDone={resumeIsDone}
                onFinish={onClose}
            />
        );
    }
    /** Same object as the `activity` prop, but we help TS to correctly narrow its type */
    const correctlyTypedActivity: Activity & {type: "loading" | "unloading"} = {
        ...activity,
        type: activity.type,
    };
    return (
        <MarkActivityDoneForm
            isOnlyCreator={isOnlyCreator}
            activity={correctlyTypedActivity}
            onFinish={onClose}
            title={title}
        />
    );
}
