import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchUncheckOrders, fetchRetrieveTransport} from "app/redux/actions";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
    clearPopoverState?: () => void;
};
export function UncheckOrderButton({
    transportUid,
    isLoading,
    isDeleted,
    refetchTransports,
    clearPopoverState,
}: Props) {
    const dispatch = useDispatch();
    return (
        <IconButton
            ml={2}
            name="undo"
            onClick={uncheckOrder}
            label={t("order.markUnchecked")}
            disabled={!!isDeleted || isLoading}
            data-testid="uncheck-order-button"
        />
    );

    async function uncheckOrder() {
        clearPopoverState?.();
        const payload = {
            filters: `uid__in=${transportUid}`,
        };
        await dispatch(
            fetchUncheckOrders(payload, t("components.transportsSuccessfullyUnchecked"))
        );
        await dispatch(fetchRetrieveTransport(transportUid));
        refetchTransports?.();
    }
}
