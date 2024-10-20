import {t} from "@dashdoc/web-core";
import {Flex, Tabs} from "@dashdoc/web-ui";
import {SlotDetails} from "features/slot/slot-panel/slot-details/SlotDetails";
import React from "react";
import {FlowProfile, Site, Slot, Zone} from "types";
import {SlotEvent} from "types/slotEvent";

import {SlotHistory} from "./slot-history/SlotHistory";

export type SlotPanelProps = {
    site: Site;
    slot: Slot;
    zone: Zone;
    profile: FlowProfile;
    timezone: string;
    slotEvents: SlotEvent[] | null;
};

export function SlotPanel({site, slot, zone, profile, timezone, slotEvents}: SlotPanelProps) {
    return (
        <Flex px={5} py={2} flexGrow={1}>
            <Tabs
                tabs={[
                    {
                        label: t("components.details"),
                        testId: "slot-site-details",
                        content: (
                            <Flex mt={4} flexGrow={1}>
                                <SlotDetails
                                    site={site}
                                    slot={slot}
                                    zone={zone}
                                    profile={profile}
                                    timezone={timezone}
                                />
                            </Flex>
                        ),
                    },
                    {
                        label: t("settingsPlates.history"),
                        testId: "slot-site-history",
                        content: (
                            <Flex mt={4} flexGrow={1}>
                                <SlotHistory slotEvents={slotEvents} timezone={timezone} />
                            </Flex>
                        ),
                    },
                ]}
            />
        </Flex>
    );
}
