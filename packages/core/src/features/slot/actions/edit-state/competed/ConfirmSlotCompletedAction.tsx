import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import React from "react";
import {refreshFlow, useDispatch, useSelector} from "redux/reducers/flow";
import {completeSlot, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

type Props = {slot: Slot; onAction: () => void};

export function ConfirmSlotCompletedAction({slot, onAction}: Props) {
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    return (
        <Button
            data-testid="confirm-activity-button"
            onClick={action}
            disabled={disabled}
            borderRadius={0}
            borderTopLeftRadius={1}
            borderBottomLeftRadius={1}
            flexGrow={1}
        >
            {t("common.confirmEndOfActivity")}
        </Button>
    );

    async function action() {
        await dispatch(completeSlot({id: slot.id}));
        await dispatch(refreshFlow());
        onAction();
    }
}
