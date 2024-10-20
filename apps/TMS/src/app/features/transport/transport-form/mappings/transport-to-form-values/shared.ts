import {guid} from "@dashdoc/core";
import {apiService} from "@dashdoc/web-common";
import {Locale, Logger} from "@dashdoc/web-core";
import {
    Address,
    AdrUnCode,
    Company,
    Contact,
    PREDEFINED_LOAD_CATEGORIES,
    PredefinedLoadCategory,
    Pricing,
    PurchaseCostLine,
    SimpleContact,
    SiteSlot,
    Trailer,
    Vehicle,
    WasteLoad,
    getLocale,
    getUniqueFromArray,
} from "dashdoc-utils";
import flatMap from "lodash.flatmap";
import isEmpty from "lodash.isempty";
import isNil from "lodash.isnil";

import {isCarrierOf} from "app/features/transport/transport-form/TransportForm";
import {getInitialPricingForm} from "app/services/invoicing";
import {transportRightService} from "app/services/transport";
import {activityService} from "app/services/transport/activity.service";

import {
    FormLoad,
    TransportFormActivity,
    TransportFormContextData,
    TransportFormDeliveryOption,
    TransportFormSupportExchange,
    TransportFormValues,
    type TransportFormMeans,
} from "../../transport-form.types";

import type {Activity, Delivery, Load, Transport} from "app/types/transport";

export async function getBaseFormValuesFromTransport(
    transport: Transport,
    formContext: TransportFormContextData,
    company: Company | null,
    companiesPksFromConnectedGroupView: Array<number>,
    hasBetterCompanyRoles: boolean
): Promise<TransportFormValues> {
    const activities = activityService.getTransportActivities(transport);

    const {contacts, contactsAreFromAnotherCompany} = getContacts(transport, company!.pk);

    const formMeans = getFormMeans(
        transport,
        formContext,
        activities,
        contacts,
        contactsAreFromAnotherCompany
    );

    const isCarrierOfTransport = isCarrierOf(company, formMeans, hasBetterCompanyRoles);
    const formPrice = await getFormPrice(
        transport,
        company!,
        companiesPksFromConnectedGroupView,
        formContext.isTemplate,
        isCarrierOfTransport
    );

    const shipper = getFormShipper(transport, contacts, contactsAreFromAnotherCompany);
    return {
        trips: [],
        activities: {},
        orderedActivitiesUids: [],
        loads: [],
        deliveries: [],
        loadings: [],
        unloadings: [],
        supportExchanges: [],
        shipper,
        means: formMeans,
        price: formPrice,
        settings: {
            businessPrivacy: transport.business_privacy,
            volumeDisplayUnit: transport.volume_display_unit,
            transportOperationCategory: formContext.transportOperationCategory,
        },
        instructions: transport.instructions || "",
        templateName: transport.template_name,
    };
}

export async function getFormActivity(
    activity: Activity,
    transport: Transport,
    companyPk: number
): Promise<TransportFormActivity> {
    const {contacts, contactsAreFromAnotherCompany} = getContacts(transport, companyPk!);

    const activityAddressInstructions = activity.site.address?.original
        ? await getActivityAddressInstructions(activity.site.address.original)
        : undefined;

    const uid =
        activity.type === "loading"
            ? activity.deliveries[0].origin.uid
            : activity.deliveries[0].destination.uid;
    const isBookingNeeded =
        activity.site.is_booking_needed || !!activity.site.address?.flow_site?.slug;

    return {
        uid: uid ?? guid(),
        type: activity.type,
        //TODO: AddressWithFullCompany is not compatible with Address
        address: activity.site.address ? (activity.site.address as any as Address) : undefined,

        contact: getSiteContact(activity, contacts, contactsAreFromAnotherCompany) as Contact,
        contacts: getSiteContacts(activity, contacts, contactsAreFromAnotherCompany) as Contact[],
        reference: activity.site.reference,
        slots: [] as SiteSlot[],
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
        truckerInstructions: activity.site.trucker_instructions || "",
        instructions: activity.instructions || activityAddressInstructions || "",
        etaTracking: false,
        isBookingNeeded,
        lockedRequestedTimes: activity.site.locked_requested_times ?? false,
    };
}

