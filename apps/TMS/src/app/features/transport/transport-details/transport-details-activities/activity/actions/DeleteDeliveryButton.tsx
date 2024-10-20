import {NamedAddressLabel, useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, IconButton} from "@dashdoc/web-ui";
import uniq from "lodash.uniq";
import React, {useCallback} from "react";

import {fetchDeleteTransportSites} from "app/redux/actions";
import {activityService} from "app/services/transport/activity.service";

import type {Activity, Transport} from "app/types/transport";
type Props = {
    transport: Transport;
    activity: Activity;
    isDeletingActivity: boolean;
    setIsDeletingActivity: (value: boolean) => void;
    onActivityDeleted?: () => void;
};
export function DeleteDeliveryButton({
    transport,
    activity,
    isDeletingActivity,
    setIsDeletingActivity,
    onActivityDeleted,
}: Props) {
    const dispatch = useDispatch();
    const activitiesToDelete = uniq(
        activity.deliveries.flatMap((delivery) => [delivery.origin.uid, delivery.destination.uid])
    );

    const deleteDelivery = useCallback(() => {
        setIsDeletingActivity(true);
        dispatch(fetchDeleteTransportSites(transport.uid, activitiesToDelete)).finally(() => {
            onActivityDeleted?.();
            setIsDeletingActivity(false);
        });
    }, [setIsDeletingActivity, dispatch, transport.uid, activitiesToDelete, onActivityDeleted]);
    if (
        activityService.isActivityStarted(activity) ||
        transport.shape !== "complex" ||
        transport.deliveries.length - activity.deliveries.length <= 0 ||
        activity.deliveries
            .flatMap((delivery) => [delivery.origin, delivery.destination])
            .some((a) => !!a.real_start)
    ) {
        return null;
    }
    return (
        <Box>
            <IconButton
                data-testid="delete-delivery"
                name="delete"
                onClick={deleteDelivery}
                disabled={isDeletingActivity}
                withConfirmation={true}
                confirmationMessage={
                    <Box>
                        <Callout variant="danger">{t("transport.deleteDeliveryAlert")}</Callout>
                        {activity.deliveries.map((delivery) => (
                            <Flex
                                key={delivery.uid}
                                mt={2}
                                p={2}
                                backgroundColor="grey.ultralight"
                            >
                                <NamedAddressLabel address={delivery.origin.address} />
                                <Icon name="thickArrowRight" mx={5} />
                                <NamedAddressLabel address={delivery.destination.address} />
                            </Flex>
                        ))}
                    </Box>
                }
                modalProps={{
                    title: t("components.deleteActivity"),
                    mainButton: {
                        ["data-testid"]: "confirm-deleted-delivery",
                        children: t("common.delete"),
                    },
                }}
            />
        </Box>
    );
}
