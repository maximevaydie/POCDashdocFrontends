import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import TransportDuplicationTypeModal from "app/features/transport/actions/TransportDuplicationTypeModal";
import {DuplicationParams, massDuplicateTransport} from "app/services/transport";

type Props = {
    transportIsDeleted: boolean;
    isLoading: boolean;
    transportNumber: number;
    transportUid: string;
    refetchTransports: (() => void) | undefined;
};

export const DuplicateOrderButton = ({
    transportIsDeleted,
    isLoading,
    transportNumber,
    transportUid,
    refetchTransports,
}: Props) => {
    const [modalIsOpen, openModal, closeModal] = useToggle(false);

    const handleDuplicationSubmit = async (params: DuplicationParams) => {
        let uids = await massDuplicateTransport(transportUid, params);
        closeModal();
        refetchTransports?.();
        return uids;
    };

    return (
        <>
            <IconButton
                ml={2}
                key="duplicate"
                name="duplicate"
                onClick={openModal}
                label={t("components.duplicate")}
                data-testid="transport-detail-duplicate"
                disabled={!!transportIsDeleted || isLoading}
            />
            {modalIsOpen && (
                <TransportDuplicationTypeModal
                    onClose={closeModal}
                    onSubmitMassDuplication={handleDuplicationSubmit}
                    transportNumber={transportNumber}
                    transportUid={transportUid}
                />
            )}
        </>
    );
};
