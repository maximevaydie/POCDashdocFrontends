import {
    ConfirmationExtractedData,
    getItemAsAList,
    OriginalAddress,
    ExtractedNewAddress,
    zoneDateToISO,
    parseAndZoneDate,
    formatDate,
} from "dashdoc-utils";
import isNil from "lodash.isnil";

import {
    TransportFormActivity,
    type TransportFormValues,
    type ShipperAndContacts,
} from "app/features/transport/transport-form/transport-form.types";

function _getActivitiesCount(activities: TransportFormActivity[]) {
    // When there is only one activity of a type (loading or unloading),
    // it can be the fictive activity created at form initilization (or not).
    // Here we only want the count of activities entered by the user.
    return activities.length != 1 ? activities.length : isNil(activities[0].address) ? 0 : 1;
}

function _getActivityGlobalIndex(
    editingIndex: number | "new" | null,
    field: "loadings" | "unloadings",
    loadings: TransportFormActivity[],
    unloadings: TransportFormActivity[]
) {
    if (editingIndex === null) {
        return null;
    } else if (editingIndex === "new") {
        return field === "loadings"
            ? _getActivitiesCount(loadings)
            : _getActivitiesCount(loadings) + _getActivitiesCount(unloadings);
    } else {
        return field === "loadings" ? editingIndex : _getActivitiesCount(loadings) + editingIndex;
    }
}

function selectActivityConfirmationExtractedSlot(
    confirmationExtractedSlots: string[][],
    editingIndex: number | "new" | null,
    field: "loadings" | "unloadings",
    loadings: TransportFormActivity[],
    unloadings: TransportFormActivity[]
) {
    if (confirmationExtractedSlots.length === 0) {
        return undefined;
    }

    const activityGlobalIndex = _getActivityGlobalIndex(editingIndex, field, loadings, unloadings);
    if (activityGlobalIndex === null) {
        return undefined;
    }

    return activityGlobalIndex < confirmationExtractedSlots.length
        ? confirmationExtractedSlots[activityGlobalIndex]
        : confirmationExtractedSlots[confirmationExtractedSlots.length - 1];
}

function _getConfirmationExtractedDataCounts(
    confirmationExtractedData: ConfirmationExtractedData
) {
    return {
        "extracted shipper addresses count": confirmationExtractedData.shipper_addresses.length,
        "extracted loading addresses count": confirmationExtractedData.loading_addresses.length,
        "extracted loading new addresses count":
            confirmationExtractedData.loading_addresses.filter(
                (address) => !("created_by" in address)
            ).length,
        "extracted unloading addresses count":
            confirmationExtractedData.unloading_addresses.length,
        "extracted unloading new addresses count":
            confirmationExtractedData.unloading_addresses.filter(
                (address) => !("created_by" in address)
            ).length,
        "extracted codes count": confirmationExtractedData.codes.length,
        "extracted slots count": confirmationExtractedData.slots.length,
    };
}

function _getActualActivities(activities: TransportFormActivity[]) {
    return activities.filter(({address}) => address);
}

function _getActivitiesReferences(activities: TransportFormActivity[]) {
    return activities.reduce((acc, {reference}) => {
        return acc.concat(getItemAsAList(reference));
    }, [] as string[]);
}

function _getActivitiesSlotsCount(activities: TransportFormActivity[]) {
    return activities.filter(({slots}) => slots.length).length;
}

function _getTransportDataCounts(
    actualLoadings: TransportFormActivity[],
    actualUnloadings: TransportFormActivity[],
    actualLoadingsAndUnloadings: TransportFormActivity[],
    shipperReferences: string[],
    loadingsAndUnloadingsReferences: string[],
    carrierReferences: string[]
) {
    const shipperReferencesCount = shipperReferences.length;
    const loadingsAndUnloadingsReferencesCount = loadingsAndUnloadingsReferences.length;
    const carrierReferencesCount = carrierReferences.length;

    return {
        "transport loading addresses count": actualLoadings.length,
        "transport unloading addresses count": actualUnloadings.length,
        "transport shipper references count": shipperReferencesCount,
        "transport activities reference count": loadingsAndUnloadingsReferencesCount,
        "transport carrier references count": carrierReferencesCount,
        "transport references count":
            shipperReferencesCount + loadingsAndUnloadingsReferencesCount + carrierReferencesCount,
        "transport slots count": _getActivitiesSlotsCount(actualLoadingsAndUnloadings),
    };
}

