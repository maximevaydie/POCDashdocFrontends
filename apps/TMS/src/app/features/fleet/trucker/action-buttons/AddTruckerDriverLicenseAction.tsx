import {IconButton} from "@dashdoc/web-ui";
import {Trucker, useToggle} from "dashdoc-utils";
import React from "react";

import {DriverLicenseModal} from "app/features/fleet/trucker/DriverLicenseModal";

type Props = {
    trucker: Trucker;
};
export function AddTruckerDriverLicenseAction({trucker}: Props) {
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    return (
        <>
            <IconButton
                name="edit"
                onClick={openEditModal}
                data-testid="edit-driver-license-button"
            />

            {isEditModalOpen && <DriverLicenseModal trucker={trucker} onClose={closeEditModal} />}
        </>
    );
}
