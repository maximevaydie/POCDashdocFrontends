import {Logger, t} from "@dashdoc/web-core";
import {MultipleActionsButton, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {ArrowButton} from "features/ArrowButton";
import {ConfirmSlotCustomHourModal} from "features/slot/actions/edit-state/ConfirmSlotCustomHourModal";
import React from "react";
import {refreshFlow, useDispatch, useSelector} from "redux/reducers/flow";
import {selectSite} from "redux/reducers/flow/site.slice";
import {confirmSlotHandling, isUpdating} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {tz} from "services/date";
import {Slot, TzDate} from "types";

type Props = {slot: Slot; onAction: () => void};

export function ConfirmSlotHandlingCustomHourAction({slot, onAction}: Props) {
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);
    const site = useSelector(selectSite);
    let limitDate: TzDate | undefined;
    if (site) {
        const date = slot.arrived_at;
        if (date) {
            limitDate = tz.convert(date, site.timezone);
        }
    }

    const [show, setShow, setHide] = useToggle(false);
    const multiSlotBookingOption = {
        name: t("flow.confirmAndSetCustomTime"),
        onClick: setShow,
        testId: "custom-hour",
    };
    const additionalOptions = [multiSlotBookingOption];
    return (
        <>
            <MultipleActionsButton
                ButtonComponent={ArrowButton}
                width="12%"
                marginLeft="1px"
                optionsPositionTop="-105%"
                optionsPositionRight="0"
                disabled={disabled}
                options={additionalOptions}
                onOptionSelected={() => {}}
            />
            {show && (
                <ConfirmSlotCustomHourModal
                    actionLabel={t("common.confirmHandling")}
                    onSubmit={action}
                    onClose={setHide}
                    limitDate={limitDate}
                />
            )}
        </>
    );

    async function action(timestamp: string) {
        try {
            const actionResult = await dispatch(confirmSlotHandling({id: slot.id, timestamp}));
            if (actionService.containsError(actionResult)) {
                toast.error(actionService.getError(actionResult));
                return;
            }
            await dispatch(refreshFlow());
            onAction();
        } catch (e) {
            Logger.error(e);
            toast.error(t("common.error"));
        }
    }
}
