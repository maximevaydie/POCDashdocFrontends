import {apiService} from "@dashdoc/web-common";
import {ClickableUpdateRegion, Text} from "@dashdoc/web-ui";
import {
    useToggle,
    OriginalAddress,
    NewSignatory,
    type TransportAddressWithCompany,
    type TransportAddress,
} from "dashdoc-utils";
import React from "react";
import {useDispatch} from "react-redux";

import {UpdateAddressModal} from "app/features/address/modal/update-address-modal";
import {getActivityKeyLabel, isTripActivityStarted} from "app/features/trip/trip.service";
import {
    SimilarActivityWithTransportData,
    TripActivityCategory,
} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchUpdateSite} from "app/redux/actions";

export function Address({
    activity,
    isMergedActivity,
    editable,
}: {
    activity: SimilarActivityWithTransportData;
    isMergedActivity: boolean;
    editable: boolean;
}) {
    const dispatch = useDispatch();
    const extendedView = useExtendedView();
    const [isOpen, open, close] = useToggle(false);

    const address = activity.address;
    let addressText;
    if (address) {
        addressText = [address.postcode, address.city].filter((v) => !!v).join(" ");
        addressText = [address.address, addressText, address.country]
            .filter((v) => !!v)
            .join(", ");
    } else {
        addressText = getActivityKeyLabel(activity.category);
    }

    const canBeEdited =
        editable &&
        !isMergedActivity &&
        !["trip_start", "trip_end", undefined].includes(activity.category) &&
        !isTripActivityStarted(activity);

    return (
        <>
            <ClickableUpdateRegion
                clickable={canBeEdited}
                onClick={open}
                data-testid="edit-activity-address"
            >
                {address ? (
                    <>
                        <Text variant="captionBold">{address.name}</Text>
                        <Text variant="subcaption">{addressText}</Text>
                    </>
                ) : (
                    <Text variant="captionBold">{addressText}</Text>
                )}
            </ClickableUpdateRegion>
            {isOpen && (
                <UpdateAddressModal
                    onSubmit={handleAddressSubmit}
                    // TODO: TransportAddress is not compatible with OriginalAddress
                    initialAddress={activity.address as TransportAddressWithCompany | null}
                    siteUID={activity.uid}
                    addressCategory={getActivityType(activity.category)}
                    isModifyingFinalInfo={false}
                    isRental={isRental()}
                    onClose={close}
                />
            )}
        </>
    );

    async function handleAddressSubmit(
        address: OriginalAddress | undefined,
        _sendToCarrier?: boolean,
        signatory?: NewSignatory,
        signatoryRemoved?: boolean
    ) {
        if (!activity) {
            throw "No updateActivityAddressModalOpen";
        }

        await dispatch(
            fetchUpdateSite(activity.uid, {
                // TODO: OriginalAddress is not compatible with TransportAddress
                address: address as TransportAddress | undefined,
                extended_view: Boolean(extendedView),
            })
        );

        await handleSiteSignatorySubmit(signatory, signatoryRemoved);
    }

    async function handleSiteSignatorySubmit(
        signatory: NewSignatory | undefined,
        removeSignatory: boolean | undefined
    ) {
        if (signatory) {
            await apiService.TransportSignatories.patch(
                signatory.uid,
                {
                    data: {...signatory, site: activity.uid},
                },
                {
                    apiVersion: "web",
                }
            );
        } else if (removeSignatory) {
            await apiService.SiteSignatories.delete(activity.uid);
        }
    }

    function isRental() {
        return [...(activity.deliveries_from || []), ...(activity.deliveries_to || [])].some(
            (delivery) => delivery.planned_loads?.[0]?.category === "rental"
        );
    }
}

function getActivityType(category: TripActivityCategory | undefined) {
    switch (category) {
        case "loading":
            return "origin";
        case "unloading":
            return "destination";
        case "breaking":
        case "resuming":
            return "bulkingBreak";
        default:
            throw "activity address edition not supported for this activity category";
    }
}
