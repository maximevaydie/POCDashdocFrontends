import {apiService} from "@dashdoc/web-common";
import {SuggestedAddress} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Suggestion} from "@dashdoc/web-ui";
import {ActivityType, Address} from "dashdoc-utils";
import {useCallback, useState} from "react";

import {
    LoadSmartSuggestion,
    TransportFormActivity,
    TransportFormDeliveryOption,
} from "./transport-form.types";

export const useSmartSuggestAddresses = () => {
    const [automaticOriginAddresses, setAutomaticOriginAddresses] = useState<SuggestedAddress[]>(
        []
    );
    const [automaticDestinationAddresses, setAutomaticDestinationAddresses] = useState<
        SuggestedAddress[]
    >([]);

    const fillSuggestedAddresses = useCallback(
        async (_field: string, addressPk: number | undefined, addressName: string | undefined) => {
            if (_field === "shipper_address") {
                if (addressPk) {
                    try {
                        const newAutomaticOriginAddresses =
                            await apiService.Addresses.postLastAssociatedAddresses(addressPk, {
                                predictive_address_type: "shipper",
                                predicted_address_type: "origin",
                            });
                        setAutomaticOriginAddresses(
                            newAutomaticOriginAddresses.map((address: Address) => {
                                return {
                                    address,
                                    tooltipContent: t(
                                        "smartSuggests.addressTooltipContent.origin.predictedByShipper",
                                        {
                                            originAddress: address.company
                                                ? address.company.name
                                                : address.name,
                                            shipperAddress: addressName,
                                        }
                                    ),
                                };
                            })
                        );
                    } catch {
                        setAutomaticOriginAddresses([]);
                    }
                } else {
                    setAutomaticOriginAddresses([]);
                }
            } else if (_field === "origin_address") {
                if (addressPk) {
                    try {
                        const newAutomaticDestinationAddresses =
                            await apiService.Addresses.postLastAssociatedAddresses(addressPk, {
                                predictive_address_type: "origin",
                                predicted_address_type: "destination",
                            });

                        setAutomaticDestinationAddresses(
                            newAutomaticDestinationAddresses.map((address: Address) => {
                                return {
                                    address,
                                    tooltipContent: t(
                                        "smartSuggests.addressTooltipContent.destination.predictedByOrigin",
                                        {
                                            destinationAddress: address.company
                                                ? address.company.name
                                                : address.name,
                                            originAddress: addressName,
                                        }
                                    ),
                                };
                            })
                        );
                    } catch {
                        setAutomaticDestinationAddresses([]);
                    }
                } else {
                    setAutomaticDestinationAddresses([]);
                }
            } else if (_field === "destination_address") {
                if (addressPk) {
                    try {
                        const newAutomaticOriginAddresses =
                            await apiService.Addresses.postLastAssociatedAddresses(addressPk, {
                                predictive_address_type: "destination",
                                predicted_address_type: "origin",
                            });
                        setAutomaticOriginAddresses(
                            newAutomaticOriginAddresses.map((address: Address) => {
                                return {
                                    address,
                                    tooltipContent: t(
                                        "smartSuggests.addressTooltipContent.origin.predictedByDestination",
                                        {
                                            originAddress: address.company
                                                ? address.company.name
                                                : address.name,
                                            destinationAddress: addressName,
                                        }
                                    ),
                                };
                            })
                        );
                    } catch {
                        setAutomaticOriginAddresses([]);
                    }
                } else {
                    setAutomaticOriginAddresses([]);
                }
            }
        },
        []
    );

    const fillSuggestedOriginAddressesFromShipper = useCallback(
        async (shipperPk: number | undefined, shipperName: string | undefined) => {
            if (shipperPk) {
                try {
                    const newAutomaticOriginAddresses = await apiService.get(
                        `/partners/${shipperPk}/last-associated-origin-addresses/`,
                        {apiVersion: "web"}
                    );

                    setAutomaticOriginAddresses(
                        newAutomaticOriginAddresses.map((address: Address) => {
                            return {
                                address,
                                tooltipContent: t(
                                    "smartSuggests.addressTooltipContent.origin.predictedByShipper",
                                    {
                                        originAddress: address.company
                                            ? address.company.name
                                            : address.name,
                                        shipperAddress: shipperName,
                                    }
                                ),
                            };
                        })
                    );
                } catch {
                    setAutomaticOriginAddresses([]);
                }
            } else {
                setAutomaticOriginAddresses([]);
            }
        },
        []
    );
    return {
        automaticOriginAddresses,
        setAutomaticOriginAddresses,
        automaticDestinationAddresses,
        fillSuggestedAddresses,
        fillSuggestedOriginAddressesFromShipper,
    };
};

