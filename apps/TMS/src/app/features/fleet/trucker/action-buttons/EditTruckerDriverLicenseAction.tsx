import {t} from "@dashdoc/web-core";
import {Button, Icon, ButtonProps} from "@dashdoc/web-ui";
import {Trucker, useToggle} from "dashdoc-utils";
import React from "react";

import {DriverLicenseModal} from "app/features/fleet/trucker/DriverLicenseModal";

export type EditTruckerActionProps = {
    trucker: Trucker;
    label?: string;
} & Partial<ButtonProps>;

export function EditTruckerDriverLicenseAction(props: EditTruckerActionProps) {
    const {trucker, label, ...buttonProps} = props;
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    return (
        <>
            <Button
                key="edit"
                name="edit"
                variant="primary"
                onClick={openEditModal}
                {...buttonProps}
            >
                {label || (
                    <>
                        <Icon name="edit" mr={2} />
                        {t("common.update")}
                    </>
                )}
            </Button>
            {isEditModalOpen && <DriverLicenseModal trucker={trucker} onClose={closeEditModal} />}
        </>
    );
}
