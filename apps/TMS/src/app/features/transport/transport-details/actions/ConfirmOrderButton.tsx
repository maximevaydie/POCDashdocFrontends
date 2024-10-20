import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchConfirmTransport} from "app/redux/actions";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function ConfirmOrderButton({
    transportUid,
    isLoading,
    isDeleted,
    refetchTransports,
}: Props) {
    const dispatch = useDispatch();
    return (
        <>
            <Button
                ml={2}
                key="confirm-order"
                onClick={confirmTransportOrder}
                disabled={isDeleted || isLoading}
                data-testid="accept-order-button"
            >
                <Icon name="check" mr={2} />
                {t("common.accept")}
            </Button>
        </>
    );

    async function confirmTransportOrder() {
        await dispatch(fetchConfirmTransport(transportUid));
        refetchTransports?.();
    }
}
