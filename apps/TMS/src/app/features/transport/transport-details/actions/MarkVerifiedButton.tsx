import {Logger, t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {fetchRetrieveTransport, fetchSetSingleTransportStatusVerified} from "app/redux/actions";

type Props = {
    transportUid: string;
    isLoading: boolean;
    isDeleted: boolean;
    isStatusButtonLoading: boolean;
    setIsStatusButtonLoading: (value: boolean) => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
};
export function MarkVerifiedButton({
    transportUid,
    isLoading,
    isDeleted,
    isStatusButtonLoading,
    setIsStatusButtonLoading,
    refetchTransports,
}: Props) {
    const dispatch = useDispatch();
    return (
        <>
            <Button
                ml={2}
                data-testid="mark-verified-button"
                onClick={async (e) => {
                    e.preventDefault();
                    setIsStatusButtonLoading(true);
                    try {
                        await dispatch(fetchSetSingleTransportStatusVerified(transportUid));
                        await dispatch(fetchRetrieveTransport(transportUid));
                        refetchTransports?.();
                    } catch (e) {
                        Logger.error("Couldn't mark transport as verified", e);
                    }
                    setIsStatusButtonLoading(false);
                }}
                loading={isStatusButtonLoading}
                disabled={isDeleted || isLoading}
            >
                <Icon name="check" mr={2} />
                {t("components.markVerified")}
            </Button>
        </>
    );
}
