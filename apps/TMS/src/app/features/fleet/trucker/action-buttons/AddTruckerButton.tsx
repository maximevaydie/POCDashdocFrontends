import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {Trucker, Usage, useToggle} from "dashdoc-utils";
import React from "react";

import {TruckerModal} from "app/features/fleet/trucker/trucker-modal/TruckerModal";
import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";

type Props = {
    onSubmitTrucker: (trucker: Trucker) => void;
    usage: Usage | null;
};

export function AddTruckerButton({onSubmitTrucker, usage}: Props) {
    const [isTruckerModalOpen, openTruckerModal, closeTruckerModal] = useToggle();
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
                onClick={openTruckerModal}
                data-testid="add-trucker-button"
            >
                <Icon mr={2} name="add" /> {t("components.inviteNewDriver")}
            </Button>
            {isTruckerModalOpen && (
                <TruckerModal
                    onSubmitTrucker={onSubmitTrucker}
                    onClose={closeTruckerModal}
                    usage={usage}
                />
            )}
        </>
    );
}
