import {useFeatureFlag} from "@dashdoc/web-common";
import {Box, ClickableUpdateRegion} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import GlobalInstructionsModal from "app/features/transport/transport-details/transport-details-activities/instructions/global-instructions-modal";
import {TripStatus, TripTransport} from "app/features/trip/trip.types";

import {DataInfo} from "../../generic/DataInfo";

type Props = {
    transports: TripTransport[];
    editable: boolean;
    tripStatus: TripStatus | undefined;
};
export function TripInstructions({transports, editable, tripStatus}: Props) {
    const [isOpen, open, close] = useToggle();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const canUpdateGlobalInstructions =
        editable && !(hasInvoiceEntityEnabled && tripStatus === "invoiced");

    return (
        <>
            <Box width="fit-content" minWidth="400px">
                <ClickableUpdateRegion
                    clickable={transports.length == 1 && canUpdateGlobalInstructions}
                    onClick={open}
                    data-testid="transport-details-global-instructions"
                >
                    <DataInfo
                        icon="instructions"
                        label={transports
                            .map((t) => t.instructions)
                            .filter((i) => !!i)
                            .join(" - ")}
                    />
                </ClickableUpdateRegion>
            </Box>
            {isOpen && (
                <GlobalInstructionsModal
                    transportUid={transports[0].uid}
                    globalInstructions={transports[0].instructions ?? ""}
                    onClose={close}
                />
            )}
        </>
    );
}
