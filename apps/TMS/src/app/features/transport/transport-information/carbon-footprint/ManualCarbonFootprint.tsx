import {t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, NumberInput, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

type ManualCarbonFootprintProps = {
    manualEmissionValue: number | null;
    onChangeManuelEmissionValue(value: number | null): void;
};

export function ManualCarbonFootprint({
    manualEmissionValue,
    onChangeManuelEmissionValue,
}: ManualCarbonFootprintProps) {
    return (
        <Flex flexDirection="column">
            <Flex flexDirection="row" alignItems="center">
                <Box flexGrow="1" maxWidth="400px" mr={2}>
                    <NumberInput
                        label={t("components.carbonFootprint.userCarbonFootprintLabel")}
                        value={manualEmissionValue}
                        onChange={onChangeManuelEmissionValue}
                        units={t("components.carbonFootprint.unit")}
                        data-testid="manual-carbon-footprint-input"
                    />
                </Box>
                <TooltipWrapper
                    content={t("components.carbonFootprint.removeUserCarbonFootprint")}
                >
                    <IconButton
                        onClick={() => onChangeManuelEmissionValue(null)}
                        fontSize={3}
                        data-testid="manual-carbon-footprint-clear-button"
                        name="bin"
                    />
                </TooltipWrapper>
            </Flex>
        </Flex>
    );
}
