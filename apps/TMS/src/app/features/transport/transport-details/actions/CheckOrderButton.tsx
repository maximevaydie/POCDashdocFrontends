import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchCheckOrders, fetchRetrieveTransport} from "app/redux/actions";
import {ORDERS_DONE_OR_CANCELLED_TAB} from "app/types/businessStatus";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function CheckOrderButton({transportUid, isLoading, isDeleted, refetchTransports}: Props) {
    const dispatch = useDispatch();
    const isDoneTab =
        new URLSearchParams(location.search).get("business_status") ===
        ORDERS_DONE_OR_CANCELLED_TAB;
    const variant = isDoneTab ? "primary" : "secondary";
    const color = isDoneTab ? "grey.white" : "blue.default";
    return (
        <Button
            ml={2}
            variant={variant}
            onClick={checkOrder}
            disabled={isDeleted || isLoading}
            data-testid="check-order-button"
        >
            <Icon name="checkList" mr={2} color={color} />
            {t("order.markChecked")}
        </Button>
    );

    async function checkOrder() {
        const payload = {
            filters: `uid__in=${transportUid}`,
        };
        await dispatch(fetchCheckOrders(payload, t("components.transportsSuccessfullyChecked")));
        await dispatch(fetchRetrieveTransport(transportUid));
        refetchTransports?.();
    }
}
