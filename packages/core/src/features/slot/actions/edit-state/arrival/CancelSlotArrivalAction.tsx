import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useDispatch, useSelector} from "redux/hooks";
import {refreshFlow} from "redux/reducers/flow";
import {cancelSlotArrival, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

import {CancelSlotArrivalModal} from "./CancelSlotArrivalModal";

type Props = {slot: Slot; onAction: () => void};

export function CancelSlotArrivalAction({slot, onAction}: Props) {
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    const [show, setShow, setHide] = useToggle(false);
    return (
        <>
            <Button variant="plain" onClick={setShow} disabled={disabled} flexGrow={1}>
                {t("common.cancelArrivalOnSite")}
            </Button>
            {show && (
                <CancelSlotArrivalModal
                    title={t("common.cancelArrivalOnSite")}
                    onClose={setHide}
                    onSubmit={action}
                    data-testid="testId"
                />
            )}
        </>
    );

    async function action() {
        await dispatch(cancelSlotArrival(slot.id));
        await dispatch(refreshFlow());
        onAction();
        setHide();
    }
}
