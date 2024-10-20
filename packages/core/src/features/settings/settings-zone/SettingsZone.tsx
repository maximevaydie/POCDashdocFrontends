import {Flex} from "@dashdoc/web-ui";
import {SettingsZoneSetupEmpty} from "features/settings/settings-zone/settings-zone-setup-empty/SettingsZoneSetupEmpty";
import React, {useState} from "react";
import {Site, Zone} from "types";

import {CreateZoneForm} from "./CreateZoneForm";
import {EditZoneForm} from "./EditZoneForm";
import {SettingsZoneList} from "./SettingsZoneList";

type Props = {
    site: Site;
    zones: Zone[];
};
export function SettingsZone({site, zones}: Props) {
    const defaultZoneId = zones.length > 0 ? zones[0].id : null;
    const [selectedZoneId, setSelectedZoneId] = useState(defaultZoneId);
    const [mode, setMode] = useState<"create" | "edit">("edit");
    const zone = selectedZoneId !== null ? zones.find((zone) => zone.id === selectedZoneId) : null;

    return (
        <Flex width="100%" backgroundColor="grey.white" mt={2} borderRadius={2}>
            <Flex
                flexDirection="column"
                flexWrap="wrap"
                flexGrow={1}
                flex={1}
                borderRight="1px solid"
                borderColor="grey.light"
                p={2}
            >
                <SettingsZoneList
                    zones={zones}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={handleZoneSelect}
                    onAddZoneClick={handleAddZoneClick}
                />
            </Flex>
            <Flex flexDirection="column" flexGrow={1} flex={3} px={7} py={5}>
                {mode === "create" ? (
                    <CreateZoneForm site={site} onCreate={handleZoneCreated} />
                ) : (
                    zone && <EditZoneForm key={selectedZoneId} site={site} zone={zone} />
                )}
                {zones.length === 0 && (
                    <SettingsZoneSetupEmpty onAddZoneClick={handleAddZoneClick} />
                )}
            </Flex>
        </Flex>
    );

    function handleAddZoneClick() {
        setMode("create");
        setSelectedZoneId(null);
    }

    function handleZoneCreated(zone: Zone) {
        setSelectedZoneId(zone.id);
        setMode("edit");
    }

    function handleZoneSelect(zoneId: number) {
        setSelectedZoneId(zoneId);
        setMode("edit");
    }
}
