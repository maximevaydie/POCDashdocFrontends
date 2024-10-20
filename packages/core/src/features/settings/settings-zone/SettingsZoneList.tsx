import {t} from "@dashdoc/web-core";
import {Button, Icon, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";
import {Zone} from "types";

type Props = {
    zones: Zone[];
    selectedZoneId: number | null;
    onSelectZone: (zoneId: number) => void;
    onAddZoneClick: () => void;
};

const ZoneItem = styled(Text)<{selected: boolean}>`
    cursor: pointer;

    background-color: ${({selected}) =>
        selected ? theme.colors.blue.ultralight : theme.colors.grey.white};

    &:hover {
        background-color: ${() => theme.colors.grey.light};
    }
`;

export function SettingsZoneList({zones, selectedZoneId, onSelectZone, onAddZoneClick}: Props) {
    return (
        <>
            <Text variant="h1" m={4}>
                {t("flow.settings.zoneSetupTab.zonesListTitle")}
            </Text>
            {zones.map((zone) => (
                <ZoneItem
                    key={zone.id}
                    color="grey.ultradark"
                    px={4}
                    py={2}
                    selected={zone.id === selectedZoneId}
                    onClick={() => onSelectZone(zone.id)}
                >
                    {zone.name}
                </ZoneItem>
            ))}
            <Button variant="plain" justifyContent="left" onClick={onAddZoneClick}>
                <Icon name="plusSign" mr={2} />
                {t("flow.settings.zoneSetupTab.addZoneButton")}
            </Button>
        </>
    );
}
