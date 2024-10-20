import {Company, Contact} from "dashdoc-utils";

import {
    DeliveryPost,
    TransportFormContextData,
    TransportFormActivity,
    TransportFormValues,
    TransportPost,
    TransportTemplatePost,
    type ShipperAndContacts,
    type CarrierAndContacts,
} from "../../transport-form.types";

import {
    getAuthorContacts,
    getDeliveryContacts,
    getLoadDataFromForm,
    getPostActivitiesFromFormActivities,
    getPostMeans,
    getSharedTransportPayloadFields,
    getSharedTransportPayloadFieldsDeprecated,
} from "./shared";

// FORM VALUES => TRANSPORT PAYLOAD  (to submit)

export async function getTransportOrTemplatePayloadFromSimpleFormValues(
    formValues: TransportFormValues,
    formContext: TransportFormContextData,
    currentCompany: Company | null,
    isCarrier: boolean,
    hasBetterCompanyRoles: boolean,
    companiesFromConnectedGroupView: number[],
    recipientsOrderEnabled: boolean,
    isCreatingTemplate: boolean
) {
    return isCreatingTemplate
        ? getTemplatePayloadFromSimpleFormValues(
              formValues,
              formContext,
              currentCompany,
              isCarrier,
              hasBetterCompanyRoles,
              companiesFromConnectedGroupView,
              recipientsOrderEnabled
          )
        : getTransportPayloadFromSimpleFormValues(
              formValues,
              formContext,
              currentCompany,
              isCarrier,
              hasBetterCompanyRoles,
              companiesFromConnectedGroupView,
              recipientsOrderEnabled
          );
}

export async function getTransportPayloadFromSimpleFormValues(
    formValues: TransportFormValues,
    formContext: TransportFormContextData,
    currentCompany: Company | null,
    isCarrier: boolean,
    hasBetterCompanyRoles: boolean,
    companiesFromConnectedGroupView: number[],
    recipientsOrderEnabled: boolean
): Promise<{transportOrTemplate: TransportPost; sitesNeedingEta: string[]}> {
    const sharedFields = hasBetterCompanyRoles
        ? await getSharedTransportPayloadFields(
              formValues,
              formContext,
              currentCompany,
              isCarrier,
              companiesFromConnectedGroupView
          )
        : await getSharedTransportPayloadFieldsDeprecated(
              formValues,
              formContext,
              currentCompany,
              isCarrier,
              companiesFromConnectedGroupView
          );

    const authorContact = await getAuthorContacts();

    const {loadings, unloadings, shipper, loads, means, supportExchanges} = formValues;

    const activities = [...loadings, ...unloadings];

    const deliveriesPost = getPostDeliveriesFromFormActivities(
        loadings,
        unloadings,
        loads,
        shipper,
        means?.carrier ?? null,
        formContext,
        recipientsOrderEnabled,
        currentCompany,
        authorContact
    );

    const activitiesPost = await getPostActivitiesFromFormActivities(activities, supportExchanges);

    // Simple form always has one trip
    const postTrip = {
        activities: activitiesPost,
        ...(await getPostMeans(means ?? null, formContext)),
    };

    const sitesNeedingEta: string[] = activities
        .filter((activity) => activity?.etaTracking === true)
        .map((activity) => activity.uid);

    return {
        transportOrTemplate: {
            deliveries: deliveriesPost,
            trips: [postTrip],
            ...sharedFields,
        },
        sitesNeedingEta,
    };
}

export async function getTemplatePayloadFromSimpleFormValues(
    formValues: TransportFormValues,
    formContext: TransportFormContextData,
    currentCompany: Company | null,
    isCarrier: boolean,
    hasBetterCompanyRoles: boolean,
    companiesFromConnectedGroupView: number[],
    recipientsOrderEnabled: boolean
): Promise<{transportOrTemplate: TransportTemplatePost; sitesNeedingEta: undefined}> {
    const {transportOrTemplate: standardPayload} = await getTransportPayloadFromSimpleFormValues(
        formValues,
        formContext,
        currentCompany,
        isCarrier,
        hasBetterCompanyRoles,
        companiesFromConnectedGroupView,
        recipientsOrderEnabled
    );

    const deliveries = standardPayload.deliveries.map((delivery) => {
        return {
            ...delivery,
            origin_index: delivery.origin_activity_index_in_trip,
            destination_index: delivery.destination_activity_index_in_trip,
            origin_trip_index: undefined,
            destination_trip_index: undefined,
            origin_activity_index_in_trip: undefined,
            destination_activity_index_in_trip: undefined,
        };
    });

    const templatePayload = {
        ...standardPayload,
        activities: standardPayload.trips[0].activities,
        deliveries,
        template_name: formValues.templateName!,
        send_to_trucker: undefined,
        send_to_carrier: undefined,
        trucker_id: undefined,
        vehicle_id: undefined,
        trailer_id: undefined,
        trips: undefined,
    };

    return {
        transportOrTemplate: templatePayload,
        sitesNeedingEta: undefined,
    };
}

const getPostDeliveriesFromFormActivities = (
    loadings: Array<TransportFormActivity & {originalUid?: string}>,
    unloadings: Array<TransportFormActivity & {originalUid?: string}>,
    loads: TransportFormValues["loads"],
    shipper: ShipperAndContacts,
    carrier: CarrierAndContacts | null,
    context: TransportFormContextData,
    recipientsOrderEnabled: boolean,
    company: Company | null,
    authorContact: Contact | null
): Array<DeliveryPost> => {
    const activities = [...loadings, ...unloadings];

    return loadings
        .map((loading, loadingIndex) => {
            return unloadings.map((unloading, unloadingIndex) => {
                const origin_index = activities.findIndex(
                    (activity) => activity.uid === loading.uid
                );
                const destination_index = activities.findIndex(
                    (activity) => activity.uid === unloading.uid
                );

                const loadsPost = loads
                    .filter(
                        (load) =>
                            load.delivery.loadingActivity.uid === loading.uid &&
                            load.delivery.unloadingActivity.uid === unloading.uid
                    )
                    .map((load) => getLoadDataFromForm(load, context, company));

                const tracking_contacts = getDeliveryContacts(
                    loading,
                    unloading,
                    carrier,
                    shipper,
                    recipientsOrderEnabled,
                    authorContact,
                    context.isTemplate,
                    loadingIndex + unloadingIndex
                );

                const contact_uids = tracking_contacts.map(
                    (tracking_contact) => tracking_contact.contact.uid
                );

                return {
                    origin_trip_index: 0,
                    origin_activity_index_in_trip: origin_index,
                    destination_trip_index: 0,
                    destination_activity_index_in_trip: destination_index,
                    loads: loadsPost,
                    contact_uids,
                };
            });
        })
        .flat();
};
