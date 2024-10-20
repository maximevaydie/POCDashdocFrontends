import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, MultipleActionsButton} from "@dashdoc/web-ui";
import {ArrowButton} from "features/ArrowButton";
import React from "react";
import {useDispatch} from "react-redux";
import {useSelector} from "redux/hooks";
import {selectProfile} from "redux/reducers/flow";
import {selectSite} from "redux/reducers/flow/site.slice";
import {showMultiSlotBooking, showSlotBooking} from "redux/reducers/flow/slot.slice";
import {selectZones} from "redux/reducers/flow/zone.slice";

/**
 * SlotBookingModal is a Global modal, we use the redux store to open it.
 */
export function SlotBookingAction() {
    const dispatch = useDispatch();
    const zones = useSelector(selectZones);
    const site = useSelector(selectSite);

    const multiSlotBookingOption = {
        name: t("flow.addBookings"),
        onClick: handleMultiSlotBooking,
    };
    const additionalOptions = [multiSlotBookingOption];
    const disabled = site !== null && zones.length <= 0;

    const profile = useSelector(selectProfile);
    const isMultiSlotBookingEnabled = profile === "siteManager" || profile === "delegate";
    return (
        <Flex flexGrow={1}>
            <Button
                variant="primary"
                onClick={handleSlotBooking}
                width="100%"
                data-testid="add-slot-button"
                disabled={disabled}
                borderRadius={isMultiSlotBookingEnabled ? 0 : 1}
                borderTopLeftRadius={1}
                borderBottomLeftRadius={1}
            >
                <Icon name="add" mr={2} />
                {t("flow.sidebar.addBookingButton")}
            </Button>
            {isMultiSlotBookingEnabled && (
                <MultipleActionsButton
                    ButtonComponent={ArrowButton}
                    width="12%"
                    marginLeft="1px"
                    optionsPositionTop="105%"
                    disabled={disabled}
                    options={additionalOptions}
                    onOptionSelected={() => {}}
                />
            )}
        </Flex>
    );

    function handleSlotBooking() {
        dispatch(showSlotBooking());
    }
    function handleMultiSlotBooking() {
        dispatch(showMultiSlotBooking());
    }
}
