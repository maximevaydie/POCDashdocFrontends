import {getConnectedManagerId, useSelector, SuggestedAddress} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Text, Icon} from "@dashdoc/web-ui";
import {useFormikContext} from "formik";
import React from "react";

import {getInitialActivityData} from "../transport-form-initial-values";
import {TransportFormDelivery, TransportFormValues} from "../transport-form.types";

import {DeliveryItem} from "./DeliveryItem";

interface DeliveriesSectionProps {
    originAddressesSuggestedByShipper: SuggestedAddress[];
}

export function DeliveriesSection({originAddressesSuggestedByShipper}: DeliveriesSectionProps) {
    const managerPk = useSelector(getConnectedManagerId);

    const {values, setFieldValue, errors, touched} = useFormikContext<TransportFormValues>();
    const {deliveries, supportExchanges, activities, trips} = values;
    const setDeliveries = (newDeliveries: TransportFormDelivery[]) => {
        setFieldValue("deliveries", newDeliveries);
    };

    const addEmptyDelivery = () => {
        const emptyLoading = getInitialActivityData(managerPk?.toString() ?? "", "loading");
        const emptyUnloading = getInitialActivityData(managerPk?.toString() ?? "", "unloading");

        setFieldValue("activities", {
            ...activities,
            [emptyLoading.uid]: emptyLoading,
            [emptyUnloading.uid]: emptyUnloading,
        });

        setDeliveries([
            ...deliveries,
            {
                loadingUid: emptyLoading.uid,
                unloadingUid: emptyUnloading.uid,
                loads: [],
            },
        ]);

        setFieldValue("trips[0]", {
            ...trips[0],
            activityUids: [...trips[0].activityUids, emptyLoading.uid, emptyUnloading.uid],
        });
    };

    const updateDelivery = (index: number, newDelivery: TransportFormDelivery) => {
        const newDeliveries = [...deliveries];
        newDeliveries[index] = newDelivery;
        setDeliveries(newDeliveries);
    };

    const deleteDelivery = (index: number) => {
        const deliveryToDelete = deliveries[index];
        // If there are support exchanges linked to this delivery's activities, delete them
        const newSupportExchanges = supportExchanges.filter(
            (supportExchange) =>
                !(
                    deliveryToDelete.loadingUid === supportExchange.activity.uid ||
                    deliveryToDelete.unloadingUid === supportExchange.activity.uid
                )
        );

        // Delete loading and unloading activities
        const newActivities = {...activities};
        delete newActivities[deliveryToDelete.loadingUid];
        delete newActivities[deliveryToDelete.unloadingUid];

        // Delete loading and unloading from trips
        const originTripIndex = trips.findIndex((trip) =>
            trip.activityUids.includes(deliveryToDelete.loadingUid)
        );
        const destinationTripIndex = trips.findIndex((trip) =>
            trip.activityUids.includes(deliveryToDelete.unloadingUid)
        );
        let newTrips = [...trips];
        newTrips[originTripIndex].activityUids = newTrips[originTripIndex].activityUids.filter(
            (uid) => uid !== deliveryToDelete.loadingUid
        );
        newTrips[destinationTripIndex].activityUids = newTrips[
            destinationTripIndex
        ].activityUids.filter((uid) => uid !== deliveryToDelete.unloadingUid);

        // TODO: handle case where only breaking/resuming activities are left
        if (newTrips[originTripIndex].activityUids.length === 0) {
            newTrips = newTrips.filter((_, i) => i !== originTripIndex);
        }
        if (newTrips[destinationTripIndex].activityUids.length === 0) {
            newTrips = newTrips.filter((_, i) => i !== destinationTripIndex);
        }

        setFieldValue("trips", newTrips);
        setFieldValue("activities", newActivities);
        setFieldValue("supportExchanges", newSupportExchanges);
        setDeliveries(deliveries.filter((_, i) => i !== index));
    };

    return (
        <Flex flexDirection="column">
            <Text variant="h1" mr={3} marginBottom={3}>
                {`${t("common.pickup")} / ${t("common.delivery")}`}
            </Text>
            <Flex flexDirection="column" style={{gap: "8px"}}>
                {deliveries.map((delivery, index) => (
                    <DeliveryItem
                        key={index}
                        index={index}
                        delivery={delivery}
                        onUpdate={(updatedDelivery) => updateDelivery(index, updatedDelivery)}
                        onDelete={deliveries.length > 1 ? () => deleteDelivery(index) : undefined}
                        error={
                            touched.deliveries && errors.activities
                                ? (errors.activities as unknown as string)
                                : null
                        }
                        testId={`transport-form-delivery-${index}`}
                        originAddressesSuggestedByShipper={originAddressesSuggestedByShipper}
                    />
                ))}
            </Flex>
            <Button
                marginTop={2}
                variant="plain"
                onClick={addEmptyDelivery}
                alignSelf="flex-start"
                data-testid="transport-form-add-delivery"
            >
                <Icon name="add" marginRight={1} /> {t("transportsForm.addPickupDelivery")}
            </Button>
        </Flex>
    );
}