function _isOneExtractedShipperAddressUsed(
    extractedShipperAddresses: OriginalAddress[],
    transportShipperContacts: ShipperAndContacts,
    hasBetterCompanyRolesEnabled: boolean
) {
    if (hasBetterCompanyRolesEnabled) {
        return (
            transportShipperContacts.shipper &&
            extractedShipperAddresses
                .map(({pk}) => pk)
                .includes(transportShipperContacts.shipper.administrative_address.pk)
        );
    }
    return (
        transportShipperContacts.address?.pk &&
        extractedShipperAddresses.map(({pk}) => pk).includes(transportShipperContacts.address.pk)
    );
}

function _getExtractedActivityAddressesUsed(
    extractedAddresses: (OriginalAddress | ExtractedNewAddress)[],
    activities: TransportFormActivity[]
) {
    return extractedAddresses.filter((extractedAddress) =>
        "created_by" in extractedAddress
            ? activities
                  .map(({address}) => (address && "created_by" in address ? address.pk : null))
                  .includes(extractedAddress.pk)
            : activities
                  .map(({address}) =>
                      address && !("created_by" in address) ? address.name : null
                  )
                  .includes(extractedAddress.name)
    );
}

function _getExtractedCodesUsedCount(extractedCodes: string[], allReferences: string[]) {
    return extractedCodes.filter((code) => allReferences.includes(code)).length;
}

function _getExtractedDatesElementsUsedCount(
    extractedDatesElements: (string | undefined)[],
    activitiesDatesElements: (string | undefined)[]
) {
    let extractedDatesElementsUsedCount = extractedDatesElements.filter((extractedDate, index) =>
        index > activitiesDatesElements.length
            ? false
            : extractedDate === activitiesDatesElements[index]
    ).length;

    if (
        extractedDatesElements.length < activitiesDatesElements.length &&
        extractedDatesElements[extractedDatesElements.length - 1] !==
            activitiesDatesElements[extractedDatesElements.length - 1] &&
        activitiesDatesElements
            .slice(extractedDatesElements.length)
            .includes(extractedDatesElements[extractedDatesElements.length - 1])
    ) {
        extractedDatesElementsUsedCount += 1;
    }
    return extractedDatesElementsUsedCount;
}

function _getExtractedDatesUsedCount(
    extractedSlots: string[][],
    actualLoadingsAndUnloadings: TransportFormActivity[]
) {
    const extractedDates = extractedSlots.map(
        (slot) => zoneDateToISO(slot[0], "utc")?.split("T")[0]
    );
    const activitiesDates = actualLoadingsAndUnloadings.map(
        ({slots}) => zoneDateToISO(slots[0]?.start, "utc")?.split("T")[0]
    );
    return _getExtractedDatesElementsUsedCount(extractedDates, activitiesDates);
}

function _isDefaultTime(slot: string[], timezone: string) {
    const slotStartZonedDate = parseAndZoneDate(slot[0], timezone);
    const slotEndZonedDate = parseAndZoneDate(slot[1], timezone);

    const extractedTimeMin = formatDate(slotStartZonedDate, "HH:mm");
    const extractedTimeMax = formatDate(slotEndZonedDate, "HH:mm");
    return extractedTimeMin === "00:00" && extractedTimeMax === "00:00";
}

function _getExtractedStartTimesUsedCount(
    extractedSlots: string[][],
    actualLoadingsAndUnloadings: TransportFormActivity[],
    timezone: string
) {
    const extractedStartTimes = extractedSlots.map((slot) =>
        _isDefaultTime(slot, timezone)
            ? "default_time"
            : zoneDateToISO(slot[0], "utc")?.split("T")[1]
    );
    const activitiesStartTimes = actualLoadingsAndUnloadings.map(
        ({slots}) => zoneDateToISO(slots[0]?.start, "utc")?.split("T")[1]
    );
    return _getExtractedDatesElementsUsedCount(extractedStartTimes, activitiesStartTimes);
}

function _getExtractedEndTimesUsedCount(
    extractedSlots: string[][],
    actualLoadingsAndUnloadings: TransportFormActivity[],
    timezone: string
) {
    const extractedEndTimes = extractedSlots.map((slot) =>
        _isDefaultTime(slot, timezone)
            ? "default_time"
            : zoneDateToISO(slot[1], "utc")?.split("T")[1]
    );
    const activitiesEndTimes = actualLoadingsAndUnloadings.map(
        ({slots}) => zoneDateToISO(slots[0]?.end, "utc")?.split("T")[1]
    );

    return _getExtractedDatesElementsUsedCount(extractedEndTimes, activitiesEndTimes);
}

