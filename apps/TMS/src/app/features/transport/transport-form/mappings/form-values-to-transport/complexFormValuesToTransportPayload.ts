import {Company, Contact} from "dashdoc-utils";

import {complexTransportForm} from "app/features/transport/transport-form/complex-section/complexTransportForm.service";

import {
    DeliveryPost,
    TransportFormContextData,
    TransportFormActivity,
    TransportFormDelivery,
    TransportFormValues,
    TransportPost,
    TransportTemplatePost,
    type ShipperAndContacts,
    type CarrierAndContacts,
    TransportFormTrip,
    TemplateDeliveryPost,
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

export async function getTransportOrTemplatePayloadFromComplexFormValues(
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
        ? getTemplatePayloadFromComplexFormValues(
              formValues,
              formContext,
              currentCompany,
              isCarrier,
              hasBetterCompanyRoles,
              companiesFromConnectedGroupView,
              recipientsOrderEnabled
          )
        : getTransportPayloadFromComplexFormValues(
              formValues,
              formContext,
              currentCompany,
              isCarrier,
              hasBetterCompanyRoles,
              companiesFromConnectedGroupView,
              recipientsOrderEnabled
          );
}

async function getTransportPayloadFromComplexFormValues(
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

    const {
        deliveries,
        activities,
        shipper,
        means,
        supportExchanges,
        orderedActivitiesUids,
        trips,
    } = formValues;

    const orderedActivities = complexTransportForm.getOrderedActivities(
        Object.values(activities),
        orderedActivitiesUids,
        formContext.groupSimilarActivities
    );

    const postDeliveries = getPostDeliveriesFromFormDeliveries(
        deliveries,
        trips,
        orderedActivities,
        shipper,
        means?.carrier ?? null,
        formContext,
        recipientsOrderEnabled,
        currentCompany,
        authorContact
    );

    const postTrips = await Promise.all(
        trips.map(async (trip) => {
            const tripPostActivities = getPostActivitiesFromFormActivities(
                orderedActivities.filter((activity) => trip.activityUids.includes(activity.uid)),
                supportExchanges
            );

            const postMeans = await getPostMeans(trip.means, formContext);

            return {
                activities: tripPostActivities,
                ...postMeans,
            };
        })
    );

    const sitesNeedingEta: string[] = orderedActivities
        .filter((activity) => activity?.etaTracking === true)
        .map((activity) => activity.uid);

    return {
        transportOrTemplate: {
            deliveries: postDeliveries,
            trips: postTrips,
            ...sharedFields,
        },
        sitesNeedingEta,
    };
}

async function getTemplatePayloadFromComplexFormValues(
    formValues: TransportFormValues,
    formContext: TransportFormContextData,
    currentCompany: Company | null,
    isCarrier: boolean,
    hasBetterCompanyRoles: boolean,
    companiesFromConnectedGroupView: number[],
    recipientsOrderEnabled: boolean
): Promise<{transportOrTemplate: TransportTemplatePost; sitesNeedingEta: undefined}> {
    const {transportOrTemplate: standardPayload} = await getTransportPayloadFromComplexFormValues(
        formValues,
        formContext,
        currentCompany,
        isCarrier,
        hasBetterCompanyRoles,
        companiesFromConnectedGroupView,
        recipientsOrderEnabled
    );

    const activities = standardPayload.trips.flatMap((trip) => trip.activities);
    const authorContact = await getAuthorContacts();
    const deliveries = getPostTemplateDeliveriesFromFormDeliveries(
        formValues.deliveries,
        getSortedFormActivities(formValues, formContext),
        formValues.shipper,
        formValues.means?.carrier ?? null,
        formContext,
        recipientsOrderEnabled,
        currentCompany,
        authorContact
    );

    const templatePayload = {
        ...standardPayload,
        template_name: formValues.templateName!,
        activities,
        deliveries,
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

function getPostDeliveriesFromFormDeliveries(
    formDeliveries: Array<TransportFormDelivery>,
    formTrips: Array<TransportFormTrip>,
    formActivities: Array<TransportFormActivity>,
    shipper: ShipperAndContacts,
    carrier: CarrierAndContacts | null,
    context: TransportFormContextData,
    recipientsOrderEnabled: boolean,
    company: Company | null,
    authorContact: Contact | null
): Array<DeliveryPost> {
    return formDeliveries.map((delivery, index) => {
        const originTripIndex = formTrips.findIndex((trip) =>
            trip.activityUids.includes(delivery.loadingUid)
        )!;
        const sortedOriginTripActivities = formTrips[originTripIndex].activityUids.sort((a, b) => {
            return (
                formActivities.findIndex((activity) => activity.uid === a) -
                formActivities.findIndex((activity) => activity.uid === b)
            );
        });
        const origin_index = sortedOriginTripActivities.findIndex(
            (activityUid) => activityUid === delivery.loadingUid
        );

        const destinationTripIndex = formTrips.findIndex((trip) =>
            trip.activityUids.includes(delivery.unloadingUid)
        )!;
        const sortedDestinationTripActivities = formTrips[destinationTripIndex].activityUids.sort(
            (a, b) => {
                return (
                    formActivities.findIndex((activity) => activity.uid === a) -
                    formActivities.findIndex((activity) => activity.uid === b)
                );
            }
        );
        const destination_index = sortedDestinationTripActivities.findIndex(
            (activityUid) => activityUid === delivery.unloadingUid
        );

        const loads = delivery.loads.map((load) => getLoadDataFromForm(load, context, company));

        const tracking_contacts = getDeliveryContacts(
            formActivities.find((activity) => activity.uid === delivery.loadingUid)!,
            formActivities.find((activity) => activity.uid === delivery.unloadingUid)!,
            carrier,
            shipper,
            recipientsOrderEnabled,
            authorContact,
            context.isTemplate,
            index
        );

        const contact_uids = tracking_contacts.map(
            (tracking_contact) => tracking_contact.contact.uid
        );

        return {
            origin_trip_index: originTripIndex,
            origin_activity_index_in_trip: origin_index,
            destination_trip_index: destinationTripIndex,
            destination_activity_index_in_trip: destination_index,
            loads,
            contact_uids,
        };
    });
}

function getPostTemplateDeliveriesFromFormDeliveries(
    formDeliveries: Array<TransportFormDelivery>,
    formActivities: Array<TransportFormActivity>,
    shipper: ShipperAndContacts,
    carrier: CarrierAndContacts | null,
    context: TransportFormContextData,
    recipientsOrderEnabled: boolean,
    company: Company | null,
    authorContact: Contact | null
): Array<TemplateDeliveryPost> {
    return formDeliveries.map((delivery, index) => {
        const origin_index = formActivities.findIndex(
            (activity) => activity.uid === delivery.loadingUid
        );
        const destination_index = formActivities.findIndex(
            (activity) => activity.uid === delivery.unloadingUid
        );

        const loads = delivery.loads.map((load) => getLoadDataFromForm(load, context, company));

        const tracking_contacts = getDeliveryContacts(
            formActivities[origin_index],
            formActivities[destination_index],
            carrier,
            shipper,
            recipientsOrderEnabled,
            authorContact,
            context.isTemplate,
            index
        );

        const contact_uids = tracking_contacts.map(
            (tracking_contact) => tracking_contact.contact.uid
        );

        return {
            origin_index,
            destination_index,
            loads,
            contact_uids,
        };
    });
}

function getSortedFormActivities(
    formValues: TransportFormValues,
    formContext: TransportFormContextData
): Array<TransportFormActivity> {
    return complexTransportForm.getOrderedActivities(
        Object.values(formValues.activities),
        formValues.orderedActivitiesUids,
        formContext.groupSimilarActivities
    );
}
