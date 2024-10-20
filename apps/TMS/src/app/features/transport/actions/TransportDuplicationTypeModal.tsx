import {TrackedLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect} from "react";
import {RouteComponentProps, withRouter} from "react-router";

import useIsCarrier from "app/hooks/useIsCarrier";
import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTransport} from "app/redux/reducers";
import {DuplicationParams} from "app/services/transport";

import TransportMultipleDuplicationModal from "./transport-duplication-modal";

import type {Transport} from "app/types/transport";

type TransportDuplicationTypeModalProps = RouteComponentProps & {
    transportUid: string;
    transportNumber: number;
    onClose: (cancelled: boolean) => void;
    onSubmitMassDuplication: (params: DuplicationParams) => Promise<Response>;
};

/**
 *
 * @param {string} transportUid - Uid of the duplicated transport
 * @param {number} transportNumber - Number (pk) of the duplicated transport (used for display only)
 * @param {() => void} onClose
 * @param {(DuplicationParams) => Promise<Response>} onSubmit
 */
function TransportDuplicationTypeModal({
    transportUid,
    transportNumber,
    onClose,
    onSubmitMassDuplication,
    history,
}: TransportDuplicationTypeModalProps) {
    const [isDuplicationModalOpen, openDuplicationModal, closeDuplicationModal] = useToggle(false);
    const dispatch = useDispatch();

    const transport = useSelector((state) =>
        state.entities.transports ? (getFullTransport(state, transportUid) as Transport) : null
    );

    const isComplexTransport = transport?.shape === "complex";

    const retrieveTransport = useCallback(() => {
        dispatch(fetchRetrieveTransport(transportUid));
    }, [transportUid, dispatch]);

    useEffect(() => {
        if (!transport) {
            retrieveTransport();
        }
    }, [transport, retrieveTransport]);

    const isCarrier = useIsCarrier();

    const handleSimpleDuplicationClicked = () => {
        let duplicateUrl = `/app/orders/${transportUid}/duplicate`;
        if (isCarrier) {
            duplicateUrl = `/app/transports/${transportUid}/duplicate`;
        }
        if (isComplexTransport) {
            duplicateUrl += "?complex=true";
        }
        history.push(duplicateUrl);
        onClose(false);
    };

    const handleDuplicationModalClose = () => {
        closeDuplicationModal();
        onClose(true);
    };
    return (
        <>
            <Modal
                title={
                    <Flex alignItems="center">
                        <Text variant="title">{t("components.duplicateTransportModalTitle")}</Text>
                        &nbsp;
                        <TrackedLink
                            to={`/app/transports/${transportUid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="duplicate-type-modal-link"
                            style={{
                                fontSize: "20px",
                                lineHeight: "27px",
                            }}
                        >
                            {t("components.transportNumber", {
                                number: transportNumber,
                            }).toLowerCase()}
                        </TrackedLink>
                    </Flex>
                }
                id="transport-duplication-type-modal"
                data-testid="transport-duplication-type-modal"
                onClose={onClose.bind(null, true)}
                mainButton={{
                    children: t("common.cancel"),
                    onClick: onClose.bind(null, true),
                    variant: "secondary",
                }}
                secondaryButton={null}
            >
                {transport ? (
                    <>
                        <Button
                            onClick={handleSimpleDuplicationClicked}
                            data-testid="simple-duplication-button"
                            variant="secondary"
                            mb={4}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Text variant="h2" pb="5px" textAlign="start">
                                    {t("components.simpleDuplication")}
                                </Text>
                                <Text>{t("components.createCopieModifyValues")}</Text>
                            </Box>
                            <Icon name="arrowRight" />
                        </Button>
                        <Button
                            onClick={openDuplicationModal}
                            data-testid="multiple-duplication-button"
                            variant="secondary"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Text variant="h2" pb="5px" textAlign="start">
                                    {t("components.multipleDuplication")}
                                </Text>
                                <Text>{t("components.createMultipleCopies")}</Text>
                            </Box>
                            <Icon name="arrowRight" />
                        </Button>
                    </>
                ) : (
                    <LoadingWheel />
                )}
            </Modal>
            {isDuplicationModalOpen && (
                <TransportMultipleDuplicationModal
                    transportUid={transportUid}
                    transportNumber={transportNumber}
                    onClose={handleDuplicationModalClose}
                    onSubmit={onSubmitMassDuplication}
                />
            )}
        </>
    );
}

export default withRouter(TransportDuplicationTypeModal);