export function getFormSupportExchanges(
    isDuplicatingTransport: boolean,
    activities: Activity[],
    formActivities: TransportFormActivity[]
): TransportFormValues["supportExchanges"] {
    return isDuplicatingTransport
        ? []
        : activities.reduce((acc: TransportFormSupportExchange[], activity) => {
              const supports_exchanges = activity.site.supports_exchanges;
              return acc.concat(
                  supports_exchanges.map((exchange) => {
                      return {
                          activity: formActivities.find(
                              (formActivity) => formActivity.uid === exchange.site.uid
                          )!,
                          type: exchange.support_type,
                          expectedRetrieved: exchange.expected_retrieved,
                          expectedDelivered: exchange.expected_delivered,
                      } as TransportFormSupportExchange;
                  })
              );
          }, []);
}

function getFormShipper(
    transport: Transport,
    contacts: SimpleContact[],
    contactsAreFromAnotherCompany: boolean
): TransportFormValues["shipper"] {
    const shipperAddress = transport.deliveries[0].shipper_address;

    return {
        //TODO: TransportAddressWithCompany is not compatible with Address
        address: shipperAddress as any as Address,
        shipper: transport.shipper,
        contact: getTrackingContact(
            shipperAddress.company.pk,
            contacts,
            contactsAreFromAnotherCompany
        ),
        contacts: getTrackingContacts(
            shipperAddress.company.pk,
            contacts,
            contactsAreFromAnotherCompany
        ),
        reference: transport.deliveries?.find(({shipper_reference}) => !!shipper_reference)
            ?.shipper_reference,
    };
}

async function getFormPrice(
    transport: Transport,
    company: Company,
    companiesPksFromConnectedGroupView: Array<number>,
    isTemplate: boolean,
    isCarrierOfTransport: boolean
): Promise<TransportFormValues["price"]> {
    const companyPk = company.pk;
    let quotation: Pricing | null = null;

    try {
        if (transport.carrier?.pk === companyPk) {
            // If we're the carrier, fetch the pricing
            quotation = await apiService.get(`/transports/${transport.uid}/pricing/`, {
                apiVersion: "v4",
            });
        }
    } catch (error) {
        Logger.log(`Transport ${transport.uid} has no pricing.`);
    }

    if (quotation === null) {
        try {
            // If we're not the carrier or if the transport has no pricing, fetch the quotation and don't keep invoice items if the carrier is not self, because they belong to the original carrier
            quotation = await apiService.get(`/transports/${transport.uid}/quotation/`, {
                apiVersion: "v4",
            });
            if (transport.carrier?.pk !== companyPk) {
                for (let line of quotation?.lines ?? []) {
                    line.invoice_item = null;
                }
            }
        } catch (error) {
            Logger.log(`Transport ${transport.uid} has no quotation.`);
        }
    }

    const canCreateCustomerToInvoice = transportRightService.canCreateCustomerToInvoice(
        transport,
        companyPk,
        companiesPksFromConnectedGroupView
    );

    let purchaseCostsLines: PurchaseCostLine[] = [];
    if (
        transport.carrier &&
        companiesPksFromConnectedGroupView.includes(transport.carrier.pk) &&
        !isNil(transport.purchase_costs)
    ) {
        purchaseCostsLines = isTemplate
            ? transport.purchase_costs.lines
            : transport.purchase_costs.lines.map(({id, ...lineProps}) => lineProps);
    }

    transport.carrier_assignation_status = transport.carrier_assignation_status || "unassigned";

    return {
        customerToInvoice: canCreateCustomerToInvoice ? transport.customer_to_invoice : undefined,
        quotation: getInitialPricingForm(quotation, company, {
            copyFuelSurchargeAgreement: transport.carrier_assignation_status === "assigned",
            copyTariffGridLine: isCarrierOfTransport,
            requireLinesForFuelSurchargeAgreement: !isCarrierOfTransport,
            mustBeOwnerOfFuelSurchargeAgreement: true,
            fromTransportCreationForm: true,
        }),
        purchaseCosts: {
            lines: purchaseCostsLines,
        },
    };
}

