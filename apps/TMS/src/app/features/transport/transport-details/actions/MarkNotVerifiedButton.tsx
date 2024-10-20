import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchSetTransportUnverified} from "app/redux/actions";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    isLoading: boolean;
    isStatusButtonLoading: boolean;
    setIsStatusButtonLoading: (value: boolean) => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function MarkNotVerifiedButton({
    transport,
    isLoading,
    isStatusButtonLoading,
    setIsStatusButtonLoading,
    refetchTransports,
}: Props) {
    const dispatch = useDispatch();
    return (
        <Button
            ml={2}
            data-testid="mark-not-verified-button"
            onClick={(e) => {
                e.preventDefault();
                handleSetTransportUnverified();
            }}
            loading={isStatusButtonLoading}
            variant="secondary"
            disabled={!!transport.deleted || isLoading}
        >
            <Icon name="undo" mr={2} />
            {t("components.markNotVerified")}
        </Button>
    );

    async function handleSetTransportUnverified() {
        setIsStatusButtonLoading(true);
        await dispatch(fetchSetTransportUnverified(transport.uid));
        refetchTransports?.();
        setIsStatusButtonLoading(false);
    }
}
