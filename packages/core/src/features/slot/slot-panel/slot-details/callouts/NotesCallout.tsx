import {Logger, t} from "@dashdoc/web-core";
import {Box, Flex, Icon, NotesInput, Text, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {CustomCallout} from "features/slot/slot-panel/slot-details/callouts/CustomCallout";
import React from "react";
import {useDispatch} from "react-redux";
import {refreshFlow} from "redux/reducers/flow";
import {updateSlot} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {rightPolicyServices} from "services/rightPolicy.service";
import {FlowProfile, Slot} from "types";

type Props = {slot: Slot; profile: FlowProfile};

export function NotesCallout({slot, profile}: Props) {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();
    const {id: slotId} = slot;
    const note = slot.note ?? "";
    const isMutable = rightPolicyServices.canUpdateSlot(slot, profile, "notes");

    const emptyMessageFlow = (
        <Flex>
            <Icon svgWidth="16px" svgHeight="16px" name="add" mr={1} color="blue.default" />
            <Text ml={2} color="blue.default" width="300px">
                {t("common.addNotes")}
            </Text>
        </Flex>
    );

    return (
        <Box mt={6}>
            <Text variant="h1" color="grey.dark">
                {t("unavailability.notes")}
            </Text>
            <CustomCallout mt={2}>
                <NotesInput
                    hoverStyle={{bg: "transparent"}}
                    value={note}
                    disabled={isSubmitting || !isMutable}
                    emptyMessage={emptyMessageFlow}
                    onUpdate={handleUpdate}
                />
            </CustomCallout>
        </Box>
    );

    async function handleUpdate(updatedNotes: string): Promise<void> {
        setIsSubmitting();
        try {
            const actionResult = await dispatch(
                updateSlot({id: slotId, payload: {note: updatedNotes}})
            );
            if (actionService.containsError(actionResult)) {
                toast.error(actionService.getError(actionResult));
                return;
            }
            await dispatch(refreshFlow());
        } catch (e) {
            Logger.error(e);
        } finally {
            setIsSubmitted();
        }
    }
}
