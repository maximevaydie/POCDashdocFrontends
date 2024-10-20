import {t} from "@dashdoc/web-core";
import {Box, Flex, TextInput} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";
import {Site} from "types";

import {SettingsFormSection} from "../../SettingsFormSection";

type Props = {
    company: {name: string};
    site: Site;
};

export function SettingsSiteGeneralFields({company}: Props) {
    return (
        <Flex flexDirection="column">
            <SettingsFormSection title={t("flow.settings.generalSection")} flex={1}>
                {/* name is a property of the company, not the site */}
                <TextInput
                    value={company.name}
                    width={"100%"}
                    label={t("flow.settings.infoTab.nameLabel")}
                    data-testid="settings-site-tab-name-input"
                    disabled
                    onChange={() => {}}
                />
            </SettingsFormSection>

            <SettingsFormSection title={t("flow.settings.contactSection")} flex={1} mt={4}>
                <Controller
                    name="contact_email"
                    render={({field, fieldState}) => (
                        <TextInput
                            {...field}
                            width={"100%"}
                            label={t("common.email")}
                            error={fieldState.error?.message}
                            data-testid="settings-site-tab-contact-email-input"
                        />
                    )}
                />
                <Box mt={2}>
                    <Controller
                        name="contact_phone"
                        render={({field, fieldState}) => (
                            <TextInput
                                {...field}
                                width={"100%"}
                                label={t("common.phoneNumber")}
                                data-testid="settings-site-tab-contact-phone-input"
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                </Box>
            </SettingsFormSection>
        </Flex>
    );
}
