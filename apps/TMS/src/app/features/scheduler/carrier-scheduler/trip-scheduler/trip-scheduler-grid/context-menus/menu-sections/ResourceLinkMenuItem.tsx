import {
    getConnectedManager,
    getConnectedCompany,
    analyticsService,
    AnalyticsEvent,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ContextMenuItem} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {useSelector} from "react-redux";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

type ResourceLinkMenuItemProps = {
    resourceId: number;
    view: TripSchedulerView;
};

export const ResourceLinkMenuItem: FunctionComponent<ResourceLinkMenuItemProps> = ({
    resourceId,
    view,
}) => {
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);

    return (
        <ContextMenuItem
            data-testid={"open-resource-page"}
            icon="eye"
            label={getResourceLabel()}
            isLink
            onClick={() => {
                sendEvent();
                window.open(getLink(), "_blank");
            }}
        />
    );

    function getLink() {
        switch (view) {
            case "trucker":
                return `/app/fleet/truckers/details/${resourceId}`;
            case "vehicle":
                return `/app/fleet/vehicles/${resourceId}`;
            case "trailer":
                return `/app/fleet/trailers/${resourceId}`;
            default:
                return "";
        }
    }

    function getResourceLabel() {
        switch (view) {
            case "trucker":
                return t("contextmenu.truckerLink");
            case "vehicle":
                return t("contextmenu.vehicleLink");
            case "trailer":
                return t("contextmenu.trailerLink");
            default:
                return "";
        }
    }

    function sendEvent() {
        analyticsService.sendEvent(AnalyticsEvent.actionAfterRightClick, {
            "company id": company?.pk,
            "is staff": manager?.user.is_staff,
            action: `open_resource_page`,
        });
    }
};
