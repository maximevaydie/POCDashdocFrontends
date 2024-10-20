import {addressDisplayService, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, NumberInput, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React from "react";

import type {Delivery, Site, Transport} from "app/types/transport";

type CompleteComputationDetailsProps = {
    transport: Transport;
    errors: TransportCarbonFootprintResponse["estimated_method"]["errors"];
    distanceOverride?: number | null;
    onDistanceOverrideChange?: (distance: number | null) => void;
};

export function FailedComputationDetails({
    transport,
    errors,
    distanceOverride,
    onDistanceOverrideChange,
}: CompleteComputationDetailsProps) {
    const hasCarbonFootprintIsoFF = useFeatureFlag("carbonfootprintiso");
    if (errors.length === 0 || !hasCarbonFootprintIsoFF) {
        return (
            <Flex alignItems="center">
                <Icon name="removeCircle" color="red.dark" mr={2} alignSelf="center" />
                <Text mr={1}>{t("carbonFootprint.failedDescription")}</Text> <FindOutMoreLink />
            </Flex>
        );
    }

    return (
        <Flex alignItems="center">
            <Text>{t("carbonFootprint.fixThoseProblems")}</Text>
            {errors.map((error, index) => (
                <Error
                    transport={transport}
                    error={error}
                    distanceOverride={distanceOverride}
                    onDistanceOverrideChange={onDistanceOverrideChange}
                    key={index}
                />
            ))}
            <FindOutMoreLink />
        </Flex>
    );
}

function Error({
    transport,
    error,
    distanceOverride,
    onDistanceOverrideChange,
}: {
    transport: Transport;
    error: TransportCarbonFootprintResponse["estimated_method"]["errors"][0];
    distanceOverride?: number | null;
    onDistanceOverrideChange?: (distance: number | null) => void;
}) {
    const content = (() => {
        if (error.error_type === "weight_missing") {
            return <WeightMissingError />;
        }
        if (error.error_type === "missing_address") {
            return <MissingDistanceError transport={transport} activityUid={error.activity_uid} />;
        }
        if (error.error_type === "address_without_geo_coords") {
            return (
                <AddressWithoutGeoCoordsError
                    transport={transport}
                    addressIds={[error.address_id]}
                />
            );
        }

        return (
            <DistanceNotFoundError
                distanceOverride={distanceOverride}
                onDistanceOverrideChange={onDistanceOverrideChange}
            />
        );
    })();

    return (
        <Flex my={4}>
            <Icon name="removeCircle" color="red.default" mr={4} />
            <Box flexGrow={1}>{content}</Box>
        </Flex>
    );
}

function WeightMissingError() {
    return (
        <>
            <Text display="inline" variant="h2" color="grey.dark">
                {t("carbonFootprint.weightMissing.header")}{" "}
            </Text>
            <Text display="inline">{t("carbonFootprint.weightMissing.weightMissing")}</Text>
        </>
    );
}

function DistanceNotFoundError({
    distanceOverride,
    onDistanceOverrideChange,
}: {
    distanceOverride?: number | null;
    onDistanceOverrideChange?: (distance: number | null) => void;
}) {
    return (
        <>
            <Text display="inline" variant="h2" color="grey.dark">
                {t("carbonFootprint.missingDistance.header")}{" "}
            </Text>
            <Text display="inline">{t("carbonFootprint.missingDistance.distanceNotFound")}</Text>
            <Flex mt={2}>
                <NumberInput
                    label={t("carbonFootprint.missingDistance.inputLabel")}
                    value={distanceOverride ?? null}
                    onChange={(value) =>
                        onDistanceOverrideChange && onDistanceOverrideChange(value)
                    }
                    units={t("carbonFootprint.missingDistance.inputUnit")}
                    width={250}
                />
                <Flex justifyContent="center" alignItems="center">
                    <TooltipWrapper content={t("carbonFootprint.missingDistance.tooltip")}>
                        <Icon ml={2} name="questionCircle" color="blue.default" />
                    </TooltipWrapper>
                </Flex>
            </Flex>
        </>
    );
}

function MissingDistanceError({
    transport,
    activityUid,
}: {
    transport: Transport;
    activityUid: string;
}) {
    const activity = transport.deliveries.reduce((acc: Site | null, delivery: Delivery) => {
        if (acc !== null) {
            return acc;
        }
        if (delivery.origin?.uid === activityUid) {
            return delivery.origin;
        }
        if (delivery.destination?.uid === activityUid) {
            return delivery.destination;
        }
        return null;
    }, null);

    return (
        <>
            <Text display="inline" variant="h2" color="grey.dark">
                {t("carbonFootprint.missingDistance.header")}{" "}
            </Text>
            <Text display="inline">
                {activity?.category === "loading"
                    ? t("carbonFootprint.missingDistance.missingLoadingAddress")
                    : t("carbonFootprint.missingDistance.missingUnloading")}
            </Text>
        </>
    );
}

function AddressWithoutGeoCoordsError({
    transport,
    addressIds,
}: {
    transport: Transport;
    addressIds: Array<number>;
}) {
    const addresses = transport.deliveries.reduce((acc: Array<Address>, delivery: Delivery) => {
        if (delivery.origin?.address?.pk && addressIds.includes(delivery.origin.address.pk)) {
            // TransportAddress is not compatible with Address
            const address: Address = delivery.origin.address as any as Address;
            acc = [...acc, address];
        }
        if (
            delivery.destination?.address?.pk &&
            addressIds.includes(delivery.destination.address.pk)
        ) {
            // TransportAddress is not compatible with Address
            const address: Address = delivery.destination.address as any as Address;
            acc = [...acc, address];
        }
        return acc;
    }, []);
    return (
        <>
            <Text display="inline" variant="h2" color="grey.dark">
                {t("carbonFootprint.missingDistance.header")}{" "}
            </Text>
            <ul>
                {addresses.map((address) => (
                    <li key={address.pk}>
                        <Text
                            dangerouslySetInnerHTML={{
                                __html: t(
                                    "carbonFootprint.missingDistance.addressWithoutGeoCoords",
                                    {
                                        address:
                                            addressDisplayService.getActivityAddressLabel(address),
                                    }
                                ),
                            }}
                        />
                    </li>
                ))}
            </ul>
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
            {t("carbonFootprint.seeHelpDeskArticle")}
        </Link>
    );
}
