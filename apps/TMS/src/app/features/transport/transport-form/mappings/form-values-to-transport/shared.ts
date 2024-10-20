import {apiService, NO_COMPANY_VALUE} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {Address, Company, Contact, ExtractedNewAddress, Trailer, Vehicle} from "dashdoc-utils";
import pick from "lodash.pick";
import uniqBy from "lodash.uniqby";

import {partnerService} from "app/features/address-book/partner.service";
import {getLoadDisplaySettings} from "app/features/transport/load/load-form/load-form.helpers";
import {
    ActivityPost,
    FormLoad,
    LoadPost,
    SupportExchangePost,
    TransportFormActivity,
    TransportFormContextData,
    TransportFormSupportExchange,
    TransportFormValues,
    TransportPost,
    type CarrierAndContacts,
    type ShipperAndContacts,
    type TransportFormMeans,
    type TransportPostDeprecated,
    type TransportPostWithPartnerPk,
} from "app/features/transport/transport-form/transport-form.types";
import {computePricingBeforeSubmit} from "app/services/invoicing";
import {transportRightService} from "app/services/transport";
import {canUpsertPurchaseCost} from "app/taxation/pricing/services/purchaseCostRight.service";

import type {TransportWithCarrierPk} from "app/types/transport";

export function getPostActivitiesFromFormActivities(
    orderedActivities: Array<TransportFormActivity>,
    supportExchanges: Array<TransportFormSupportExchange>
): Array<ActivityPost> {
    return orderedActivities.map((activity) => {
        const supportExchangesForActivity = supportExchanges
            .filter((supportExchange) => supportExchange.activity.uid === activity.uid)
            .map((supportExchange) => {
                return {
                    support_type_uid: supportExchange.type.uid,
                    expected_retrieved: supportExchange.expectedRetrieved,
                    expected_delivered: supportExchange.expectedDelivered,
                } as SupportExchangePost;
            });

        return {
            address_id: activity.address ? activity.address?.pk : null,
            address: getNewAddressData(activity.address),
            category: activity.type,
            reference: activity.reference ?? "",
            instructions: activity.instructions,
            trucker_instructions: activity.truckerInstructions,
            is_booking_needed: activity.isBookingNeeded,
            locked_requested_times: activity.lockedRequestedTimes ?? false,
            requested_range: activity.slots.length ? activity.slots[0] : null,
            supports_exchanges: supportExchangesForActivity,
        };
    });
}

function getNewAddressData(address?: TransportFormActivity["address"]) {
    if (address == null || address.pk != null) {
        return undefined;
    }

    return {
        ...(address as ExtractedNewAddress),
        latitude: undefined,
        longitude: undefined,
        coordinates:
            address?.latitude && address?.longitude
                ? {
                      latitude: address.latitude,
                      longitude: address.longitude,
                  }
                : null,
    };
}

export function getDeliveryContacts(
    loading: TransportFormActivity,
    unloading: TransportFormActivity,
    carrier: CarrierAndContacts | null,
    shipper: ShipperAndContacts,
    recipientsOrderEnabled: boolean,
    authorContact: Contact | null,
    isTemplate: boolean,
    deliveryIndex: number
) {
    const contacts = [carrier?.contact];

    if (!isTemplate && authorContact) {
        contacts.push(authorContact);
    }

    if (recipientsOrderEnabled) {
        contacts.push(
            ...(loading.contacts ?? []),
            ...(unloading.contacts ?? []),
            ...(shipper.contacts ?? []),
            ...(carrier?.contacts ?? [])
        );
    } else {
        contacts.push(...[loading.contact, unloading.contact]);
        contacts.push(shipper.contact);
    }

    return uniqBy(
        // We only add carrier and shipper contacts on the first delivery
        (deliveryIndex !== 0
            ? contacts.slice(0, 2).filter(Boolean)
            : contacts.filter(Boolean)) as Contact[],
        (contact) => contact.uid
    ).map((contact) => {
        if (contact?.company?.pk) {
            contact.company = contact.company.pk as any;
        }
        return {contact: contact};
    });
}

