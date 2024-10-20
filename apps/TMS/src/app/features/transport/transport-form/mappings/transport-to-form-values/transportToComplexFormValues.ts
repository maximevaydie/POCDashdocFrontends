import {Company} from "dashdoc-utils";

import {activityService} from "app/services/transport/activity.service";

import {
    TransportFormActivity,
    TransportFormContextData,
    TransportFormValues,
} from "../../transport-form.types";

import {
    getBaseFormValuesFromTransport,
    getFormActivity,
    getFormLoad,
    getFormSupportExchanges,
    getLoadDeliveryOptions,
} from "./shared";

import type {Activity, Transport} from "app/types/transport";

export async function getComplexFormValuesFromTransport(
    transport: Transport,
    formContext: TransportFormContextData,
    company: Company | null,
    companiesPksFromConnectedGroupView: Array<number>,
    hasBetterCompanyRoles: boolean
): Promise<TransportFormValues> {
    const baseFormValues = await getBaseFormValuesFromTransport(
        transport,
        formContext,
        company,
        companiesPksFromConnectedGroupView,
        hasBetterCompanyRoles
    );
    const orderedActivitiesUids = [
        ...new Set(
            transport.segments.flatMap((segment) => [segment.origin.uid, segment.destination.uid])
        ),
    ];

    const activities = activityService.getTransportActivities(transport) as (Activity & {
        uid: string;
    })[];

    const loadings = activities.filter(({type}) => type === "loading");
    const formLoadings = await Promise.all(
        loadings.map((loading) => getFormActivity(loading, transport, company!.pk))
    );

    const unloadings = activities.filter(({type}) => type === "unloading");
    const formUnloadings = await Promise.all(
        unloadings.map((unloading) => getFormActivity(unloading, transport, company!.pk))
    );

    // Used in load form to select the load delivery
    const loadDeliveryOptions = getLoadDeliveryOptions(transport.deliveries);

    const formDeliveries = transport.deliveries
        .map((delivery) => {
            // TODO: Check if we can use delivery.origin and delivery.destination directly
            const loading = formLoadings.find((activity) => delivery.origin.uid === activity.uid)!;
            const unloading = formUnloadings.find(
                (activity) => delivery.destination.uid === activity.uid
            )!;
            const loads = delivery.planned_loads.map((load) =>
                getFormLoad(
                    load,
                    formContext,
                    loadDeliveryOptions.find((formDelivery) => formDelivery.uid === delivery.uid)!
                )
            );
            return {
                loadingUid: loading.uid,
                unloadingUid: unloading.uid,
                loads,
            };
        })
        .sort(
            (a, b) =>
                orderedActivitiesUids.indexOf(a.loadingUid) -
                orderedActivitiesUids.indexOf(b.loadingUid)
        );

    const formSupportExchanges = getFormSupportExchanges(formContext.isDuplicating, activities, [
        ...formLoadings,
        ...formUnloadings,
    ]);

    // TODO: Handle break and resume activities
    const orderedActivities = [...formLoadings, ...formUnloadings].sort(
        (a, b) => orderedActivitiesUids.indexOf(a.uid) - orderedActivitiesUids.indexOf(b.uid)
    );

    // TODO: Handle duplicating breaks (multiple trips)
    const formTrips = [
        {
            activityUids: orderedActivities.map(({uid}) => uid),
            means: baseFormValues.means ?? null,
        },
    ];

    return {
        ...baseFormValues,
        trips: formTrips,
        deliveries: formDeliveries,
        supportExchanges: formSupportExchanges,
        orderedActivitiesUids,
        activities: orderedActivities.reduce(
            (acc, activity) => {
                acc[activity.uid] = activity;
                return acc;
            },
            {} as Record<string, TransportFormActivity>
        ),
    };
}
