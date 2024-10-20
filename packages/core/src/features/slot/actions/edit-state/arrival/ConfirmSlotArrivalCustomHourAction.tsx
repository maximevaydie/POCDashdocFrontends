import {t} from "@dashdoc/web-core";
import {MultipleActionsButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {ArrowButton} from "features/ArrowButton";
import {ConfirmSlotCustomHourModal} from "features/slot/actions/edit-state/ConfirmSlotCustomHourModal";
import React from "react";
import {refreshFlow, useDispatch, useSelector} from "redux/reducers/flow";
import {confirmSlotArrival, isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot} from "types";

type Props = {slot: Slot; onAction: () => void};

export function ConfirmSlotArrivalCustomHourAction({slot, onAction}: Props) {
    const dispatch = useDispatch();
    const disabled = useSelector(isUpdating);

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
                    actionLabel={t("common.confirmSiteArrival")}
                    onSubmit={action}
                    onClose={setHide}
                />
            )}
        </>
    );

    async function action(timestamp: string) {
        await dispatch(confirmSlotArrival({id: slot.id, timestamp}));
        await dispatch(refreshFlow());
        onAction();
    }
}
