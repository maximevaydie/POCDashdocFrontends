import {t} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {AddOptionItem} from "./AddButtonItem";
import {AddPickupDeliveryModal} from "./AddPickupDeliveryModal";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    onActivityAdded?: () => void;
    activityUidBeforeWhichInsertNewActivities?: string;
    isAddingActivity: boolean;
    setIsAddingActivity: (value: boolean) => void;
};
export function AddPickupDeliveryButton({
    transport,
    onActivityAdded,
    activityUidBeforeWhichInsertNewActivities,
    isAddingActivity,
    setIsAddingActivity,
}: Props) {
    const [isOpened, open, close] = useToggle();
    return (
        <>
            {transport.shape === "complex" ? (
                <AddOptionItem
                    icon="insertBetween"
                    label={t("transportsForm.addPickupDelivery")}
                    onClick={open}
                    disabled={isAddingActivity}
                    isLast
                    testId="add-pickup-delivery"
                />
            ) : (
                <AddOptionItem
                    icon="convert"
                    label={t("transport.convertToComplexTransport")}
                    description={t("transport.convertToComplexTransport.description")}
                    onClick={open}
                    disabled={isAddingActivity}
                    isLast
                    testId="convert-to-complex-transport"
                />
            )}
            {isOpened && (
                <AddPickupDeliveryModal
                    transport={transport}
                    onClose={close}
                    onActivityAdded={onActivityAdded}
                    activityUidBeforeWhichInsertNewActivities={
                        activityUidBeforeWhichInsertNewActivities
                    }
                    isAddingActivity={isAddingActivity}
                    setIsAddingActivity={setIsAddingActivity}
                />
            )}
        </>
    );
}
