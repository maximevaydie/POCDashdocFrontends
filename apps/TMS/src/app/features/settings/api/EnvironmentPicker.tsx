import {t} from "@dashdoc/web-core";
import {Box, Flex, Radio, Text} from "@dashdoc/web-ui";
import React from "react";

interface EnvironmentPickerProps {
    switchEnvironment: (goToProduction: boolean) => void;
    isOnProductionEnvironment: boolean;
    disablePickingOnProduction: boolean;
    disabled: boolean;
}

type Environment = "production" | "sandbox";

export const EnvironmentPicker = ({
    switchEnvironment,
    isOnProductionEnvironment,
    disablePickingOnProduction,
    disabled,
}: EnvironmentPickerProps) => {
    const environment = import.meta.env.MODE;
    const display = environment !== "prod" || !disablePickingOnProduction;
    const onChange = (value: Environment) => {
        switchEnvironment(value === "production");
    };
    return (
        <>
            {display && (
                <Box>
                    <Text variant="captionBold" my={2}>
                        {t("settings.environmentPicker")}
                    </Text>
                    <Flex flexDirection={"column"}>
                        <Radio
                            label={t("settings.trackdechets.environment.production")}
                            value={"production"}
                            onChange={onChange}
                            checked={isOnProductionEnvironment}
                            disabled={disabled}
                        />
                        <Radio
                            label={t("settings.trackdechets.environment.test")}
                            value={"sandbox"}
                            onChange={onChange}
                            checked={!isOnProductionEnvironment}
                            disabled={disabled}
                        />
                    </Flex>
                </Box>
            )}
        </>
    );
};
