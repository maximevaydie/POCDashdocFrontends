import {t} from "@dashdoc/web-core";
import {Card, ClickableUpdateRegion, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import GlobalInstructionsModal from "./global-instructions-modal";

import type {Transport} from "app/types/transport";

type UpdateGlobalInstructions = {
    transport: Transport;
    updateGlobalInstructionsAllowed: boolean;
};
const UpdatableGlobalInstructions: FunctionComponent<UpdateGlobalInstructions> = ({
    transport,
    updateGlobalInstructionsAllowed,
}) => {
    const [
        globalInstructionsModalOpen,
        openGlobalInstructionsModal,
        closeGlobalInstructionsModal,
    ] = useToggle(false);
    return (
        <>
            <Card p={3} my={1} width="fit-content" maxWidth="100%">
                <Text variant="captionBold">{t("transportForm.globalInstructionsTitle")}</Text>
                <ClickableUpdateRegion
                    clickable={updateGlobalInstructionsAllowed}
                    onClick={openGlobalInstructionsModal}
                    data-testid="transport-details-global-instructions"
                >
                    {transport.instructions ? (
                        <Text>{transport.instructions}</Text>
                    ) : (
                        <Text color="grey.dark">{t("components.noInstructions")}</Text>
                    )}
                </ClickableUpdateRegion>
            </Card>
            {globalInstructionsModalOpen && (
                <GlobalInstructionsModal
                    transportUid={transport.uid}
                    // @ts-ignore
                    globalInstructions={transport.instructions}
                    onClose={closeGlobalInstructionsModal}
                />
            )}
        </>
    );
};

export default UpdatableGlobalInstructions;
