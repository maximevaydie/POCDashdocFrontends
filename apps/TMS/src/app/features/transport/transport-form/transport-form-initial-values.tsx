import {generateUid} from "@dashdoc/core";
import {
    getConnectedCompany,
    useFeatureFlag,
    type CarrierInTransport,
    type ShipperInTransport,
} from "@dashdoc/web-common";
import {
    Address,
    Company,
    Settings,
    InvoiceableCompany,
    formatDate,
    parseAndZoneDate,
    zoneDateToISO,
    ConfirmationExtractedData,
    type ExtractedNewAddress,
    type SlimCompany,
} from "dashdoc-utils";
import {set} from "date-fns";
import pick from "lodash.pick";
import {useEffect, useMemo, useState} from "react";

import {partnerService} from "app/features/address-book/partner.service";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {useSendToTrucker} from "app/features/transport/hooks/useSendToTrucker";
import {useSelector} from "app/redux/hooks";
import {getInitialPricingForm} from "app/services/invoicing";
import {searchInvoiceableCustomers} from "app/taxation/invoicing/services/customerToInvoice";

import {
    TransportFormActivity,
    TransportFormContextData,
    TransportFormPrice,
    TransportFormSupportExchange,
    type CarrierAndContacts,
    type TransportFormMeans,
} from "./transport-form.types";

export const getInitialActivityData = (
    managerPk: string,
    activityType: TransportFormActivity["type"]
): TransportFormActivity => {
    return {
        uid: generateUid(managerPk),
        type: activityType,
        // @ts-ignore
        address: null,
        // @ts-ignore
        contact: null,
        reference: "",
        truckerInstructions: "",
        instructions: "",
        etaTracking: false,
        isBookingNeeded: false,
        lockedRequestedTimes: false,
        slots: [],
        // helper value
        hasSetAskedTimes: {
            hasSetAskedMinTime: false,
            hasSetAskedMaxTime: false,
        },
    };
};

export const useInitialMeansData = (isOrder: boolean): TransportFormMeans => {
    const hasBetterCompanyRoles = useFeatureFlag("betterCompanyRoles");
    const connectedCompany = useSelector(getConnectedCompany);
    const primaryAddress: Address | undefined = useMemo(() => {
        if (!connectedCompany?.primary_address) {
            return undefined;
        }
        return {
            ...connectedCompany.primary_address,
            company: pick(connectedCompany, ["name", "pk", "is_verified", "settings"]) as Company,
        };
    }, [connectedCompany]);
    const {sendToCarrier} = useSendToCarrier();
    const {sendToTrucker} = useSendToTrucker();
    const defaultRole = connectedCompany?.settings?.default_role;
    let carrier: CarrierAndContacts | undefined;
    if (hasBetterCompanyRoles) {
        const connectedPartner = connectedCompany
            ? partnerService.fromCompanyToCarrierInTransport(connectedCompany)
            : null;
        if (connectedPartner) {
            const defaultCarrier = getDefaultCarrier(isOrder, connectedPartner, defaultRole);
            if (defaultCarrier) {
                carrier = {
                    carrier: defaultCarrier,
                    contact: undefined,
                    contacts: [],
                    reference: "",
                };
            }
        }
    } else {
        const defaultCarrierAddress = getDefaultAddress(
            "carrier",
            isOrder,
            primaryAddress,
            defaultRole
        );
        if (defaultCarrierAddress) {
            carrier = {
                address: defaultCarrierAddress,
                contact: undefined,
                contacts: [],
                reference: "",
            };
        }
    }
    return {
        carrier,
        requestedVehicle: null,
        sendToTrucker,
        sendToCarrier,
    };
};

export function useInitialPriceData(
    canEditCustomerToInvoice: boolean,
    shipper?: SlimCompany
): TransportFormPrice {
    let invoicingData: Partial<TransportFormPrice> = {};

    const [invoiceableCustomers, setInvoiceableCustomers] = useState<InvoiceableCompany[]>();

    useEffect(() => {
        if (shipper && canEditCustomerToInvoice) {
            searchInvoiceableCustomers({search: shipper.name, page: 1}).then(({results}) =>
                setInvoiceableCustomers(results)
            );
        }
    }, [shipper, canEditCustomerToInvoice]);

    if (shipper?.pk && invoiceableCustomers && canEditCustomerToInvoice) {
        invoicingData.customerToInvoice =
            invoiceableCustomers.find((company) => company.pk === shipper.pk) ?? null;
    } else {
        invoicingData.customerToInvoice = null;
    }

    return {
        ...invoicingData,
        quotation: getInitialPricingForm(null, undefined),
        purchaseCosts: {
            lines: [],
        },
    };
}

export const getSupportExchangeInitialValues = (
    activities: Partial<TransportFormActivity>[]
): TransportFormSupportExchange => {
    return {
        // @ts-ignore
        activity: activities.length === 1 ? activities[0] : null,
        // @ts-ignore
        type: null,
        expectedDelivered: 0,
        expectedRetrieved: 0,
    };
};

