import {t} from "@dashdoc/web-core";
import {Box, Flex, NumberInput} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";

import {SettingsFormSection} from "../../SettingsFormSection";

interface Props {
    editMode?: boolean;
}

export function SlotSection({editMode}: Props) {
    return (
        <SettingsFormSection title={t("flow.settings.zoneSetupTab.slotsSection")} mt={8}>
            <Flex flexDirection="row" flexGrow={1}>
                <Controller
                    name="slot_duration"
                    defaultValue={30}
                    render={({field}) => (
                        <Box flexGrow={1}>
                            <NumberInput
                                {...field}
                                width="100%"
                                disabled={editMode}
                                aria-label={t("flow.settings.zoneSetupTab.slotDurationLabel")}
                                label={t("flow.settings.zoneSetupTab.slotDurationLabel")}
                                data-testid="settings-zones-setup-tab-slot-duration-input"
                                mr={2}
                            />
                        </Box>
                    )}
                />
                <Controller
                    name="concurrent_slots"
                    defaultValue={1}
                    render={({field}) => (
                        <Box flexGrow={1}>
                            <NumberInput
                                {...field}
                                minWidth="200px"
                                disabled={editMode}
                                aria-label={t("flow.settings.zoneSetupTab.concurrentSlotsLabel")}
                                label={t("flow.settings.zoneSetupTab.concurrentSlotsLabel")}
                                data-testid="settings-zones-setup-tab-concurrent-slots-input"
                            />
                        </Box>
                    )}
                />
            </Flex>
        </SettingsFormSection>
    );
}
