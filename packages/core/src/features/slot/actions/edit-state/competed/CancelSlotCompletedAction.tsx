import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import React from "react";
import {refreshFlow, useDispatch, useSelector} from "redux/reducers/flow";
import {cancelSlotCompletion, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

type Props = {slot: Slot; onAction: () => void};

export function CancelSlotCompletedAction({slot, onAction}: Props) {
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    return (
        <Button
            data-testid="button-cancel-end-activity"
            variant="plain"
            onClick={action}
            disabled={disabled}
            flexGrow={1}
        >
            {t("common.cancelEndOfActivity")}
        </Button>
    );

    async function action() {
        await dispatch(cancelSlotCompletion(slot.id));
        await dispatch(refreshFlow());
        onAction();
    }
}
