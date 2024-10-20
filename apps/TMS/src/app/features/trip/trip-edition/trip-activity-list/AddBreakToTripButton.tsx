import {t} from "@dashdoc/web-core";
import {Button, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {AddBreakToTripModal} from "app/features/trip/trip-edition/trip-activity-list/AddBreakToTripModal";

type Props = {
    tripUid: string;
    activityAfterBreakUid: string | null;
    canAddBreak: boolean;
};
export function AddBreakToTripButton({tripUid, activityAfterBreakUid, canAddBreak}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    return (
        <>
            <TooltipWrapper content={t("components.addBulkingBreak")} placement="right">
                <Button
                    variant="secondary"
                    data-testid="add-break-button"
                    width="1.5em"
                    height="1.5em"
                    borderRadius="100%"
                    px={0}
                    py={0}
                    mr={1}
                    onClick={openModal}
                    style={{
                        visibility: canAddBreak && activityAfterBreakUid ? "visible" : "hidden",
                    }}
                >
                    <Icon
                        name="add"
                        fontFamily="monospace"
                        color="grey.dark"
                        scale={[0.5, 0.5]}
                        mt={"1px"}
                    />
                </Button>
            </TooltipWrapper>
            {isModalOpen && activityAfterBreakUid && (
                <AddBreakToTripModal
                    onClose={closeModal}
                    onSubmit={closeModal}
                    tripUid={tripUid}
                    activityAfterBreakUid={activityAfterBreakUid}
                />
            )}
        </>
    );
}
//
