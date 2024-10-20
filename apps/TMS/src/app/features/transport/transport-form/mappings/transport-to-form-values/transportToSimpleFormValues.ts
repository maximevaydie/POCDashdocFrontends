import {Company} from "dashdoc-utils";

import {activityService} from "app/services/transport/activity.service";

import {TransportFormContextData, TransportFormValues} from "../../transport-form.types";

import {
    getBaseFormValuesFromTransport,
    getFormActivity,
    getFormLoad,
    getFormSupportExchanges,
    getLoadDeliveryOptions,
} from "./shared";

import type {Transport} from "app/types/transport";

export async function getSimpleFormValuesFromTransport(
    transport: Transport,
    formContext: TransportFormContextData,
    company: Company | null,
    companiesPksFromConnectedGroupView: Array<number>,
    hasBetterCompanyRolesEnabled: boolean
): Promise<TransportFormValues> {
    const baseFormValues = await getBaseFormValuesFromTransport(
        transport,
        formContext,
        company,
        companiesPksFromConnectedGroupView,
        hasBetterCompanyRolesEnabled
    );
    const activities = activityService.getTransportActivities(transport);

    const loadings = activities.filter(({type}) => type === "loading");
    const formLoadings = await Promise.all(
        loadings.map((loading) => getFormActivity(loading, transport, company!.pk))
    );

    const unloadings = activities.filter(({type}) => type === "unloading");
    const formUnloadings = await Promise.all(
        unloadings.map((unloading) => getFormActivity(unloading, transport, company!.pk))
    );

    const loadDeliveryOptions = getLoadDeliveryOptions(transport.deliveries);
    const formLoads = transport.deliveries.flatMap((delivery) => {
        return delivery.planned_loads.map((load) =>
            getFormLoad(
                load,
                formContext,
                loadDeliveryOptions.find((formDelivery) => formDelivery.uid === delivery.uid)!
            )
        );
    });

    const formSupportExchanges = getFormSupportExchanges(formContext.isDuplicating, activities, [
        ...formLoadings,
        ...formUnloadings,
    ]);

    return {
        ...baseFormValues,
        loadings: formLoadings,
        unloadings: formUnloadings,
        loads: formLoads,
        supportExchanges: formSupportExchanges,
    };
}
