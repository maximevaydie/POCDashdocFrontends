import {Box, Flex, Text} from "@dashdoc/web-ui";
import {CustomFieldCallout} from "features/slot/slot-panel/slot-details/callouts/CustomFieldCallout";
import React, {useState} from "react";
import {tz} from "services/date";
import {slotServices} from "services/slot.service";
import {FlowProfile, Site, Slot, Zone} from "types";

import {PrimaryActions} from "./actions/PrimaryActions";
import {SecondaryActions} from "./actions/SecondaryActions";
import {CompanyCallout} from "./callouts/CompanyCallout";
import {DateAndTime} from "./callouts/DateAndTime";
import {NotesCallout} from "./callouts/NotesCallout";
import {ReferenceCallout} from "./callouts/ReferenceCallout";
import {StatusCallout} from "./callouts/StatusCallout";

export type SlotPanelProps = {
    site: Site;
    slot: Slot;
    zone: Zone;
    profile: FlowProfile;
    timezone: string;
};

export function SlotDetails({site, slot, zone, profile, timezone}: SlotPanelProps) {
    const {start_time, end_time, state, cancel_reason} = slot;

    const startTime = tz.convert(start_time, timezone);
    const endTime = tz.convert(end_time, timezone);
    const {name} = zone;
    const {text, bigBadgeBgColor, bigBadgeTextColor} = slotServices.getSlotStateDisplay(
        slot,
        timezone
    );
    const [deleted, setDeleted] = useState(false);

    return (
        <Flex flexDirection="column" flexGrow={1}>
            {deleted && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    zIndex="modal"
                    width="100%"
                    height="100%"
                    backgroundColor="rgba(0, 0, 0, 0.4)"
                    data-testid="slot-side-panel-disabled-overlay"
                />
            )}
            <Box flexGrow={1} pb={5} mb={5} overflowY="auto" height="100px">
                <Box pb={3} borderBottom="1px solid" borderColor="grey.light">
                    <DateAndTime startTime={startTime} endTime={endTime} />
                    <Text>{name}</Text>
                    <StatusCallout
                        state={state}
                        backgroundColor={bigBadgeBgColor}
                        textColor={bigBadgeTextColor}
                        label={text}
                        cancelReason={cancel_reason}
                        deleted={deleted}
                    />
                    <SecondaryActions slot={slot} zone={zone} profile={profile} />
                </Box>
                {slot.custom_fields?.map((customField) => (
                    <CustomFieldCallout
                        key={customField.id}
                        customField={customField}
                        slot={slot}
                        profile={profile}
                    />
                ))}
                <ReferenceCallout slot={slot} profile={profile} />
                <CompanyCallout site={site} slot={slot} profile={profile} />
                <NotesCallout slot={slot} profile={profile} />
            </Box>
            {profile === "siteManager" && !deleted && (
                <Box px={5}>
                    <PrimaryActions
                        site={site}
                        slot={slot}
                        profile={profile}
                        onDelete={() => setDeleted(true)}
                    />
                </Box>
            )}
        </Flex>
    );
}
