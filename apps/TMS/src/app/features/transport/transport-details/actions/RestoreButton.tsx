import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React, {useEffect} from "react";
import {useDispatch} from "react-redux";

import {fetchRestoreTransport} from "app/redux/actions";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    isRestoring: boolean;
    setIsRestoring: (value: boolean) => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function RestoreButton({
    transportUid,
    isLoading,
    isDeleted,
    isRestoring,
    setIsRestoring,
    refetchTransports,
}: Props) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (isRestoring && !isDeleted) {
            setIsRestoring(false);
        }
    }, [isRestoring, isDeleted]);

    return (
        <IconButton
            ml={2}
            name="restore"
            onClick={restoreTransport}
            label={t("common.restore")}
            disabled={isLoading}
        />
    );

    async function restoreTransport() {
        setIsRestoring(true);
        await dispatch(fetchRestoreTransport(transportUid));
        refetchTransports?.();
    }
}
