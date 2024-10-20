import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchSetTransportUninvoiced} from "app/redux/actions";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    isStatusButtonLoading: boolean;
    setIsStatusButtonLoading: (value: boolean) => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function MarkNotBilledButton({
    transportUid,
    isLoading,
    isDeleted,
    isStatusButtonLoading,
    refetchTransports,
    setIsStatusButtonLoading,
}: Props) {
    const dispatch = useDispatch();
    return (
        <Button
            ml={2}
            data-testid="mark-not-billed-button"
            onClick={(e) => {
                e.preventDefault();
                handleSetTransportUninvoiced();
            }}
            loading={isStatusButtonLoading}
            variant="secondary"
            disabled={isDeleted || isLoading}
        >
            <Icon name="undo" mr={2} />
            {t("components.markNotBilled")}
        </Button>
    );

    async function handleSetTransportUninvoiced() {
        setIsStatusButtonLoading(true);
        await dispatch(fetchSetTransportUninvoiced(transportUid));
        refetchTransports?.();
        setIsStatusButtonLoading(false);
    }
}
