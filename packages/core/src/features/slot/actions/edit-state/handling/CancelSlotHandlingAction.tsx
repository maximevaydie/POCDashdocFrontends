import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useDispatch, useSelector} from "redux/hooks";
import {refreshFlow} from "redux/reducers/flow";
import {cancelSlotHandling, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

import {CancelSlotHandlingModal} from "./CancelSlotHandlingModal";

type Props = {slot: Slot; onAction: () => void};

export function CancelSlotHandlingAction({slot, onAction}: Props) {
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    const [show, setShow, setHide] = useToggle(false);
    return (
        <>
            <Button variant="plain" onClick={setShow} disabled={disabled} flexGrow={1}>
                {t("common.cancelSlotHandling")}
            </Button>
            {show && (
                <CancelSlotHandlingModal
                    title={t("common.cancelSlotHandling")}
                    onClose={setHide}
                    onSubmit={action}
                    data-testid="cancel-handling-modal"
                />
            )}
        </>
    );

    async function action() {
        await dispatch(cancelSlotHandling(slot.id));
        await dispatch(refreshFlow());
        onAction();
        setHide();
    }
}
