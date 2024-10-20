import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useSelector} from "redux/hooks";
import {isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot, Zone} from "types";

import {RescheduleModal} from "./modals/RescheduleModal";
type Props = {slot: Slot; zone: Zone};

export function RescheduleSlotAction({slot, zone}: Props) {
    const disabled = useSelector(isUpdating);
    const [show, setShow, setHide] = useToggle(false);
    return (
        <>
            <Button
                variant="plain"
                onClick={setShow}
                disabled={disabled}
                width="100%"
                data-testid="reschedule-slot-button"
            >
                {t("common.reschedule")}
            </Button>
            {show && (
                <RescheduleModal
                    title={t("flow.rescheduleTheBooking")}
                    slot={slot}
                    zone={zone}
                    onClose={setHide}
                    onSubmit={setHide}
                    data-testid="reschedule-slot-form-modal"
                />
            )}
        </>
    );
}
