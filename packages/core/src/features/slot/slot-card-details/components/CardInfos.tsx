import {Box, Text} from "@dashdoc/web-ui";
import React from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectZoneById} from "redux/reducers/flow/zone.slice";
import {slotServices} from "services/slot.service";
import {Slot} from "types";

export type Props = {
    slot: Slot;
};

export function CardInfos(props: Props) {
    const {slot} = props;
    const zone = useSelector((state: RootState) => selectZoneById(state, slot.zone));
    const customFields = zone ? slotServices.getCardCustomFields(slot, zone) : [];

    return (
        <Box>
            <Text variant="h2" color="grey.ultradark">
                {slot.references?.join(", ") ?? ""}
            </Text>
            {customFields.map((customField) => (
                <Text
                    key={`${customField.id}-${customField.label}`}
                    variant="captionBold"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    width="100%"
                >
                    {customField.value}
                </Text>
            ))}
            <Text marginTop={2} color="grey.dark">
                {slot.company.name}
            </Text>
            {zone && (
                <Text marginY="2" color="grey.dark">
                    {zone.name}
                </Text>
            )}
        </Box>
    );
}
