import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {SupportExchange, useToggle} from "dashdoc-utils";
import React, {useCallback} from "react";

import {SupportExchangeFormModal} from "app/features/transport/transport-form/support-exchanges/SupportExchangeFormModal";
import {
    TransportFormActivity,
    TransportFormSupportExchange,
} from "app/features/transport/transport-form/transport-form.types";
import {fetchUpdateSupportsExchange} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    activity: Pick<TransportFormActivity, "uid" | "type">;
    supportExchange: SupportExchange;
};

export const EditSupportExchangeButton = ({transport, activity, supportExchange}: Props) => {
    const dispatch = useDispatch();
    const [modalIsOpened, openModal, closeModal] = useToggle(false);

    const onSubmit = useCallback(
        (formSupportExchange: TransportFormSupportExchange) => {
            dispatch(
                fetchUpdateSupportsExchange({
                    site: {
                        // @ts-ignore
                        uid: formSupportExchange.activity.uid,
                    },
                    support_type: {uid: formSupportExchange.type.uid},
                    expected_retrieved: formSupportExchange.expectedRetrieved,
                    expected_delivered: formSupportExchange.expectedDelivered,
                    uid: supportExchange.uid,
                })
            );
        },
        [dispatch, supportExchange.uid]
    );

    return (
        <>
            <Button variant="plain" onClick={openModal}>
                {t("common.edit")}
            </Button>
            {modalIsOpened && (
                <SupportExchangeFormModal
                    onClose={closeModal}
                    activity={activity}
                    supportExchangeToEdit={{
                        activity,
                        type: supportExchange.support_type,
                        expectedDelivered: supportExchange.expected_delivered ?? 0,
                        expectedRetrieved: supportExchange.expected_retrieved ?? 0,
                    }}
                    onSubmit={onSubmit}
                    transport={transport}
                />
            )}
        </>
    );
};
