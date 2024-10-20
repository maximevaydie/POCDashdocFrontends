import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchArchiveTransports, fetchRetrieveTransport} from "app/redux/actions";

type Props = {
    transportUid: string;
    isDeleted: boolean;
    isLoading: boolean;
    refetchTransports?: (onlyCounters?: boolean) => void;
    clearPopoverState?: () => void;
};
export function ArchiveButton({
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
                onClick={archiveTransport}
                label={t("common.archive")}
                disabled={isDeleted || isLoading}
                data-testid="archive-transport-button"
            />
        </>
    );

    async function archiveTransport() {
        clearPopoverState?.();
        const filters = {uid__in: [transportUid]};
        await dispatch(fetchArchiveTransports(filters));
        await dispatch(fetchRetrieveTransport(transportUid));
        refetchTransports?.();
    }
}
