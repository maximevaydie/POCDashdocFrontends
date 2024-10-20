import {Logger, t} from "@dashdoc/web-core";
import {Button, Icon, Text, LoadingWheel, toast} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {useDispatch} from "react-redux";

import {fetchConfirmTransportDraftAssigned} from "app/redux/actions";
import {fetchRetrieveTrip} from "app/redux/actions/trips";

export function SendToCarrierButton({
    tripUid,
    childTransportUid,
}: {
    tripUid: string;
    childTransportUid: string;
}) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Button
            onClick={sendToCarrier}
            disabled={isLoading}
            variant="secondary"
            data-testid="trip-send-to-carrier-button"
            display="flex"
            alignItems="center"
            style={{gap: 8}}
        >
            <Icon name="send" color="blue.default" />
            <Text>{t("components.sendToCarrier")}</Text>
            {isLoading && <LoadingWheel inline small />}
        </Button>
    );

    async function sendToCarrier() {
        try {
            setIsLoading(true);
            await dispatch(
                fetchConfirmTransportDraftAssigned({
                    uid__in: [childTransportUid],
                })
            );
            await dispatch(fetchRetrieveTrip(tripUid));
            toast.success(t("chartering.charterSendSuccess"));
        } catch (error) {
            Logger.error(error);
            toast.error(t("chartering.charterError"));
        } finally {
            setIsLoading(false);
        }
    }
}
