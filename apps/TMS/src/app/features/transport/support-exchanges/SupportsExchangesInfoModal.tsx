import {t} from "@dashdoc/web-core";
import {Box, Modal} from "@dashdoc/web-ui";
import {ActivitySiteType, SupportExchange, useToggle} from "dashdoc-utils";
import React, {useCallback} from "react";

import {TransportFormSupportExchange} from "app/features/transport/transport-form/transport-form.types";
import {fetchAddSupportsExchange, fetchAmendAddSupportsExchange} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import {SupportExchangeFormModal} from "../transport-form/support-exchanges/SupportExchangeFormModal";

import {SupportExchangeInfo} from "./SupportExchangeInfo";

import type {Transport} from "app/types/transport";

export interface SupportsExchangesInfoProps {
    siteType: ActivitySiteType;
    transport: Transport;
    exchanges: SupportExchange[];
    siteUid: string;
    canEditExchanges: boolean;
    canAmendExchange: boolean;
}

interface SupportsExchangesInfoModalProps extends SupportsExchangesInfoProps {
    onClose: () => void;
}

export function SupportsExchangesInfoModal({
    siteType,
    transport,
    exchanges,
    siteUid,
    canEditExchanges,
    canAmendExchange,
    onClose,
}: SupportsExchangesInfoModalProps) {
    const {addModalIsOpened, openAddModal, closeAddModal, onSubmitAddSupportExchange} =
        useAddSupportExchangeModal(siteUid);

    const {
        amendAddModalIsOpened,
        openAmendAddModal,
        closeAmendAddModal,
        onSubmitAmendAddSupportExchange,
    } = useAmendAddSupportExchangeModal();

    return (
        <Modal
            title={t("common.holderExchange")}
            onClose={onClose}
            id="exchange-info-modal"
            data-testid="exchange-info-modal"
            mainButton={
                canEditExchanges
                    ? {
                          onClick: openAddModal,
                          children: t("components.addSupportExchange"),
                      }
                    : canAmendExchange
                      ? {
                            onClick: openAmendAddModal,
                            children: t("components.addSupportExchange"),
                        }
                      : null
            }
            secondaryButton={null}
        >
            <Box className="modal-body">
                {exchanges.map((supportExchange, index) => (
                    <SupportExchangeInfo
                        supportExchange={supportExchange}
                        key={`exchange-info-${index}`}
                        transport={transport}
                        activity={{
                            uid: siteUid,
                            type: siteType === "origin" ? "loading" : "unloading",
                        }}
                        index={index}
                        canEdit={canEditExchanges}
                        canAmend={canAmendExchange}
                    />
                ))}
            </Box>
            {addModalIsOpened && (
                <SupportExchangeFormModal
                    transport={transport}
                    activity={{
                        uid: siteUid,
                        type: siteType === "origin" ? "loading" : "unloading",
                    }}
                    onClose={closeAddModal}
                    supportExchangeToEdit={null}
                    onSubmit={onSubmitAddSupportExchange}
                />
            )}
            {amendAddModalIsOpened && (
                <SupportExchangeFormModal
                    transport={transport}
                    amending
                    activity={{
                        uid: siteUid,
                        type: siteType === "origin" ? "loading" : "unloading",
                    }}
                    onClose={closeAmendAddModal}
                    supportExchangeToEdit={null}
                    onSubmit={onSubmitAmendAddSupportExchange}
                />
            )}
        </Modal>
    );
}

function useAddSupportExchangeModal(siteUid: string) {
    const dispatch = useDispatch();
    const [addModalIsOpened, openAddModal, closeAddModal] = useToggle();

    const onSubmitAddSupportExchange = useCallback(
        (formSupportExchange: TransportFormSupportExchange) => {
            dispatch(
                fetchAddSupportsExchange(
                    {
                        // @ts-ignore
                        site: {
                            uid: formSupportExchange.activity.uid,
                        },
                        support_type: {uid: formSupportExchange.type.uid},
                        expected_retrieved: formSupportExchange.expectedRetrieved,
                        expected_delivered: formSupportExchange.expectedDelivered,
                    },
                    siteUid
                )
            );
        },
        [dispatch, siteUid]
    );

    return {
        addModalIsOpened,
        openAddModal,
        closeAddModal,
        onSubmitAddSupportExchange,
    };
}

function useAmendAddSupportExchangeModal() {
    const dispatch = useDispatch();
    const [amendAddModalIsOpened, openAmendAddModal, closeAmendAddModal] = useToggle();

    const onSubmitAmendAddSupportExchange = useCallback(
        (formSupportExchange: TransportFormSupportExchange) => {
            dispatch(
                fetchAmendAddSupportsExchange({
                    // @ts-ignore
                    site: {
                        uid: formSupportExchange.activity.uid,
                    },
                    support_type: {uid: formSupportExchange.type.uid},
                    actual_retrieved: formSupportExchange.expectedRetrieved,
                    actual_delivered: formSupportExchange.expectedDelivered,
                })
            );
        },
        [dispatch]
    );

    return {
        amendAddModalIsOpened,
        openAmendAddModal,
        closeAmendAddModal,
        onSubmitAmendAddSupportExchange,
    };
}
