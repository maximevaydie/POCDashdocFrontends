import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, NumberInput, SwitchInput} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";

export function MaxVisibilityConstrains() {
    const {watch} = useFormContext();
    const max_visibility: number = watch("max_visibility");
    const label = <Flex>{t("flow.settings.zoneSetupTab.bookingConstraints.opening")}</Flex>;
    const active = max_visibility !== null;
    return (
        <Box>
            <Flex>
                <Controller
                    name="max_visibility"
                    render={({field}) => (
                        <SwitchInput
                            {...field}
                            labelRight={label}
                            value={active}
                            onChange={(values) => {
                                if (values) {
                                    field.onChange(1);
                                } else {
                                    field.onChange(null);
                                }
                            }}
                        />
                    )}
                />
            </Flex>
            {active && (
                <Box my={2} ml={2} pl={6} borderLeft={"1px solid"} borderLeftColor="grey.light">
                    <Controller
                        name="max_visibility"
                        render={({field}) => {
                            return (
                                <NumberInput
                                    {...field}
                                    units={t("common.day")}
                                    width="100%"
                                    aria-label={t(
                                        "flow.settings.zoneSetupTab.bookingConstraints.numberOfDayPriorToBooking"
                                    )}
                                    label={t(
                                        "flow.settings.zoneSetupTab.bookingConstraints.numberOfDayPriorToBooking"
                                    )}
                                    data-testid="settings-zones-visibility-max"
                                    required
                                    min={1}
                                />
                            );
                        }}
                    />
                    {max_visibility > 0 && (
                        <Callout mt={2}>
                            {t("flow.settings.zoneSetupTab.maxVisibilityDetail", {
                                number: max_visibility,
                            })}
                        </Callout>
                    )}
                </Box>
            )}
        </Box>
    );
}
