import {t} from "@dashdoc/web-core";
import {Box, Circled, ModeTypeSelector, Text} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";

import {SettingsFormSection} from "../../SettingsFormSection";

export type Mode = false | true;

export function SettingsSiteConfigurationFields() {
    return (
        <SettingsFormSection title={t("settings.statusesManagement")} maxWidth="auto">
            <Controller
                name="use_slot_handled_state"
                render={({field}) => (
                    <Box mt={4}>
                        <ModeTypeSelector<Mode>
                            data-testid="settings-site-tab-use-slot-handled-statuses-selector"
                            modeList={[
                                {
                                    value: false,
                                    label: t("common.status_countable", {smart_count: 3}),
                                    icon: (isChecked) => (
                                        <NumberIcon isChecked={isChecked} num={3} />
                                    ),
                                    calloutLabel: (
                                        <Text
                                            dangerouslySetInnerHTML={{
                                                __html: t("settings.3statusesCallout"),
                                            }}
                                        ></Text>
                                    ),
                                },
                                {
                                    value: true,
                                    label: t("common.status_countable", {smart_count: 4}),
                                    icon: (isChecked) => (
                                        <NumberIcon isChecked={isChecked} num={4} />
                                    ),
                                    calloutLabel: (
                                        <Text
                                            dangerouslySetInnerHTML={{
                                                __html: t("settings.4statusesCallout"),
                                            }}
                                        ></Text>
                                    ),
                                },
                            ]}
                            currentMode={field.value}
                            setCurrentMode={(newValue) => {
                                field.onChange(newValue);
                            }}
                        />
                    </Box>
                )}
            />
        </SettingsFormSection>
    );
}

export function NumberIcon({isChecked, num}: {isChecked: boolean; num: number}) {
    const color = isChecked ? "blue.default" : "grey.dark";
    return (
        <Circled borderColor={color}>
            <Text variant="h1" color={color}>
                {num}
            </Text>
        </Circled>
    );
}
