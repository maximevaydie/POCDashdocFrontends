import {IconButton} from "@dashdoc/web-ui";
import {Trucker, useToggle} from "dashdoc-utils";
import React from "react";

import {CardCertificatesModal} from "app/features/fleet/trucker/CardCertificatesModal";

type Props = {
    trucker: Trucker;
};
export function AddTruckerCardsCertificatesAction({trucker}: Props) {
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();

    return (
        <>
            <IconButton
                name="edit"
                onClick={openEditModal}
                data-testid="edit-card-certificates-button"
            />

            {isEditModalOpen && (
                <CardCertificatesModal trucker={trucker} onClose={closeEditModal} />
            )}
        </>
    );
}