function getFormMeans(
    transport: Transport,
    formContext: TransportFormContextData,
    activities: Activity[],
    contacts: SimpleContact[],
    contactsAreFromAnotherCompany: boolean
): TransportFormMeans | undefined {
    if (
        transport.carrier ||
        transport.carrier_address ||
        transport.carrier_reference ||
        getUniqueFromArray(activities, ["segment", "trucker"]) ||
        getUniqueFromArray(activities, ["segment", "vehicle"]) ||
        getUniqueFromArray(activities, ["segment", "trailers"])?.[0] ||
        transport.requested_vehicle
    ) {
        const result: TransportFormMeans = {
            trucker:
                formContext.isTemplate || formContext.isOrder
                    ? null
                    : getUniqueFromArray(activities, ["segment", "trucker"]),
            vehicle:
                formContext.isTemplate || formContext.isOrder
                    ? null
                    : getUniqueFromArray(activities, ["segment", "vehicle"], isSamePlates),
            trailer:
                formContext.isTemplate || formContext.isOrder
                    ? null
                    : getUniqueFromArray(
                          activities,
                          ["segment", "trailers"],
                          (trailers1, trailers2) =>
                              trailers1.length === trailers2.length &&
                              trailers1.every((trailer: Trailer, index: number) =>
                                  isSamePlates(trailer, trailers2[index])
                              )
                      )?.[0],
            carrier: {
                carrier: transport.carrier ?? undefined,
                address: transport.carrier_address
                    ? (transport.carrier_address as any as Address)
                    : undefined,
                contact: transport.carrier
                    ? getTrackingContact(
                          transport.carrier.pk,
                          contacts,
                          contactsAreFromAnotherCompany
                      )
                    : undefined,
                contacts: transport.carrier
                    ? getTrackingContacts(
                          transport.carrier.pk,
                          contacts,
                          contactsAreFromAnotherCompany
                      )
                    : [],
                reference: transport.carrier_reference,
            },
            sendToTrucker:
                transport.status_updates.some(({category}) => category === "sent_to_trucker") ||
                !!transport.template_name,
            requestedVehicle: transport.requested_vehicle,
        };
        return result;
    }
    return undefined;
}

export function getLoadDeliveryOptions(deliveries: Delivery[]): TransportFormDeliveryOption[] {
    const loadings = [...new Set(deliveries.map((delivery) => delivery.origin))];
    const unloadings = [...new Set(deliveries.map((delivery) => delivery.destination))];
    const formDeliveries: TransportFormDeliveryOption[] = [];
    for (const delivery of deliveries) {
        formDeliveries.push({
            uid: delivery.uid,
            loadingActivity: {
                uid: delivery.origin.uid,
                //TODO: TransportAddress is not compatible with Address
                address: (delivery.origin.address ?? undefined) as Address | undefined,
                index: loadings.indexOf(delivery.origin),
                type: "loading",
            },
            unloadingActivity: {
                uid: delivery.destination.uid,
                //TODO: TransportAddress is not compatible with Address
                address: (delivery.destination.address ?? undefined) as Address | undefined,
                index: unloadings.indexOf(delivery.destination),
                type: "unloading",
            },
        });
    }
    return formDeliveries;
}

