import {Box, Flex} from "@dashdoc/web-ui";
import {CancelSlotArrivalAction} from "features/slot/actions/edit-state/arrival/CancelSlotArrivalAction";
import {ConfirmSlotArrivalAction} from "features/slot/actions/edit-state/arrival/ConfirmSlotArrivalAction";
import {ConfirmSlotArrivalCustomHourAction} from "features/slot/actions/edit-state/arrival/ConfirmSlotArrivalCustomHourAction";
import {CancelSlotCompletedAction} from "features/slot/actions/edit-state/competed/CancelSlotCompletedAction";
import {ConfirmSlotCompletedAction} from "features/slot/actions/edit-state/competed/ConfirmSlotCompletedAction";
import {ConfirmSlotCompletedCustomHourAction} from "features/slot/actions/edit-state/competed/ConfirmSlotCompletedCustomHourAction";
import {DeleteSlotAction} from "features/slot/actions/edit-state/delete/DeleteSlotAction";
import {CancelSlotHandlingAction} from "features/slot/actions/edit-state/handling/CancelSlotHandlingAction";
import {ConfirmSlotHandlingAction} from "features/slot/actions/edit-state/handling/ConfirmSlotHandlingAction";
import {ConfirmSlotHandlingCustomHourAction} from "features/slot/actions/edit-state/handling/ConfirmSlotHandlingCustomHourAction";
import React, {ReactNode} from "react";
import {rightPolicyServices} from "services/rightPolicy.service";
import {FlowProfile, Site, Slot} from "types";

type Props = {
    site: Site;
    slot: Slot;
    profile: FlowProfile;
    onDelete: () => void;
};

function doNothing() {}

export function PrimaryActions({site, slot, profile, onDelete}: Props) {
    let content: ReactNode | null = null;
    const isMutable = rightPolicyServices.canUpdateSlot(slot, profile, "state");
    if (isMutable) {
        switch (slot.state) {
            case "planned":
                content = (
                    <Flex flexGrow={1}>
                        <ConfirmSlotArrivalAction slot={slot} onAction={doNothing} />
                        <ConfirmSlotArrivalCustomHourAction slot={slot} onAction={doNothing} />
                    </Flex>
                );
                break;
            case "arrived":
                content = (
                    <Flex flexGrow={1} flexDirection="column" style={{gap: "10px"}}>
                        <CancelSlotArrivalAction slot={slot} onAction={doNothing} />
                        {site.use_slot_handled_state ? (
                            <Flex flexGrow={1}>
                                <ConfirmSlotHandlingAction slot={slot} onAction={doNothing} />
                                <ConfirmSlotHandlingCustomHourAction
                                    slot={slot}
                                    onAction={doNothing}
                                />
                            </Flex>
                        ) : (
                            <Flex flexGrow={1}>
                                <ConfirmSlotCompletedAction slot={slot} onAction={doNothing} />
                                <ConfirmSlotCompletedCustomHourAction
                                    slot={slot}
                                    onAction={doNothing}
                                />
                            </Flex>
                        )}
                    </Flex>
                );
                break;
            case "handled":
                content = (
                    <Flex flexGrow={1} flexDirection="column" style={{gap: "10px"}}>
                        <CancelSlotHandlingAction slot={slot} onAction={doNothing} />
                        <Flex flexGrow={1}>
                            <ConfirmSlotCompletedAction slot={slot} onAction={doNothing} />
                            <ConfirmSlotCompletedCustomHourAction
                                slot={slot}
                                onAction={doNothing}
                            />
                        </Flex>
                    </Flex>
                );
                break;
            case "completed":
                content = <CancelSlotCompletedAction slot={slot} onAction={doNothing} />;
                break;
            case "cancelled":
                content = <DeleteSlotAction slot={slot} onAction={onDelete} />;
                break;
        }
    }
    if (content) {
        return (
            <Box
                py={3}
                verticalAlign="top"
                borderTop="1px solid"
                borderColor="grey.light"
                width="100%"
            >
                <Flex flexGrow={1} style={{gap: "10px"}}>
                    {content}
                </Flex>
            </Box>
        );
    }
    return null;
}
