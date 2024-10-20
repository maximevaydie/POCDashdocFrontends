import {t} from "@dashdoc/web-core";
import {Box, Flex, Link, LoadingWheel, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {ArrivedEvent} from "features/slot/slot-panel/slot-history/components/ArrivedEvent";
import {CancelledEvent} from "features/slot/slot-panel/slot-history/components/CancelledEvent";
import {CompletedEvent} from "features/slot/slot-panel/slot-history/components/CompletedEvent";
import {CreatedEvent} from "features/slot/slot-panel/slot-history/components/CreatedEvent";
import {DefaultEvent} from "features/slot/slot-panel/slot-history/components/DefaultEvent";
import {HandledEvent} from "features/slot/slot-panel/slot-history/components/HandledEvent";
import {RescheduledEvent} from "features/slot/slot-panel/slot-history/components/RescheduledEvent";
import React, {Fragment, ReactElement} from "react";
import {tz} from "services/date";
import {
    ArrivedSlotEvent,
    CancelledSlotEvent,
    CompletedSlotEvent,
    CreatedSlotEvent,
    DefaultSlotEvent,
    HandledSlotEvent,
    RescheduledSlotEvent,
    SlotEvent,
} from "types";

export type Props = {
    slotEvents: SlotEvent[] | null; // null means loading
    timezone: string;
};

export function SlotHistory({slotEvents, timezone}: Props) {
    return (
        <Flex flexDirection="column" flexGrow={1}>
            <Box flexGrow={1} overflowY="auto" height="100px">
                {slotEvents === null ? (
                    <LoadingWheel />
                ) : (
                    <>
                        {slotEvents.length === 0 && <Text>{t("common.emptyInstructions")}</Text>}
                        {slotEvents.map((slotEvent, key) => (
                            <Fragment key={slotEvent.id}>
                                {key !== 0 && <HorizontalLine />}

                                <EventSwitch slotEvent={slotEvent} timezone={timezone} />
                            </Fragment>
                        ))}
                    </>
                )}
            </Box>
        </Flex>
    );
}

function EventSwitch({slotEvent, timezone}: {slotEvent: SlotEvent; timezone: string}) {
    let content: ReactElement;

    switch (slotEvent.category) {
        case "created":
            content = (
                <CreatedEvent slotEvent={slotEvent as CreatedSlotEvent} timezone={timezone} />
            );
            break;
        case "arrived":
            content = (
                <ArrivedEvent slotEvent={slotEvent as ArrivedSlotEvent} timezone={timezone} />
            );
            break;
        case "handled":
            content = (
                <HandledEvent slotEvent={slotEvent as HandledSlotEvent} timezone={timezone} />
            );
            break;
        case "completed":
            content = (
                <CompletedEvent slotEvent={slotEvent as CompletedSlotEvent} timezone={timezone} />
            );
            break;
        case "rescheduled":
            content = (
                <RescheduledEvent
                    slotEvent={slotEvent as RescheduledSlotEvent}
                    timezone={timezone}
                />
            );
            break;
        case "cancelled":
            content = <CancelledEvent slotEvent={slotEvent as CancelledSlotEvent} />;
            break;
        default:
            content = <DefaultEvent slotEvent={slotEvent as DefaultSlotEvent} />;
    }
    const {
        created_at,
        author: {email},
    } = slotEvent;
    return (
        <Box py={2}>
            {content}
            <Flex alignItems="center">
                <Text variant="captionBold" color="grey.dark">
                    {t("common.onDateAtTime", {
                        date: tz.format({date: created_at, timezone}, "P"),
                        time: tz.format({date: created_at, timezone}, "p"),
                    })}
                    {` ${t("common.by").toLowerCase()} `}
                </Text>
                <Link ml={1} fontSize={1} href={`mailto:${email}`}>
                    {email}
                </Link>
            </Flex>
        </Box>
    );
}
