import {t} from "@dashdoc/web-core";
import {Modal, Text, TextArea} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";

import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";

type DeleteSubcontractModalProps = {
    charteredTransportUid: string;
    onSubmit: (reason: string) => void;
    onClose: () => void;
};

export function DeleteSubcontractModal({
    charteredTransportUid,
    onSubmit,
    onClose,
}: DeleteSubcontractModalProps) {
    const dispatch = useDispatch();
    const [reason, setReason] = useState("");
    // @ts-ignore
    const [error, setError] = useState<string>(null);
    // @ts-ignore
    const [canCancelCharter, setCanCancelCharter] = useState<boolean>(null);
    const [isLoading, load, unload] = useToggle(true);

    const onSubmitClick = useCallback(() => {
        if (!reason) {
            setError(t("common.mandatoryField"));
            return;
        }
        onSubmit(reason);
        load();
    }, [onSubmit, reason]);

    useEffect(() => {
        // Passing through redux, so we store it in the store at the same time
        // @ts-ignore
        dispatch(fetchRetrieveTransport(charteredTransportUid)).then(
            ({
                response: {
                    entities: {transports},
                },
            }) => {
                // @ts-ignore
                const transport = transports[charteredTransportUid];
                setCanCancelCharter(
                    ["created", "updated", "confirmed", "declined"].includes(transport.status)
                );
                unload();
            }
        );
    }, []);

    return (
        <Modal
            title={t("chartering.cancelChartering")}
            mainButton={{variant: "primary", onClick: onSubmitClick}}
            secondaryButton={{variant: "secondary", onClick: onClose}}
            onClose={onClose}
        >
            {isLoading && <LoadingWheel />}
            {!isLoading && canCancelCharter && (
                <>
                    <Text mb={2}>{t("chartering.deleteCharteringMessage")}</Text>
                    <TextArea
                        required
                        value={reason}
                        error={error}
                        onChange={(value: string) => setReason(value)}
                        label={t("chartering.cancelOrderReason")}
                    />
                </>
            )}
            {!isLoading && !canCancelCharter && (
                <Text>{t("chartering.cannotCancelOngoingCharter")}</Text>
            )}
        </Modal>
    );
}