export async function getLoadSmartSuggestAtAddress(
    addressPk: number,
    activityType: Omit<ActivityType, "bulkingBreakStart" | "bulkingBreakEnd">
): Promise<LoadSmartSuggestion> {
    if (addressPk && ["loading", "unloading"].includes(activityType as string)) {
        if (addressPk) {
            const payload = {
                predictive_address_type:
                    activityType === "loading"
                        ? "origin"
                        : ("destination" as "origin" | "destination"),
            };

            let categoryResponse;
            try {
                categoryResponse = await apiService.Addresses.postLastAssociatedLoadCategory(
                    addressPk,
                    payload
                );
            } catch (error) {
                Logger.error(error);
            }
            const preferredLoadCategory =
                categoryResponse && categoryResponse["load_category"]
                    ? categoryResponse["load_category"]
                    : null;

            let descriptionsResponse: {load_descriptions: string[]} | null;
            try {
                descriptionsResponse =
                    await apiService.Addresses.postLastAssociatedLoadDescriptions(
                        addressPk,
                        payload
                    );
            } catch (error) {
                Logger.error(error);
            }
            const suggestedLoadDescriptions: string[] =
                // @ts-ignore
                descriptionsResponse && descriptionsResponse["load_descriptions"]
                    ? descriptionsResponse["load_descriptions"].filter(
                          (load_description: string) => {
                              return load_description !== "";
                          }
                      )
                    : [];

            return {
                category: preferredLoadCategory,
                descriptions: suggestedLoadDescriptions,
            };
        }
    }
    // @ts-ignore
    return null;
}

export function getSuggestedLoadDescriptionsOptions(
    delivery: TransportFormDeliveryOption,
    loadsSmartSuggestionsMap: Map<number, LoadSmartSuggestion>
): Suggestion<string>[] {
    const suggestedLoadDescriptions =
        // @ts-ignore
        loadsSmartSuggestionsMap.get(delivery?.loadingActivity?.address?.pk)?.descriptions ||
        // @ts-ignore
        loadsSmartSuggestionsMap.get(delivery?.unloadingActivity?.address?.pk)?.descriptions;

    // @ts-ignore
    const targetActivity = loadsSmartSuggestionsMap.get(delivery?.loadingActivity?.address?.pk)
        ? delivery?.loadingActivity
        : delivery?.unloadingActivity;

    const addressName =
        targetActivity?.address?.name ||
        (targetActivity?.address && "created_by" in targetActivity.address
            ? targetActivity.address.company?.name
            : undefined);
    // @ts-ignore
    return suggestedLoadDescriptions?.map((suggestion) => ({
        label: suggestion,
        value: suggestion,
        tooltipContent:
            targetActivity.type === "loading"
                ? t("smartSuggests.loadDescriptionTooltipContent.predictedByOrigin", {
                      loadDescription: suggestion,
                      originAddress: addressName,
                  })
                : t("smartSuggests.loadDescriptionTooltipContent.predictedByDestination", {
                      loadDescription: suggestion,
                      destinationAddress: addressName,
                  }),
    }));
}

export function getPreferredLoadCategory(
    delivery: TransportFormDeliveryOption,
    loadsSmartSuggestionsMap: Map<number, LoadSmartSuggestion>
): [string, string] {
    // @ts-ignore
    if (loadsSmartSuggestionsMap.get(delivery?.loadingActivity?.address?.pk)) {
        return [
            // @ts-ignore
            loadsSmartSuggestionsMap.get(delivery?.loadingActivity?.address?.pk).category,
            "loading",
        ];
    }
    // @ts-ignore
    if (loadsSmartSuggestionsMap.get(delivery?.unloadingActivity?.address?.pk)) {
        return [
            // @ts-ignore
            loadsSmartSuggestionsMap.get(delivery?.unloadingActivity?.address?.pk).category,
            "unloading",
        ];
    }
    // @ts-ignore
    return [null, null];
}

export async function updateLoadsSmartSuggestionsMap(
    activities: Partial<TransportFormActivity>[],
    loadsSmartSuggestionsMap: Map<number, LoadSmartSuggestion>
): Promise<Map<number, LoadSmartSuggestion>> {
    const updatedLoadsSmartSuggestionsMap = new Map(loadsSmartSuggestionsMap);
    for (const activity of activities) {
        if (
            activity.address &&
            "created_by" in activity.address &&
            activity.address.pk &&
            !loadsSmartSuggestionsMap.has(activity.address.pk)
        ) {
            updatedLoadsSmartSuggestionsMap.set(
                activity.address.pk,
                await getLoadSmartSuggestAtAddress(
                    activity.address?.original ?? activity.address?.pk,
                    // @ts-ignore
                    activity.type
                )
            );
        }
    }
    return updatedLoadsSmartSuggestionsMap;
}
