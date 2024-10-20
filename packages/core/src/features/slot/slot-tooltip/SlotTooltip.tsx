import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {SlotStateBadge} from "features/slot/slot-state-badge/SlotStateBadge";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectZoneById} from "redux/reducers/flow/zone.slice";
import {tz} from "services/date";
import {Slot} from "types";
type Props = {
    slot: Slot;
};
export function SlotTooltip({slot}: Props) {
    const timezone = useSiteTimezone();
    const startDate = tz.convert(slot.start_time, timezone);
    const start = tz.format(startDate, "HH:mm");
    const endDate = tz.convert(slot.end_time, timezone);
    const end = tz.format(endDate, "HH:mm");
    const time = `${start} ${t("common.to")} ${end}`;

    const zone = useSelector((state: RootState) => selectZoneById(state, slot.zone));

    const customFields = slot.custom_fields ?? [];
    return (
        <Box maxWidth="320px" p={4}>
            <Text variant="h1">{slot.company.name}</Text>
            <Flex justifyContent="space-between" mt={2}>
                <Flex flexDirection="column">
                    <Text variant="subcaption">{time}</Text>
                    {zone && <Text variant="subcaption">{zone.name}</Text>}
                </Flex>
                <Box>
                    <SlotStateBadge slot={slot} />
                </Box>
            </Flex>
            <HorizontalLine />
            {slot.references && slot.references.length > 0 && (
                <>
                    <Text variant="h2">{t("common.references")}</Text>
                    <Box as="ul" pl={2}>
                        {slot.references.map((reference, index) => (
                            <Box
                                as="li"
                                style={{
                                    display: "list-item",
                                    listStyle: "inside",
                                    wordWrap: "break-word",
                                }}
                                key={`${index}-${reference}`}
                            >
                                <Text as="span" variant="caption">
                                    {reference}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                </>
            )}
            {customFields.length > 0 && (
                <>
                    {customFields.map((customField) => (
                        <Box mt={2} py={2} key={`${customField.id}-${customField.label}`}>
                            <Text variant="h2">{customField.label}</Text>
                            <Text
                                variant="caption"
                                style={{
                                    wordWrap: "break-word",
                                }}
                            >
                                {customField.value}
                            </Text>
                        </Box>
                    ))}
                </>
            )}
        </Box>
    );
}
