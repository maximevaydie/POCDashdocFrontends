import {t} from "@dashdoc/web-core";
import {Box, Flex, Link, NumberInput, Text} from "@dashdoc/web-ui";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React, {useMemo} from "react";

import {RefreshCarbonFootprintButton} from "app/features/transport/transport-information/carbon-footprint/RefreshCarbonFootprintButton";

import type {Transport} from "app/types/transport";

type EmissionValueDescriptionProps = {
    transport: Transport;
    computation: TransportCarbonFootprintResponse;
    useManualEmissionValueIfPossible?: boolean;
    displayDescriptionOnFailure?: boolean;
    refreshCarbonFootprint?: (params?: {
        distance?: number | null;
        transportOperationCategory?: Transport["transport_operation_category"];
    }) => Promise<void>;
};

export function EmissionValueDescription({
    transport,
    computation,
    useManualEmissionValueIfPossible,
    displayDescriptionOnFailure,
    refreshCarbonFootprint,
}: EmissionValueDescriptionProps) {
    const {value, usingManualValue} = useMemo(() => {
        if (
            useManualEmissionValueIfPossible &&
            computation.manual_method.emission_value !== null
        ) {
            return {value: computation.manual_method.emission_value, usingManualValue: true};
        }

        return {value: computation.estimated_method.emission_value, usingManualValue: false};
    }, [
        computation.manual_method.emission_value,
        computation.estimated_method.emission_value,
        useManualEmissionValueIfPossible,
    ]);

    const description = useMemo(() => {
        if (
            useManualEmissionValueIfPossible &&
            computation.manual_method.emission_value !== null
        ) {
            return (
                <Text mb={4}>
                    {t("carbonFootprint.manualDescription")} <FindOutMoreLink />
                </Text>
            );
        }

        if (value === null) {
            if (!displayDescriptionOnFailure) {
                return;
            }

            return (
                <Text mb={4}>
                    {t("carbonFootprint.failedDescription")} <FindOutMoreLink />
                </Text>
            );
        }

        if (computation.estimated_method.method_used === "dashdoc.legacy") {
            return (
                <Text mb={4}>
                    {t("carbonFootprint.legacyDescription")} <FindOutMoreLink />
                </Text>
            );
        }

        if (computation.estimated_method.method_used === "dashdoc.shipper") {
            return (
                <Text mb={4}>
                    {t("carbonFootprint.shipperDescription", {
                        requestedVehicle: transport.requested_vehicle?.label,
                    })}{" "}
                    <FindOutMoreLink />
                </Text>
            );
        }

        return (
            <Text
                mb={4}
                // It includes <strong>
                dangerouslySetInnerHTML={{
                    __html: t("carbonFootprint.isoDescription"), // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
                }}
            />
        );
    }, [
        computation.estimated_method.method_used,
        computation.manual_method.emission_value,
        displayDescriptionOnFailure,
        transport.requested_vehicle?.label,
        useManualEmissionValueIfPossible,
        value,
    ]);

    return (
        <>
            {description}
            <Flex mb={4} alignItems="center" flexDirection="row">
                <Flex flex={1} maxWidth="300px" mr={4}>
                    <Box width="100%">
                        <NumberInput
                            maxDecimals={2}
                            onChange={() => {}}
                            disabled
                            value={value}
                            key={value}
                            label={t("carbonFootprint.fieldLabel")}
                            units={t("components.carbonFootprint.unit")}
                        />
                    </Box>
                </Flex>
                {!usingManualValue && (
                    <RefreshCarbonFootprintButton
                        transport={transport}
                        refreshCarbonFootprint={refreshCarbonFootprint || undefined}
                    />
                )}
            </Flex>
        </>
    );
}

function FindOutMoreLink() {
    return (
        <Link
            href="https://help.dashdoc.eu/fr/articles/6138895-comment-connaitre-la-quantite-d-emission-co2-de-ma-prestation-de-transport"
            target="_blank"
            rel="noopener noreferrer"
            lineHeight={1}
        >
            {t("common.findOutMore")}
        </Link>
    );
}
