import {Company, Trucker, type Trailer, type Vehicle} from "dashdoc-utils";
import React from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {DedicatedResourceForCharteringScheduler} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";

import {SchedulerResource, ResourceType} from "./resources.types";

export function getResourceId(item: SchedulerResource, resourceType: ResourceType) {
    if (resourceType === "dedicated_resources") {
        const dedicatedResource = item as DedicatedResourceForCharteringScheduler;
        return `${dedicatedResource.resource_type}-${dedicatedResource.pk}`;
    }
    return `${item.pk}`;
}

export function getResourceLabel(item: SchedulerResource, resourceType: ResourceType) {
    switch (resourceType) {
        case "trucker": {
            const truckerUser = (item as Trucker).user;
            return `${truckerUser.last_name} ${truckerUser.first_name}`;
        }
        case "vehicle":
        case "trailer":
            return <VehicleLabel vehicle={item as Trailer | Vehicle} />;
        case "chartering":
            return (item as Company).name;
        case "dedicated_resources": {
            const dedicatedResource = item as DedicatedResourceForCharteringScheduler;
            return `${dedicatedResource.label} (${dedicatedResource.carrier_name})`;
        }
    }
}

export function fetchResourcesUrl(resourceType: ResourceType) {
    switch (resourceType) {
        case "trucker":
            return "manager-truckers/";
        case "vehicle":
            return "vehicles/";
        case "trailer":
            return "trailers/";
        case "chartering":
            return "deliveries/carriers/";
        case "dedicated_resources":
            return "dedicated-resources-scheduler/dedicated-resources/";
    }
}

export function fetchResourcesIdsParams(resourceType: ResourceType, resourceUids: string[]) {
    if (resourceType === "dedicated_resources") {
        // resourceUids is a list of string in the form "resource_type-pk" in this case
        return getDedicatedResourcesIdsParams(resourceUids);
    }

    return {
        id__in: resourceUids,
    };
}

export function getDedicatedResourcesIdsParams(resourceUids: string[]) {
    return resourceUids.reduce(
        (acc, resourceUid) => {
            // We need to split the string to get the resource_type and pk
            const [resourceType, pk] = resourceUid.split("-");
            if (resourceType === "trucker") {
                acc.trucker__in.push(pk);
            } else if (resourceType === "vehicle") {
                acc.vehicle__in.push(pk);
            } else if (resourceType === "trailer") {
                acc.trailer__in.push(pk);
            }

            return acc;
        },
        {
            trucker__in: [] as string[],
            vehicle__in: [] as string[],
            trailer__in: [] as string[],
        }
    );
}

export function fetchResourcesApiVersion(resourceType: ResourceType) {
    switch (resourceType) {
        case "trucker":
        case "vehicle":
        case "trailer":
        case "chartering":
            return "v4";
        case "dedicated_resources":
            return "web";
    }
}

export function getResourceOrdering(sort: string | undefined, resourceType: ResourceType) {
    if (!sort) {
        return undefined;
    }
    if (resourceType === "trucker") {
        return sort === "-user"
            ? "-user__last_name,-user__first_name,-pk"
            : "user__last_name,user__first_name,pk";
    }
    return sort;
}
