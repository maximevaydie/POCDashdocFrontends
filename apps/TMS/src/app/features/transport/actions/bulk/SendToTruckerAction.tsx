import {t} from "@dashdoc/web-core";
import {Flex, IconButton, Modal} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useState} from "react";
import {useDispatch} from "react-redux";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {fetchSendTruckerNotification} from "app/redux/actions";
import {SearchQuery} from "app/redux/reducers/searches";
import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";

type SendToTruckerActionProps = {
    currentSelection: string[];
    currentQuery: TransportsScreenQuery;
    allTransportsSelected: boolean;
    timezone: string;
    refetchTransports: () => void;
};

export const SendToTruckerAction = ({
    currentSelection,
    currentQuery,
    allTransportsSelected,
    timezone,
    refetchTransports,
}: SendToTruckerActionProps) => {
    const dispatch = useDispatch();
    const [isSendingToTruckers, setIsSendingToTruckers] = useState(false);
    const [isSendToTruckerTruckerModalOpen, openSendToTruckerModal, closeSendToTruckerModal] =
        useToggle();

    const sendTransportsToTruckers = useCallback(async () => {
        setIsSendingToTruckers(true);

        let filters: SearchQuery = {uid__in: currentSelection};
        if (allTransportsSelected) {
            filters = getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true);
        }

        try {
            await dispatch(fetchSendTruckerNotification(filters));
        } catch (error) {
            // pass
        }
        setIsSendingToTruckers(false);
        closeSendToTruckerModal();
        refetchTransports();
    }, [
        currentSelection,
        allTransportsSelected,
        closeSendToTruckerModal,
        refetchTransports,
        currentQuery,
        timezone,
        dispatch,
    ]);

    return (
        <Flex>
            <IconButton
                name="send"
                label={t("components.sendToTrucker")}
                onClick={openSendToTruckerModal}
                ml={2}
                color="blue.default"
            />

            {isSendToTruckerTruckerModalOpen && (
                <Modal
                    title={t("components.sendToTrucker")}
                    onClose={closeSendToTruckerModal}
                    mainButton={{
                        onClick: sendTransportsToTruckers,
                        loading: isSendingToTruckers,
                        ["data-testid"]: "bulk-send-to-trucker-button",
                    }}
                    id="bulk-send-to-trucker-modal"
                    data-testid="bulk-send-to-trucker-modal"
                >
                    {t("components.confirmSendToTruckers")}
                </Modal>
            )}
        </Flex>
    );
};
