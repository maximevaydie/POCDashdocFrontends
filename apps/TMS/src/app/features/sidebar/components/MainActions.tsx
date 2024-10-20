import {getConnectedManager, managerService, useIsGroupView} from "@dashdoc/web-common";
import React, {useContext} from "react";

import {CollapsedContext} from "app/features/sidebar/CollapsedContext";
import {LoadedConfirmationsButton} from "app/features/transport/import/LoadedConfirmationsButton";
import {NewTransportButton} from "app/features/transport/NewTransportButton";
import {useSelector} from "app/redux/hooks";

export function MainActions({onClose}: {onClose: () => void}) {
    const {collapsed} = useContext(CollapsedContext);
    const connectedManager = useSelector(getConnectedManager);
    const isGroupView = useIsGroupView();
    const counts = useSelector((state) => state.counts);
    const {confirmationDocuments: confirmationDocumentsCounts} = counts;
    if (!managerService.hasAtLeastUserRole(connectedManager)) {
        return null;
    }
    if (isGroupView) {
        return null;
    }
    return (
        <>
            <NewTransportButton displaySmall={collapsed} onOptionSelected={onClose} />
            {"transports_to_create" in confirmationDocumentsCounts && (
                <LoadedConfirmationsButton
                    displaySmall={collapsed}
                    counts={confirmationDocumentsCounts.transports_to_create}
                />
            )}
        </>
    );
}
