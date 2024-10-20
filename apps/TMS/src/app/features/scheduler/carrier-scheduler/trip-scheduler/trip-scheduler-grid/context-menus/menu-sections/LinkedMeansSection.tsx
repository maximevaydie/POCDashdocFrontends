import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ContextMenuItem} from "@dashdoc/web-ui";
import React from "react";
import {useSelector} from "react-redux";

import {TripResource} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

interface LinkedMeansSectionProps {
    resource: TripResource;
    onEdit: () => void;
    onDelete: () => void;
}

export function LinkedMeansSection({onEdit, onDelete, resource}: LinkedMeansSectionProps) {
    const mode = resource.means_combination?.pk ? "edit" : "add";
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);

    return (
        <>
            <ContextMenuItem
                data-testid="edit-linked-means"
                icon="schedulerFlash"
                label={
                    mode === "add"
                        ? t("scheduler.meansCombinations.addLinkedMeans")
                        : t("scheduler.meansCombinations.editLinkedMeans")
                }
                onClick={() => {
                    sendEvent(mode);
                    onEdit();
                }}
            />
            {mode === "edit" ? (
                <ContextMenuItem
                    data-testid="delete-linked-means"
                    icon="delete"
                    label={t("scheduler.meansCombinations.deleteLinkedMeans")}
                    onClick={() => {
                        sendEvent("delete");
                        onDelete();
                    }}
                />
            ) : null}
        </>
    );

    function sendEvent(action: "add" | "edit" | "delete") {
        analyticsService.sendEvent(AnalyticsEvent.actionAfterRightClick, {
            "company id": company?.pk,
            "is staff": manager?.user.is_staff,
            action: `${action}_means_combination`,
        });
    }
}