export const getDefaultAddress = (
    category: "shipper" | "carrier",
    isOrder: boolean,
    primaryAddress: Address | undefined,
    defaultRole: Settings["default_role"]
) => {
    if (category === "shipper" && isOrder) {
        return primaryAddress;
    } else if (category === "carrier" && isOrder) {
        return undefined;
    }
    return defaultRole === category ? primaryAddress : undefined;
};

export function getDefaultShipper(
    isOrder: boolean,
    shipper: ShipperInTransport,
    defaultRole: Settings["default_role"]
) {
    if (isOrder) {
        return shipper;
    }
    return defaultRole === "shipper" ? shipper : undefined;
}

export function getDefaultCarrier(
    isOrder: boolean,
    carrier: CarrierInTransport,
    defaultRole: Settings["default_role"]
) {
    if (isOrder) {
        return undefined;
    }
    return defaultRole === "carrier" ? carrier : undefined;
}

export const getInitialFormContext = (
    isOrder: boolean,
    isCreatingTemplate: boolean,
    isDuplicating: boolean,
    groupSimilarActivities = false,
    setGroupSimilarActivities: (value: boolean) => void = () => {}
): TransportFormContextData => {
    return {
        isMultipleCompartments: false,
        isVehicleUsedForQualimat: false,
        isTrailerUsedForQualimat: false,
        businessPrivacyEnabled: false,
        isOrder: isOrder,
        isTemplate: isCreatingTemplate,
        loadsCount: 0,
        volumeDisplayUnit: "m3",
        isMultipleRounds: false,
        transportShape: "simple",
        requiresWashing: false,
        isRental: false,
        loadsSmartSuggestionsMap: new Map(),
        isComplexMode: false,
        transportOperationCategory: undefined,
        groupSimilarActivities: groupSimilarActivities,
        setGroupSimilarActivities: setGroupSimilarActivities,
        isDuplicating,
    };
};

export const getConfirmationExtractedActivities = (
    confirmationExtractedData: ConfirmationExtractedData,
    type: TransportFormActivity["type"],
    defaultActivity: TransportFormActivity,
    managerPk: number | null,
    initialIndex: number,
    timezone: string
): TransportFormActivity[] => {
    const addresses =
        confirmationExtractedData[
            type === "loading" ? "loading_addresses" : "unloading_addresses"
        ];

    return addresses.map((address, index) => {
        const activityConfirmationExtractedSlot =
            confirmationExtractedData.slots[
                Math.min(initialIndex + index, confirmationExtractedData.slots.length - 1)
            ];
        //TODO: OriginalAddress is not compatible with Address
        const transportAddress = address as (Address | ExtractedNewAddress) & {
            pk?: number | undefined;
        };
        const transport: TransportFormActivity = {
            ...defaultActivity,
            uid: generateUid((managerPk ?? "").toString()),
            automaticallySetFromConfirmation: true,
            address: transportAddress,
            ...getConfirmationExtractedActivitySlot(activityConfirmationExtractedSlot, timezone),
        };
        return transport;
    });
};

const defaultConfirmationExtractedActivitySlots = {
    slots: [],
    hasSetAskedTimes: {
        hasSetAskedMinTime: false,
        hasSetAskedMaxTime: false,
    },
};

const getConfirmationExtractedActivitySlot = (
    activityConfirmationExtractedSlot: undefined | string[],
    timezone: string
) => {
    if (activityConfirmationExtractedSlot === undefined) {
        return defaultConfirmationExtractedActivitySlots;
    }

    let slotStartZonedDate = parseAndZoneDate(activityConfirmationExtractedSlot[0], timezone);
    let slotEndZonedDate = parseAndZoneDate(activityConfirmationExtractedSlot[1], timezone);
    if (slotStartZonedDate === null || slotEndZonedDate === null) {
        return defaultConfirmationExtractedActivitySlots;
    }

    let hasSetAskedTimes = true;
    let extractedTimeMin = formatDate(slotStartZonedDate, "HH:mm");
    let extractedTimeMax = formatDate(slotEndZonedDate, "HH:mm");
    if (extractedTimeMin === "00:00" && extractedTimeMax === "00:00") {
        // in that case we assume that we did not extract any time
        // and that this is the default time set during extraction
        // so here we set the default time for creation form
        // and specify that time is not really set
        slotStartZonedDate = set(slotStartZonedDate, {
            hours: 0,
            minutes: 0,
        });
        slotEndZonedDate = set(slotEndZonedDate, {
            hours: 23,
            minutes: 59,
        });
        hasSetAskedTimes = false;
    }
    const slotStartString = zoneDateToISO(slotStartZonedDate, timezone);
    const slotEndString = zoneDateToISO(slotEndZonedDate, timezone);
    if (slotStartString === null || slotEndString == null) {
        return defaultConfirmationExtractedActivitySlots;
    }

    return {
        slots: [
            {
                start: slotStartString,
                end: slotEndString,
            },
        ],
        hasSetAskedTimes: {
            hasSetAskedMinTime: hasSetAskedTimes,
            hasSetAskedMaxTime: hasSetAskedTimes,
        },
    };
};
