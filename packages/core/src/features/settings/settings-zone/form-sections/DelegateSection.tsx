import {t} from "@dashdoc/web-core";
import React from "react";
import {Controller} from "react-hook-form";

import {SettingsFormSection} from "../../SettingsFormSection";

import {DelegateToggle} from "./components/delegate-toggle/DelegateToggle";

export function DelegateSection() {
    return (
        <SettingsFormSection title={t("flow.settings.zoneSetupTab.delegation")} mt={8}>
            <Controller
                name="delegable"
                defaultValue={true}
                render={({field: {onChange, value}}) => (
                    <DelegateToggle
                        leftLabel={t("flow.settings.zoneSetupTab.delegableZone")}
                        rightLabel={t("flow.settings.zoneSetupTab.nonDelegableZone")}
                        value={value}
                        onChange={(newValue) => onChange(newValue)}
                    />
                )}
            />
        </SettingsFormSection>
    );
}
