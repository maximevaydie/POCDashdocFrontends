import {getMessageFromErrorCode} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {AnyAction} from "redux";
import {useDispatch, useSelector} from "redux/hooks";
import {refreshFlow} from "redux/reducers/flow";
import {cancelSlot, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

import {CancelSlotModal} from "./CancelSlotModal";

type Props = {slot: Slot; onAction: () => void};

export function CancelSlotAction({slot, onAction}: Props) {
    const [show, setShow, setHide] = useToggle(false);
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    return (
        <>
            <Button
                data-testid="cancel-slot-button"
                variant="plain"
                severity="danger"
                onClick={setShow}
                disabled={disabled}
                width="100%"
            >
                {t("common.cancel")}
            </Button>
            {show && <CancelSlotModal onSubmit={action} onClose={setHide} />}
        </>
    );

    async function action(reason: string) {
        try {
            const cancelSlotResult = (await dispatch(
                cancelSlot({
                    id: slot.id,
                    reason,
                })
            )) as unknown as AnyAction;
            if (cancelSlotResult.payload?.non_field_errors?.code) {
                const errorCode = cancelSlotResult.payload?.non_field_errors?.code[0];
                toast.error(getMessageFromErrorCode(errorCode) || t("common.unknownError"));
                return;
            }
            await dispatch(refreshFlow());
            onAction();
            setHide();
        } catch (e) {
            Logger.error(e);
        }
    }
}