export const getFormLoad = (
    load: Load | WasteLoad,
    transportContext: TransportFormContextData,
    loadDelivery: TransportFormDeliveryOption
): FormLoad => {
    const payload = {
        ...load,
        uid: guid(),
        adrUnCode: (load.adr_un_code ? {code: load.adr_un_code} : null) as AdrUnCode,
        adrUnDescriptionByLanguage: load.adr_un_code
            ? Object.keys(load.adr_un_description_by_language).length > 0
                ? (load.adr_un_description_by_language as Partial<Record<Locale, string>>)
                : // To assure a retro-compatibility with adrUnDescriptionByLanguage
                  // When the adrUnDescriptionByLanguage is not filled, we use the current locale and the load description
                  {[getLocale() as Locale]: load.description}
            : {},
        category: (PREDEFINED_LOAD_CATEGORIES.includes(load.category)
            ? load.category
            : "other") as PredefinedLoadCategory,
        otherCategory:
            PREDEFINED_LOAD_CATEGORIES.includes(load.category) && load.category !== "other"
                ? ""
                : load.category,
        requiresWashing: transportContext.requiresWashing,
        isMultipleRounds: transportContext.isMultipleRounds,
        isMultipleCompartments: transportContext.isMultipleCompartments,
        delivery: loadDelivery,
        plannedReturnablePallets: "",
        linear_meters: load.linear_meters ? parseFloat(`${load.linear_meters}`) : null,
        tare_weight: load.tare_weight ? parseFloat(`${load.tare_weight}`) : null,
        volume: load.volume ? parseFloat(`${load.volume}`) : null,
        weight: load.weight ? parseFloat(`${load.weight}`) : null,
        steres: load.steres || null,
        quantity: load.quantity || null,
        length: load.length || null,
        containerNumberChecked: !isEmpty(load.container_number) || load.use_container_number,
        sealNumberChecked: !isEmpty(load.container_seal_number) || load.use_container_seal_number,
    };

    return payload;
};

function isSamePlates(v1: Vehicle | Trailer, v2: Vehicle | Trailer) {
    return (v1?.original ?? v1?.pk) === (v2?.original ?? v2?.pk);
}

function getTrackingContact(
    trackingContactCompanyPk: number,
    contacts: SimpleContact[],
    contactsAreFromAnotherCompany: boolean
) {
    if (contactsAreFromAnotherCompany) {
        // If the contacts are from another company we don't try to duplicate
        // them. It might create some visibility issue. We just ignore them.
        return undefined;
    } else {
        return contacts.find((contact) => contact.company.pk === trackingContactCompanyPk);
    }
}

const getTrackingContacts = (
    trackingContactCompanyPk: number,
    contacts: SimpleContact[],
    contactsAreFromAnotherCompany: boolean
) => {
    if (contactsAreFromAnotherCompany) {
        // If the contacts are from another company we don't try to duplicate
        // them. It might create some visibility issue. We just ignore them.
        return [];
    } else {
        return contacts.filter((contact) => contact.company.pk === trackingContactCompanyPk);
    }
};

function getSiteContact(
    activity: Activity,
    contacts: SimpleContact[],
    contactsAreFromAnotherCompany: boolean
) {
    if (
        contactsAreFromAnotherCompany ||
        !activity.site.address ||
        !activity.site.address.company
    ) {
        return null;
    }
    return contacts.find((contact) => contact.company.pk === activity.site.address?.company?.pk);
}
function getSiteContacts(
    activity: Activity,
    contacts: SimpleContact[],
    contactsAreFromAnotherCompany: boolean
) {
    if (
        contactsAreFromAnotherCompany ||
        !activity.site.address ||
        !activity.site.address.company
    ) {
        return [];
    }
    return contacts.filter((contact) => contact.company.pk === activity.site.address?.company?.pk);
}

async function getActivityAddressInstructions(addressId: number): Promise<string | undefined> {
    try {
        const originalAddress = await apiService.Addresses.get(addressId);
        return originalAddress.instructions;
    } catch {
        return undefined;
    }
}

function getContacts(transport: Transport, companyPk: number) {
    const contactsAreFromAnotherCompany = companyPk !== transport.created_by.pk;

    return {
        contacts: flatMap(transport.deliveries, (delivery) => delivery.tracking_contacts).map(
            (trackingContact) => trackingContact.contact
        ),
        contactsAreFromAnotherCompany,
    };
}
