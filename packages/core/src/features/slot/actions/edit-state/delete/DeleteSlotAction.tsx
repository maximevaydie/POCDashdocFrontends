import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useDispatch, useSelector} from "redux/hooks";
import {refreshFlow} from "redux/reducers/flow";
import {deleteSlot, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

import {DeleteSlotModal} from "./DeleteSlotModal";

type Props = {slot: Slot; onAction: () => void};

export function DeleteSlotAction({slot, onAction}: Props) {
    const [show, setShow, setHide] = useToggle(false);
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    return (
        <>
            <Button
                variant="plain"
                severity="danger"
                onClick={setShow}
                disabled={disabled}
                flexGrow={1}
            >
                {t("common.deleteBooking")}
            </Button>
            {show && (
                <DeleteSlotModal
                    title={t("common.deleteBooking")}
                    onSubmit={action}
                    onClose={setHide}
                    data-testid="delete-slot-modal"
                />
            )}
        </>
    );

    async function action() {
        await dispatch(deleteSlot(slot.id));
        await dispatch(refreshFlow());
        onAction();
        setHide();
    }
}
