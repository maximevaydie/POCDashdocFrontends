import {ModerationButton, getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, FloatingPanel, FloatingPanelHeader, OnDesktop, OnMobile} from "@dashdoc/web-ui";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useDispatch, useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectProfile, selectedSlot} from "redux/reducers/flow";
import {selectSite} from "redux/reducers/flow/site.slice";
import {unselectSlot} from "redux/reducers/flow/slot.slice";
import {selectSlotEvents} from "redux/reducers/flow/slotEvents.slice";
import {selectZoneById} from "redux/reducers/flow/zone.slice";

import {SlotPanel} from "./SlotPanel";

export function SlotFloatingPanel() {
    const site = useSelector(selectSite);
    const manager = useSelector(getConnectedManager);
    const timezone = useSiteTimezone();
    const slot = useSelector(selectedSlot);
    const profile = useSelector(selectProfile);
    const zone = useSelector((state: RootState) =>
        slot ? selectZoneById(state, slot.zone) : null
    );
    const slotEvents = useSelector((state: RootState) =>
        slot ? selectSlotEvents(state, slot.id) : null
    );
    const dispatch = useDispatch();
    if (!site || !slot || !zone) {
        return null;
    }

    return (
        <>
            <OnDesktop>
                <FloatingPanel
                    width="400px"
                    onClose={close}
                    backgroundColor="grey.white"
                    data-testid="slot-side-panel"
                >
                    <Flex flexDirection="column" height="100%">
                        <Box px={5} pt={4}>
                            <FloatingPanelHeader
                                title={t("common.bookingDetails")}
                                onClose={close}
                            >
                                <ModerationButton
                                    manager={manager}
                                    path={`../admin/flow/flowslot/${slot.id}/change/`}
                                />
                            </FloatingPanelHeader>
                        </Box>
                        <SlotPanel
                            site={site}
                            slot={slot}
                            zone={zone}
                            profile={profile}
                            timezone={timezone}
                            slotEvents={slotEvents}
                        />
                    </Flex>
                </FloatingPanel>
            </OnDesktop>
            <OnMobile>
                <Box
                    width="100%"
                    height="100%"
                    backgroundColor="grey.ultralight"
                    position="absolute"
                    top="0"
                    zIndex="modal"
                    data-testid="slot-side-panel"
                >
                    <Flex flexDirection="column" width="100vw" height="100%">
                        <Box px={5} pt={4}>
                            <FloatingPanelHeader
                                title={t("common.bookingDetails")}
                                onClose={close}
                            />
                        </Box>
                        <SlotPanel
                            site={site}
                            zone={zone}
                            slot={slot}
                            profile={profile}
                            timezone={timezone}
                            slotEvents={slotEvents}
                        />
                    </Flex>
                </Box>
            </OnMobile>
        </>
    );

    function close() {
        dispatch(unselectSlot());
    }
}
