import {t} from "@dashdoc/web-core";
import {Flex, Icon, NumberInput, Text} from "@dashdoc/web-ui";
import {
    ActivityTurnoverData,
    formatNumberWithCustomUnit,
    formatNumber,
    SplitMethod,
    ActivityTurnoverAddressData,
} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {Controller} from "react-hook-form";

import {MeanDetails} from "app/features/transport/transport-details/transport-details-activities/split-means-turnover/MeanDetails";

interface AutomaticMeanTurnoverCardProps {
    splitMethod: SplitMethod;
    totalSegments: number;
    priceWithoutPurchaseCosts: number | null;
    turnoverData: ActivityTurnoverData;
}

export const AutomaticMeanTurnoverCard: FunctionComponent<AutomaticMeanTurnoverCardProps> = ({
    splitMethod,
    totalSegments,
    priceWithoutPurchaseCosts,
    turnoverData,
}) => {
    const weight = turnoverData.automatic_data.weight;
    const price =
        priceWithoutPurchaseCosts !== null && weight !== null
            ? priceWithoutPurchaseCosts * parseFloat(weight)
            : null;

    return (
        <Flex border="1px solid" borderColor="grey.lighter" height={140}>
            <Flex
                flexDirection="column"
                borderRight={"1px solid"}
                borderColor={"grey.lighter"}
                height="100%"
                flexBasis={"72%"}
            >
                <Flex p={2} borderBottom={"1px solid"} borderColor={"grey.lighter"} height="50%">
                    <Text variant="h2" color="grey.ultradark">
                        {getAddressText(turnoverData.starting_address)}
                        <Icon
                            name="arrowRightFull"
                            mx={2}
                            verticalAlign={"middle"}
                            fontWeight={"600"}
                        />
                        {getAddressText(turnoverData.arrival_address)}
                        <Text
                            ml={2}
                            as="span"
                            variant="captionBold"
                            color="grey.dark"
                            fontWeight={"400"}
                        >
                            {splitMethod === "segments" &&
                                t("splitMeansTurnover.countSegments", {
                                    segment: turnoverData.automatic_data.segments_count,
                                    total_segments: totalSegments,
                                    smart_count: totalSegments,
                                })}
                            {splitMethod === "distance" &&
                                formatNumberWithCustomUnit(
                                    turnoverData.automatic_data.distance,
                                    {
                                        unit: t("common.units.km"),
                                    },
                                    {maximumFractionDigits: 0},
                                    (formattedNumber) => formattedNumber
                                )}
                        </Text>
                    </Text>
                </Flex>
                <Flex p={2} flexDirection={"column"} height="50%">
                    <MeanDetails
                        means={turnoverData.means}
                        childTransport={turnoverData.child_transport}
                    />
                </Flex>
            </Flex>
            <Flex
                flexDirection="column"
                p={2}
                backgroundColor={"grey.ultralight"}
                flexBasis={"28%"}
            >
                <Text variant="caption" color="grey.ultradark">
                    {t("splitMeansTurnover.shareOfTurnover")}
                </Text>
                <Text variant="title" color="grey.ultradark">
                    {formatNumber(weight, {
                        style: "percent",
                        maximumFractionDigits: 2,
                    })}
                </Text>
                <Text variant="caption" color="grey.ultradark" mt={3}>
                    {t("common.total")}
                </Text>
                <Text variant="h1">
                    {formatNumber(price, {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            </Flex>
        </Flex>
    );
};

interface ManualMeanTurnoverCardProps {
    index: number;
    totalSegments: number;
    priceWithoutPurchaseCosts: number | null;
    userInputWeight: number | null;
    turnoverData: ActivityTurnoverData;
}

export const ManualMeanTurnoverCard: FunctionComponent<ManualMeanTurnoverCardProps> = ({
    index,
    totalSegments,
    priceWithoutPurchaseCosts,
    userInputWeight,
    turnoverData,
}) => {
    const price =
        priceWithoutPurchaseCosts !== null && userInputWeight !== null
            ? (priceWithoutPurchaseCosts * userInputWeight) / 100
            : null;
    return (
        <Flex border="1px solid" borderColor="grey.lighter" minHeight={140}>
            <Flex
                flexDirection="column"
                borderRight={"1px solid"}
                borderColor={"grey.lighter"}
                height="100%"
                flexBasis={"68%"}
            >
                <Flex p={2} borderBottom={"1px solid"} borderColor={"grey.lighter"} height="50%">
                    <Text variant="h2" color="grey.ultradark">
                        {getAddressText(turnoverData.starting_address)}
                        <Icon
                            name="arrowRightFull"
                            mx={2}
                            verticalAlign={"middle"}
                            fontWeight={"600"}
                        />
                        {getAddressText(turnoverData.arrival_address)}
                        <Text
                            ml={2}
                            as="span"
                            variant="captionBold"
                            color="grey.dark"
                            fontWeight={"400"}
                        >
                            {turnoverData.automatic_data.segments_count !== 0
                                ? t("splitMeansTurnover.countSegments", {
                                      segment: turnoverData.automatic_data.segments_count,
                                      total_segments: totalSegments,
                                      smart_count: totalSegments,
                                  })
                                : formatNumberWithCustomUnit(
                                      turnoverData.automatic_data.distance,
                                      {
                                          unit: t("common.units.km"),
                                      },
                                      {maximumFractionDigits: 0},
                                      (formattedNumber) => formattedNumber
                                  )}
                        </Text>
                    </Text>
                </Flex>
                <Flex p={2} flexDirection={"column"} height="50%">
                    <MeanDetails
                        means={turnoverData.means}
                        childTransport={turnoverData.child_transport}
                    />
                </Flex>
            </Flex>
            <Flex
                flexDirection="column"
                p={2}
                backgroundColor={"grey.ultralight"}
                flexBasis={"46%"}
            >
                <Controller
                    name={`customSplitTurnover.${index}.weight`}
                    render={({field, fieldState: {error}}) => (
                        <NumberInput
                            required
                            textAlign="left"
                            label={t("splitMeansTurnover.shareOfTurnover")}
                            min={0}
                            max={100}
                            maxDecimals={2}
                            units="%"
                            {...field}
                            error={error?.message}
                        />
                    )}
                />

                <Text variant="caption" color="grey.ultradark" mt={3}>
                    {t("common.total")}
                </Text>
                <Text variant="h1">
                    {formatNumber(price, {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            </Flex>
        </Flex>
    );
};

function getAddressText(address: ActivityTurnoverAddressData | null) {
    if (address === null) {
        return t("components.addressNotProvided");
    }

    const cleanAddressInfo = [address.name, address.postcode, address.city, address.country]
        .filter((value) => value !== "")
        .map((value) => value.trim());
    return cleanAddressInfo.join(", ");
}
