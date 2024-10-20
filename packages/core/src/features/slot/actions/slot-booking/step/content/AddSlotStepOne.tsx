import {t} from "@dashdoc/web-core";
import {Box, Flex, OnDesktop, OnMobile, Text} from "@dashdoc/web-ui";
import React from "react";
import {Control, Controller} from "react-hook-form";
import {Zone} from "types";

import {ZoneItem} from "./components/ZoneItem";

interface AddSlotStepOneProps {
    zones: Zone[];
    selectedZone: Zone | null;
    control: Control<any, object>;
    onSelectZone: (zone: Zone) => Promise<void>;
}

export function AddSlotStepOne({zones, selectedZone, control, onSelectZone}: AddSlotStepOneProps) {
    const content = (
        <>
            {zones.map((zone) => (
                <Box margin={4} key={zone.id}>
                    <ZoneItem
                        zone={zone}
                        selectedZone={selectedZone}
                        onSelectZone={onSelectZone}
                    />
                </Box>
            ))}
        </>
    );
    return (
        <Box maxHeight="80vh">
            <Text paddingY={6} paddingX={6}>
                {t("flow.addSlot.selectZone")}
            </Text>
            <Controller
                name="zone"
                control={control}
                render={() => (
                    <>
                        <OnDesktop>
                            <Flex
                                maxHeight="60vh"
                                overflow="auto"
                                flexWrap="wrap"
                                justifyContent="center"
                            >
                                {content}
                            </Flex>
                        </OnDesktop>

                        <OnMobile>
                            <Box>{content}</Box>
                        </OnMobile>
                    </>
                )}
            />
        </Box>
    );
}
