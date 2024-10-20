import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {
    TripResource,
    TripSchedulerView,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {ResourceLabel} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/resource/ResourceLabel";

type ResourceSectionLabelProps = {
    resource: TripResource | undefined;
    view: TripSchedulerView;
    displayLinkedResources?: boolean;
};

export const ResourceSectionLabel: FunctionComponent<ResourceSectionLabelProps> = ({
    resource,
    view,
    displayLinkedResources = false,
}) => {
    return (
        <Text
            variant="h2"
            color="grey.dark"
            display="flex"
            alignItems="center"
            ellipsis
            width="100%"
            maxWidth="300px"
        >
            <Text mr={1} color="inherit">
                {getResourceLabel()}
            </Text>
            {resource && (
                <ResourceLabel
                    view={view}
                    resource={resource}
                    displayLinkedResources={displayLinkedResources}
                />
            )}
        </Text>
    );

    function getResourceLabel() {
        switch (view) {
            case "trucker":
                return t("common.trucker");
            case "vehicle":
                return t("common.vehicle");
            case "trailer":
                return t("common.trailer");
            default:
                return "";
        }
    }
};
