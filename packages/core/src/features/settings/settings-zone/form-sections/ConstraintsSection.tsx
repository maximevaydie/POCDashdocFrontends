import {t} from "@dashdoc/web-core";
import {Flex, SwitchInput, Icon, Box} from "@dashdoc/web-ui";
import {TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";

import {SettingsFormSection} from "../../SettingsFormSection";

import {MaxVisibilityConstrains} from "./constraints/MaxVisibilityConstrains";
import {NoticePeriodConstraints} from "./constraints/NoticePeriodConstraints";

export function ConstraintsSection() {
    const bookingInTurnsLabel = (
        <Flex justifyContent="center">
            {t("flow.settings.zoneSetupTab.bookingInTurns")}
            <Box ml={2}>
                <TooltipWrapper content={t("flow.settings.zoneSetupTab.bookingInTurnsTooltip")}>
                    <Icon name={"info"} scale={1.2} width={19} height={19} />
                </TooltipWrapper>
            </Box>
        </Flex>
    );
    return (
        <SettingsFormSection title={t("flow.settings.zoneSetupTab.bookingConstraints")} mt={8}>
            <Flex mt={2} flexDirection="column" flexGrow={1}>
                <MaxVisibilityConstrains />
                <NoticePeriodConstraints />
                <Flex mt={3}>
                    <Controller
                        name="booking_in_turns"
                        render={({field}) => (
                            <SwitchInput {...field} labelRight={bookingInTurnsLabel} />
                        )}
                    />
                </Flex>
            </Flex>
        </SettingsFormSection>
    );
}