export function getLoadDataFromForm(
    values: FormLoad,
    context: TransportFormContextData,
    company: Company | null
): LoadPost {
    const isDisplayed = getLoadDisplaySettings(values, context, company);

    let complementary_information = [
        values.complementary_information,
        isDisplayed.plannedReturnablePalletsSection && values.plannedReturnablePallets
            ? `Palettes consignées: ${values.plannedReturnablePallets}`
            : undefined,
    ]
        .filter(Boolean)
        .join(" ");

    let payload = {
        category: values.category === "other" ? values.otherCategory : values.category,
        description: values.category !== "rental" ? values.description : "",
        quantity: isDisplayed.quantitySection && values.quantity ? values.quantity : null,
        idtf_number: isDisplayed.bulkQualimatSection ? values.idtf_number : "",
        weight: values.weight,
        volume: values.volume,
        volume_display_unit: context.volumeDisplayUnit,
        steres: isDisplayed.roundWoodSection ? values.steres : null,
        linear_meters: isDisplayed.linearMetersSection ? values.linear_meters : null,
        complementary_information: complementary_information,
        use_container_seal_number: Boolean(values.sealNumberChecked),
        container_seal_number: values.sealNumberChecked ? values.container_seal_number : "",
        is_dangerous: Boolean(isDisplayed.dangerousCheckbox ? values.is_dangerous : false),
        adr_un_code: isDisplayed.dangerousSection && values.adrUnCode ? values.adrUnCode.code : "",
        adr_un_description_by_language:
            isDisplayed.dangerousSection && values.adrUnCode
                ? values.adrUnDescriptionByLanguage
                : {},
        legal_mentions:
            isDisplayed.dangerousSection && values.legal_mentions ? values.legal_mentions : "",
        refrigerated: Boolean(values.refrigerated),
        temperature: isDisplayed.refrigeratedSection ? values.temperature : "",
        use_container_number: Boolean(
            isDisplayed.containerSection && values.containerNumberChecked
        ),
        container_number:
            isDisplayed.containerSection && values.containerNumberChecked
                ? values.container_number
                : "",
        tare_weight: isDisplayed.containerSection ? values.tare_weight : null,
        use_identifiers: values.use_identifiers,
        identifiers: values.identifiers,
    };

    return payload;
}

function getCarrierPartner(
    currentCompany: Company | null,
    means: TransportFormMeans | undefined,
    isCarrier: boolean
) {
    let result = means?.carrier?.carrier ?? null;
    if (!result) {
        const defaultCarrier = currentCompany
            ? partnerService.fromCompanyToCarrierInTransport(currentCompany)
            : null;
        result = isCarrier ? defaultCarrier : null;
    }

    return result;
}

function getCarrierAddress(
    currentCompany: Company | null,
    means: TransportFormMeans | undefined,
    isCarrier: boolean
) {
    const primaryAddress = currentCompany
        ? ({
              ...currentCompany.primary_address,
              company: pick(currentCompany, ["name", "pk", "is_verified", "settings"]) as Company,
          } as Address)
        : null;
    let carrierAddress = means?.carrier?.address ?? null;
    if (!carrierAddress) {
        carrierAddress = isCarrier ? primaryAddress : null;
    }

    return carrierAddress;
}

function getPricingFields(
    formPrice: TransportFormValues["price"],
    isCarrier: boolean,
    transport: TransportWithCarrierPk,
    currentCompany: Company | null,
    companiesFromConnectedGroupView: number[]
): Pick<TransportPost, "customer_to_invoice_id" | "quotation" | "purchase_costs"> {
    const quotationPayload = formPrice?.quotation
        ? computePricingBeforeSubmit(formPrice?.quotation, isCarrier, true, true)
        : null;
    const canEditCustomerToInvoice = transportRightService.canCreateCustomerToInvoice(
        transport,
        currentCompany?.pk,
        companiesFromConnectedGroupView
    );

    let customerToInvoice = null;
    if (formPrice && canEditCustomerToInvoice) {
        // It could have been made non-invoiceable after it was selected. This can happen when
        // duplicating a transport or editing a template, where the form is fed an existing
        // customer to invoice selection which isn't valid anymore.
        const customerToInvoiceIsStillInvoiceable =
            !!formPrice.customerToInvoice?.invoicing_address;
        customerToInvoice =
            formPrice.customerToInvoice?.pk && customerToInvoiceIsStillInvoiceable
                ? {pk: formPrice.customerToInvoice.pk}
                : null;
    }

    const canEditPurchaseCosts = canUpsertPurchaseCost(transport, companiesFromConnectedGroupView);
    const purchaseCostsPayload = canEditPurchaseCosts
        ? {
              lines: formPrice?.purchaseCosts?.lines ?? [],
          }
        : null;

    return {
        customer_to_invoice_id: customerToInvoice ? customerToInvoice.pk : null,
        quotation: quotationPayload,
        purchase_costs: purchaseCostsPayload,
    };
}

export async function getSharedTransportPayloadFields(
    values: TransportFormValues,
    context: TransportFormContextData,
    company: Company | null,
    isCarrier: boolean,
    companiesFromConnectedGroupView: number[]
): Promise<
    Omit<
        TransportPostWithPartnerPk,
        "deliveries" | "activities" | "trips" | "trucker_id" | "vehicle_id" | "trailer_id"
    >
