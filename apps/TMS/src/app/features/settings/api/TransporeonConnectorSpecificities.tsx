import {t} from "@dashdoc/web-core";
import {Box, Flex, Radio} from "@dashdoc/web-ui";
import React from "react";

import {ExtensionsConnectorPayload} from "app/features/settings/hooks/useCrudConnector";

export function TransporeonConnectorSpecificities({
    values,
    setFieldValue,
    disabled,
}: {
    values: ExtensionsConnectorPayload;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    disabled: boolean;
}) {
    return (
        <>
            {values["license_plate_transmission"] && (
                <>
                    <Box justifyContent="space-between" mb={2}>
                        <Flex ml={4} flexDirection={"column"}>
                            <Radio
                                name="license_plate_type"
                                label={t("settings.licensePlateTransmission.engines")}
                                value="vehicles"
                                checked={
                                    values["license_plate_type"] === undefined ||
                                    values["license_plate_type"] === "vehicles"
                                }
                                onChange={(value) => setFieldValue("license_plate_type", value)}
                                disabled={disabled}
                            />
                            <Radio
                                name="license_plate_type"
                                label={t("settings.licensePlateTransmission.trailers")}
                                value="trailers"
                                checked={values["license_plate_type"] === "trailers"}
                                onChange={(value) => setFieldValue("license_plate_type", value)}
                                disabled={disabled}
                            />
                        </Flex>
                    </Box>
                </>
            )}
        </>
    );
}