function _getConfirmationExtractedDataUsedCounts(
    confirmationExtractedData: ConfirmationExtractedData,
    transportShipperContacts: ShipperAndContacts,
    actualLoadings: TransportFormActivity[],
    actualUnloadings: TransportFormActivity[],
    actualLoadingsAndUnloadings: TransportFormActivity[],
    allReferences: string[],
    timezone: string,
    hasBetterCompanyRolesEnabled: boolean
) {
    const extractedLoadingAddressesUsed = _getExtractedActivityAddressesUsed(
        confirmationExtractedData.loading_addresses,
        actualLoadings
    );

    const extractedLoadingNewAddressesUsed = extractedLoadingAddressesUsed.filter(
        (address) => !("created_by" in address)
    );

    const extractedUnloadingAddressesUsed = _getExtractedActivityAddressesUsed(
        confirmationExtractedData.unloading_addresses,
        actualUnloadings
    );

    const extractedUnloadingNewAddressesUsed = extractedUnloadingAddressesUsed.filter(
        (address) => !("created_by" in address)
    );

    return {
        "is one extracted shipper address used": _isOneExtractedShipperAddressUsed(
            confirmationExtractedData.shipper_addresses,
            transportShipperContacts,
            hasBetterCompanyRolesEnabled
        ),
        "extracted loading addresses used count": extractedLoadingAddressesUsed.length,
        "extracted loading new addresses used count": extractedLoadingNewAddressesUsed.length,
        "extracted unloading addresses used count": extractedUnloadingAddressesUsed.length,
        "extracted unloading new addresses used count": extractedUnloadingNewAddressesUsed.length,
        "extracted codes used count": _getExtractedCodesUsedCount(
            confirmationExtractedData.codes,
            allReferences
        ),
        "extracted dates used count": _getExtractedDatesUsedCount(
            confirmationExtractedData.slots,
            actualLoadingsAndUnloadings
        ),
        "extracted start times used count": _getExtractedStartTimesUsedCount(
            confirmationExtractedData.slots,
            actualLoadingsAndUnloadings,
            timezone
        ),
        "extracted end times used count": _getExtractedEndTimesUsedCount(
            confirmationExtractedData.slots,
            actualLoadingsAndUnloadings,
            timezone
        ),
    };
}

function getTransportCreatedFromPdfAnalyticsEventData(
    confirmationExtractedData: ConfirmationExtractedData,
    values: TransportFormValues,
    timezone: string,
    hasBetterCompanyRolesEnabled: boolean
) {
    if (hasBetterCompanyRolesEnabled) {
        const actualLoadings = _getActualActivities(values.loadings);
        const actualUnloadings = _getActualActivities(values.unloadings);
        const actualLoadingsAndUnloadings = actualLoadings.concat(actualUnloadings);
        const shipperReferences = getItemAsAList(values.shipper?.reference);
        const loadingsAndUnloadingsReferences = _getActivitiesReferences(
            actualLoadingsAndUnloadings
        );
        const carrierReferences = getItemAsAList(values["means"]?.carrier?.reference);

        return {
            ..._getConfirmationExtractedDataCounts(confirmationExtractedData),
            ..._getTransportDataCounts(
                actualLoadings,
                actualUnloadings,
                actualLoadingsAndUnloadings,
                shipperReferences,
                loadingsAndUnloadingsReferences,
                carrierReferences
            ),
            ..._getConfirmationExtractedDataUsedCounts(
                confirmationExtractedData,
                values.shipper,
                actualLoadings,
                actualUnloadings,
                actualLoadingsAndUnloadings,
                shipperReferences.concat(loadingsAndUnloadingsReferences, carrierReferences),
                timezone,
                hasBetterCompanyRolesEnabled
            ),
        };
    }

    const actualLoadings = _getActualActivities(values.loadings);
    const actualUnloadings = _getActualActivities(values.unloadings);
    const actualLoadingsAndUnloadings = actualLoadings.concat(actualUnloadings);
    const shipperReferences = getItemAsAList(values.shipper.reference);
    const loadingsAndUnloadingsReferences = _getActivitiesReferences(actualLoadingsAndUnloadings);
    const carrierReferences = getItemAsAList(values.means?.carrier?.reference);

    return {
        ..._getConfirmationExtractedDataCounts(confirmationExtractedData),
        ..._getTransportDataCounts(
            actualLoadings,
            actualUnloadings,
            actualLoadingsAndUnloadings,
            shipperReferences,
            loadingsAndUnloadingsReferences,
            carrierReferences
        ),
        ..._getConfirmationExtractedDataUsedCounts(
            confirmationExtractedData,
            values.shipper,
            actualLoadings,
            actualUnloadings,
            actualLoadingsAndUnloadings,
            shipperReferences.concat(loadingsAndUnloadingsReferences, carrierReferences),
            timezone,
            hasBetterCompanyRolesEnabled
        ),
    };
}

export const confirmationExtractedDataService = {
    selectActivityConfirmationExtractedSlot,
    getTransportCreatedFromPdfAnalyticsEventData,
};