> {
    const carrier = getCarrierPartner(company, values.means, isCarrier);
    const carrierPk = carrier?.pk ?? null;
    const transport: TransportWithCarrierPk = {
        carrier: carrierPk ? {pk: carrierPk} : null,
    };
    const pricingFields = getPricingFields(
        values.price,
        isCarrier,
        transport,
        company,
        companiesFromConnectedGroupView
    );
    const shipperPk = values.shipper.shipper?.pk ?? NO_COMPANY_VALUE;
    return {
        carrier_id: carrierPk,
        carrier_reference: values.means?.carrier?.reference ?? "",
        shipper_id: shipperPk,
        shipper_reference: values.shipper?.reference ?? "",
        instructions: values.instructions,
        requested_vehicle_uid: values.means?.requestedVehicle?.uid ?? null,
        volume_display_unit: values.settings.volumeDisplayUnit,
        business_privacy: values.settings.businessPrivacy,
        transport_operation_category_uid:
            isCarrier && values.settings.transportOperationCategory
                ? values.settings.transportOperationCategory.uid
                : null,
        is_multiple_compartments: context.isMultipleCompartments,
        requires_washing: context.requiresWashing,
        is_multiple_rounds: context.isMultipleRounds,
        send_to_carrier: isCarrier || (values.means?.sendToCarrier ?? false),
        ...pricingFields,
    };
}

/**
 * @deprecated to remove with betterCompanyRoles
 */
export async function getSharedTransportPayloadFieldsDeprecated(
    values: TransportFormValues,
    context: TransportFormContextData,
    company: Company | null,
    isCarrier: boolean,
    companiesFromConnectedGroupView: number[]
): Promise<
    Omit<
        TransportPostDeprecated,
        "deliveries" | "activities" | "trips" | "trucker_id" | "vehicle_id" | "trailer_id"
    >
> {
    const carrierAddress = getCarrierAddress(company, values.means, isCarrier);
    const carrierPk = carrierAddress?.company.pk ?? null;
    const transport: TransportWithCarrierPk = {
        carrier: carrierPk ? {pk: carrierPk} : null,
    };
    const pricingFields = getPricingFields(
        values.price,
        isCarrier,
        transport,
        company,
        companiesFromConnectedGroupView
    );

    return {
        carrier_address_id: carrierAddress ? carrierAddress.pk : null,
        carrier_reference: values.means?.carrier?.reference ?? "",
        shipper_address_id: values.shipper.address?.pk ?? NO_COMPANY_VALUE,
        shipper_reference: values.shipper.reference ?? "",
        instructions: values.instructions,
        requested_vehicle_uid: values.means?.requestedVehicle?.uid ?? null,
        volume_display_unit: values.settings.volumeDisplayUnit,
        business_privacy: values.settings.businessPrivacy,
        transport_operation_category_uid:
            isCarrier && values.settings.transportOperationCategory
                ? values.settings.transportOperationCategory.uid
                : null,
        is_multiple_compartments: context.isMultipleCompartments,
        requires_washing: context.requiresWashing,
        is_multiple_rounds: context.isMultipleRounds,
        send_to_carrier: isCarrier || (values.means?.sendToCarrier ?? false),
        ...pricingFields,
    };
}

export async function getAuthorContacts() {
    let authorContact: Contact | null = null;
    try {
        authorContact = (await apiService.get("/contacts/me/")) as Contact;
    } catch (error) {
        Logger.warn(error);
    }

    return authorContact;
}

export async function getResourcePk(
    resource: Trailer | Vehicle,
    resourceType: "trailer" | "vehicle"
) {
    // If it's a copy, return the original pk
    if (resource.original) {
        return resource.original;
    }

    if (resource.pk) {
        // when value is -1 it indicates that no resource is selected
        return resource.pk === -1 ? null : resource.pk;
    }

    // It's a new resource, create it and return its pk
    try {
        const path = resourceType === "trailer" ? "/trailers/" : "/vehicles/";
        const response = await apiService.post(path, resource, {apiVersion: "v4"});
        return response.pk;
    } catch (error) {
        Logger.error(error);
        throw new Error("An error occurred while creating the vehicle/trailer");
    }
}

export async function getPostMeans(
    formMeans: TransportFormMeans | null,
    formContext: TransportFormContextData
) {
    return {
        trucker_id: formMeans?.trucker?.pk ?? null,
        vehicle_id: formMeans?.vehicle ? await getResourcePk(formMeans.vehicle, "vehicle") : null,
        trailer_id: formMeans?.trailer ? await getResourcePk(formMeans.trailer, "trailer") : null,
        send_to_trucker:
            !!formMeans?.sendToTrucker &&
            !!formMeans?.trucker &&
            !formContext.isOrder &&
            !formContext.isTemplate,
    };
}
