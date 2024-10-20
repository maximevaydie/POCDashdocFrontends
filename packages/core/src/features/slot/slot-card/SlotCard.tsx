import {t} from "@dashdoc/web-core";
import {Icon, TooltipWrapper, useDevice} from "@dashdoc/web-ui";
import {SlotStateBadge} from "features/slot/slot-state-badge/SlotStateBadge";
import {SlotTooltip} from "features/slot/slot-tooltip/SlotTooltip";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {tz} from "services/date";
import {slotServices} from "services/slot.service";
import {Slot, Zone} from "types";

import {Card} from "./card/Card";

export type Props = {
    slot: Slot;
    zone: Zone;
    overload: boolean;
    onClick?: () => void;
};

export function SlotCard({slot, zone, overload, onClick}: Props) {
    const timezone = useSiteTimezone();
    const date = tz.convert(slot.start_time, timezone);
    const start = tz.format(date, "HH:mm");
    const isIrregular = slotServices.isIrregular(slot, zone, timezone);
    const customFields = slotServices.getCardCustomFields(slot, zone);
    const customFieldValues = customFields.map((field) => field.value);
    const device = useDevice();
    return (
        <TooltipWrapper content={<SlotTooltip slot={slot} />} hidden={device !== "desktop"}>
            <Card
                data-testid={`slot-card-${slot.id}`}
                start={start}
                overload={overload}
                end={
                    isIrregular ? (
                        <TooltipWrapper content={t("flow.exceptionalSlotBooking")}>
                            <Icon name="clock" data-testid="irregular-slot" />
                        </TooltipWrapper>
                    ) : undefined
                }
                onClick={onClick}
                topText={slot.references?.join(", ") ?? ""}
                bottomText={slot.company.name}
                additionalTopTexts={customFieldValues}
                rightComponent={<SlotStateBadge slot={slot} />}
            />
        </TooltipWrapper>
    );
}
