import {t, TranslationKeys} from "@dashdoc/web-core";
import {Box, Checkbox, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

interface AvailableService {
    key: string;
    label: TranslationKeys;
    value: boolean;
    error: string | undefined;
    onChange: (checked: boolean) => void;
    disabled: boolean;
}

interface ShippersPlatformServicesPickerProp {
    availableServices: AvailableService[];
    disabled: boolean;
}

export const ShippersPlatformServicesPicker = ({
    availableServices,
    disabled,
}: ShippersPlatformServicesPickerProp) => {
    return (
        <>
            <Text variant="captionBold" my={2}>
                {t("settings.requestedServices")}
            </Text>
            {availableServices.map((service) => (
                <Flex justifyContent="space-between" key={service.key}>
                    <Box flexBasis="100%" mb={2}>
                        <Checkbox
                            label={t(service.label)}
                            checked={service.value}
                            onChange={(checked) => service.onChange(checked)}
                            error={service.error}
                            disabled={disabled || service.disabled}
                        />
                    </Box>
                </Flex>
            ))}
        </>
    );
};
