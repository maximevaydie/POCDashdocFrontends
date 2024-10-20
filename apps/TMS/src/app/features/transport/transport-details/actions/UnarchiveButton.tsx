import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchRetrieveTransport, fetchUnarchiveTransports} from "app/redux/actions";

type Props = {
    transportUid: string;
    isDeleted: boolean;
    isLoading: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
    clearPopoverState?: () => void;
};
export function UnarchiveButton({
    transportUid,
    isDeleted,
    isLoading,
    refetchTransports,
    clearPopoverState,
}: Props) {
    const dispatch = useDispatch();
    return (
        <>
            <IconButton
                ml={2}
                name="archive"
                onClick={unarchiveTransport}
                label={t("common.unarchive")}
                disabled={!!isDeleted || isLoading}
                data-testid="unarchive-transport-button"
            />
        </>
    );

    async function unarchiveTransport() {
        clearPopoverState?.();
        const filters = {uid__in: [transportUid], archived: true};
        await dispatch(fetchUnarchiveTransports(filters));
        await dispatch(fetchRetrieveTransport(transportUid));
        refetchTransports?.();
    }
}
