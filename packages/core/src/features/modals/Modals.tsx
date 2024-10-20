import {fetchAccount, isAuthenticated, storeService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {WelcomeModal} from "features/modals/WelcomeModal";
import {MultiSlotBookingFeedbackModal} from "features/slot/actions/slot-booking/MultiSlotBookingFeedbackModal";
import {SlotBookingModal} from "features/slot/actions/slot-booking/SlotBookingModal";
import React from "react";
import {useSelector} from "react-redux";
import {useDispatch} from "redux/hooks";
import {RootState} from "redux/reducers";
import {refreshFlow, selectProfile} from "redux/reducers/flow";
import {
    firstTimeAsDelegateClose,
    selectFirstTimeAsDelegate,
    selectSite,
} from "redux/reducers/flow/site.slice";
import {
    hideMultiSlotBooking,
    hideSlotBooking,
    multiSlotBookingInProgress,
    selectMultiSlotBookingFeedback,
    setMultiSlotBookingFeedback,
    slotBookingInProgress,
} from "redux/reducers/flow/slot.slice";
import {selectZones} from "redux/reducers/flow/zone.slice";

/**
 * All global modals should be rendered here.
 */
export function Modals() {
    const isAuth = useSelector(isAuthenticated);
    const slotBooking = useSelector(slotBookingInProgress);
    const multiSlotBooking = useSelector(multiSlotBookingInProgress);
    const multiSlotFeedback = useSelector(selectMultiSlotBookingFeedback);
    const zones = useSelector(selectZones);
    const firstTimeAsDelegate = useSelector(selectFirstTimeAsDelegate);
    const site = useSelector(selectSite);
    const dispatch = useDispatch();
    const displayBookingModal = site && (slotBooking || multiSlotBooking);
    const displayWelcomeModal = !displayBookingModal && site && firstTimeAsDelegate;
    return (
        <>
            {displayBookingModal && (
                <SlotBookingModal
                    title={multiSlotBooking ? t("flow.makeBookings") : t("flow.makeABooking")}
                    data-testid={multiSlotBooking ? "add-slots-form-modal" : "add-slot-form-modal"}
                    site={site}
                    zones={zones}
                    isMulti={multiSlotBooking}
                    onClose={handleHideBookingModal}
                />
            )}
            {displayWelcomeModal && <WelcomeModal site={site} onClose={handleHideWelcomeModal} />}
            {multiSlotFeedback && (
                <MultiSlotBookingFeedbackModal
                    nbTotal={multiSlotFeedback.expected.length}
                    nbCreated={multiSlotFeedback.created.length}
                    nbAborted={multiSlotFeedback.aborted.length}
                    onClose={handleHideFeedbackModal}
                />
            )}
        </>
    );

    function handleHideWelcomeModal() {
        dispatch(firstTimeAsDelegateClose());
    }

    async function handleHideBookingModal() {
        if (site) {
            // Anyway, we need to refresh the flow to be sync with the backend
            await dispatch(refreshFlow());
        }
        /**
         * If the user is a guest, we need to fetch the account to turn to delegate.
         * If the user stay a guest, there is an issue...
         */
        let profile = await selectProfile(storeService.getState<RootState>());
        if (isAuth && profile === "guest") {
            await dispatch(fetchAccount({silently: false}));
            // integrity check, the profile should not be a guest anymore
            profile = await selectProfile(storeService.getState<RootState>());
            if (profile === "guest") {
                Logger.error(
                    "The user company is still a guest after refetching, something goes wrong"
                );
            }
        }
        await dispatch(hideSlotBooking());
        await dispatch(hideMultiSlotBooking());
    }

    function handleHideFeedbackModal() {
        dispatch(setMultiSlotBookingFeedback(null));
    }
}
