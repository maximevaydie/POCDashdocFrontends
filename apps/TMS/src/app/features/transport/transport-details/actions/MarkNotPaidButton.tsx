import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchSetTransportUnpaid} from "app/redux/actions";
type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    isStatusButtonLoading: boolean;
    setIsStatusButtonLoading: (value: boolean) => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function MarkNotPaidButton({
    transportUid,
    isLoading,
    isDeleted,
    isStatusButtonLoading,
    setIsStatusButtonLoading,
    refetchTransports,
}: Props) {
    const dispatch = useDispatch();
    return (
        <Button
            ml={2}
            data-testid="mark-not-paid-button"
            onClick={(e) => {
                e.preventDefault();
                handleSetTransportUnpaid();
            }}
            loading={isStatusButtonLoading}
            variant="secondary"
            disabled={isDeleted || isLoading}
        >
            <Icon name="undo" mr={2} />
            {t("components.markNotPayed")}
        </Button>
    );

    async function handleSetTransportUnpaid() {
        setIsStatusButtonLoading(true);
        await dispatch(fetchSetTransportUnpaid(transportUid));
        refetchTransports?.();
        setIsStatusButtonLoading(false);
    }
}
