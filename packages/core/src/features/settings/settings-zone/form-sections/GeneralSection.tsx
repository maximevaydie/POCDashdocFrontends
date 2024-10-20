import {t} from "@dashdoc/web-core";
import {TextInput, TextArea} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";

import {SettingsFormSection} from "../../SettingsFormSection";

export function GeneralSection() {
    return (
        <SettingsFormSection title={t("flow.settings.generalSection")} mt={4}>
            <Controller
                name="name"
                defaultValue=""
                rules={{required: "Name is required"}}
                render={({field}) => (
                    <TextInput
                        {...field}
                        label={t("flow.settings.zoneSetupTab.nameLabel")}
                        data-testid="settings-zones-setup-tab-name-input"
                    />
                )}
            />
            <Controller
                name="description"
                defaultValue=""
                rules={{required: "Description is required"}}
                render={({field}) => (
                    <TextArea
                        {...field}
                        label={t("flow.settings.zoneSetupTab.descriptionLabel")}
                        data-testid="settings-zones-setup-tab-description-input"
                        mt={2}
                    />
                )}
            />
        </SettingsFormSection>
    );
}
