import {managerService, getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useSelector} from "react-redux";

import FleetModal from "app/features/fleet/FleetModal";

import type {RootState} from "app/redux/reducers";

type Props = {
    onSubmit: () => void;
};

export function AddFleetButton({onSubmit}: Props) {
    const [isAddPlateModalOpen, openAddPlateModal, closeAddPlateModal] = useToggle();
    const hasEditAccess = useSelector((state: RootState) =>
        managerService.hasAtLeastUserRole(getConnectedManager(state))
    );
    if (!hasEditAccess) {
        return null;
    }

    return (
        <>
            <Button
                ml={2}
                variant="primary"
                onClick={openAddPlateModal}
                data-testid="fleet-add-button"
            >
                <Icon mr={2} name="add" /> {t("common.new")}
            </Button>
            {isAddPlateModalOpen && (
                <FleetModal onSubmit={onSubmit} onClose={closeAddPlateModal} />
            )}
        </>
    );
}
