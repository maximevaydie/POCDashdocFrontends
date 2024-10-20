import {useDispatch} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {IconButton, toast} from "@dashdoc/web-ui";
import React from "react";

import {fetchConfirmTransportDraftAssigned} from "app/redux/actions/transports";
import {SearchQuery} from "app/redux/reducers/searches";

export const ConfirmDraftAssignedAction = ({
    selectedTransportsQuery,
    selectedTransportsCount,
    onSubmit,
}: {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onSubmit: () => void;
}) => {
    const dispatch = useDispatch();

    const sendOrders = async () => {
        try {
            await dispatch(fetchConfirmTransportDraftAssigned(selectedTransportsQuery));
            toast.success(t("components.ordersSuccessfullySentToCarrier"));
            onSubmit();
        } catch (e) {
            Logger.error(e);
        }
    };

    return (
        <IconButton
            name="send"
            label={t("common.sendRequests")}
            color="blue.default"
            ml={2}
            onClick={sendOrders}
            withConfirmation
            confirmationMessage={t("component.sendOrders.confirmationMessage", {
                smart_count: selectedTransportsCount,
            })}
            data-testid="send-orders-requests-button"
            modalProps={{
                title: t("component.sendOrders"),
                mainButton: {severity: undefined},
                "data-testid": "send-orders-requests-confirmation-modal",
            }}
        />
    );
};
