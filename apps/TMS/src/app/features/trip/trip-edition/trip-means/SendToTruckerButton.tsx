import {Logger, t} from "@dashdoc/web-core";
import {Button, Icon, Text, LoadingWheel, toast} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {useDispatch} from "react-redux";

import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchBulkSendTripTruckerNotification, fetchRetrieveTrip} from "app/redux/actions/trips";

export function SendToTruckerButton({tripUid}: {tripUid: string}) {
    const dispatch = useDispatch();
    const {extendedView} = useExtendedView();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button
            onClick={sendToTrucker}
            disabled={isLoading}
            variant="secondary"
            data-testid="send-trip-to-trucker-button"
            display="flex"
            alignItems="center"
            style={{gap: 8}}
        >
            <Icon name="send" />
            <Text>{t("components.sendToTrucker")}</Text>
            {isLoading && <LoadingWheel inline small />}
        </Button>
    );

    async function sendToTrucker() {
        try {
            setIsLoading(true);
            await fetchBulkSendTripTruckerNotification([tripUid], extendedView)(dispatch);
            await dispatch(fetchRetrieveTrip(tripUid));
            toast.success(t("common.updateSaved"));
        } catch (error) {
            Logger.error(error);
            toast.error(t("common.error"));
        } finally {
            setIsLoading(false);
        }
    }
}
