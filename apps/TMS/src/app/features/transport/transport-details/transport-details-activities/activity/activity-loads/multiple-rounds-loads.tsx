import {formatVolume, t} from "@dashdoc/web-core";
import {Box, ClickableUpdateRegion, Flex, Icon, Text} from "@dashdoc/web-ui";
import {ActivityType} from "dashdoc-utils/dist";
import groupBy from "lodash.groupby";
import isNil from "lodash.isnil";
import * as React from "react";

import {ActivityLoadCard} from "./activity-load-card";
import {getRealTitle} from "./utils";
import {getWeightExtractionStatus, WeightExtractionRow} from "./weight-extraction";

import type {Activity, Delivery, Load, Round} from "app/types/transport";

type Props = {
    activity: Activity;
    realLoadsUpdatesAllowed: boolean;
    onLoadClick: (delivery: Delivery, load: Load, siteType: ActivityType) => unknown;
    onEmptyLoadClick: (round_id: number) => unknown;
    background?: string;
    clickable: boolean;
    canSeeWeightExtraction: boolean;
};

const DEFAULT_TEXT_EMPTY_LOAD = "—";

const getRoundQuantities = (load: Partial<Load> | null): string => {
    if (!load) {
        return DEFAULT_TEXT_EMPTY_LOAD;
    }

    const quantities = [];
    if (!isNil(load.weight)) {
        quantities.push(`${load.weight} kg`);
    }

    if (!isNil(load.volume) && !isNil(load.volume_display_unit)) {
        quantities.push(formatVolume(load.volume, {unit: load.volume_display_unit}));
    }

    return quantities ? quantities.join(", ") : DEFAULT_TEXT_EMPTY_LOAD;
};

const getRoundsTotal = (
    rounds: Round[],
    keyToLoad: "origin_load" | "destination_load"
): string => {
    let weightSubTotal: number | null = null;
    let volumeSubTotal: number | null = null;

    for (const round of rounds) {
        const load = round[keyToLoad];
        if (!load) {
            continue;
        }

        const weight = load.weight === undefined || load.weight === null ? null : load.weight;
        const volume = load.volume === undefined || load.volume === null ? null : load.volume;

        if (weightSubTotal === null) {
            weightSubTotal = weight;
        } else {
            weightSubTotal += weight ?? 0;
        }

        if (volumeSubTotal === null) {
            volumeSubTotal = volume;
        } else {
            volumeSubTotal += volume ?? 0;
        }
    }

    const volumeDisplayUnit =
        rounds.length > 0 ? rounds[0][keyToLoad]?.volume_display_unit : undefined;

    return getRoundQuantities({
        weight: weightSubTotal,
        volume: volumeSubTotal,
        volume_display_unit: volumeDisplayUnit,
    });
};

export function MultipleRoundsLoads({
    activity,
    realLoadsUpdatesAllowed,
    onEmptyLoadClick,
    onLoadClick,
    background = "grey.ultralight",
    clickable,
    canSeeWeightExtraction,
}: Props) {
    const rounds = activity.deliveries[0].rounds;
    const keyToLoad = activity.type === "loading" ? "origin_load" : "destination_load";

    // Empty rounds goes in group with the planned load description
    const plannedLoad = activity.deliveries[0].planned_loads?.[0];
    const plannedLoadDescription = plannedLoad?.description;
    const groupedRoundsByDescription = groupBy(
        rounds,
        (r) =>
            r.destination_load?.description || r.origin_load?.description || plannedLoadDescription
    );

    const dataTestId = `${activity.type}-multiple-rounds-load`;

    const total = getRoundsTotal(rounds, keyToLoad);

    const loadTexts = Object.keys(groupedRoundsByDescription).map((description) => {
        const rounds = groupedRoundsByDescription[description];
        const loadsDivs = rounds.map((round) => {
            const load = round[keyToLoad];
            return (
                <ClickableUpdateRegion
                    key={`${activity.type}-${round.round_id}`}
                    clickable={realLoadsUpdatesAllowed}
                    onClick={() =>
                        load
                            ? onLoadClick(activity.deliveries[0], load, activity.type)
                            : onEmptyLoadClick(round.round_id)
                    }
                    data-testid={`${dataTestId}-real-${round.round_id}`}
                >
                    <Text variant="caption" color="grey.dark">{`${t("components.round", {
                        round_number: round.round_id,
                    })}: ${getRoundQuantities(load)}`}</Text>
                </ClickableUpdateRegion>
            );
        });
        const subTotal = getRoundsTotal(rounds, keyToLoad);
        if (Object.keys(groupedRoundsByDescription).length > 1) {
            const groupIndex = Object.keys(groupedRoundsByDescription).indexOf(description);
            loadsDivs.push(
                <Text
                    variant="caption"
                    color="grey.dark"
                    fontWeight="bold"
                    data-testid={`${dataTestId}-real-subtotal-${groupIndex}`}
                >{`${t("common.subtotal")}: ${description}, ${subTotal}`}</Text>
            );
        }
        return loadsDivs;
    });

    const description = rounds.length
        ? Object.keys(groupedRoundsByDescription).join(", ")
        : plannedLoad.description;

    const informations = rounds.length
        ? [
              ...new Set(
                  rounds.reduce((informations, round) => {
                      if (round[keyToLoad]?.complementary_information) {
                          // @ts-ignore
                          informations.push(round[keyToLoad].complementary_information);
                      }
                      return informations;
                  }, [])
              ),
          ].join(", ")
        : plannedLoad.complementary_information;

    const truckerObservations = rounds
        .map((round) => [round.round_id, round[keyToLoad]?.trucker_observations])
        .filter(([, observation]) => !!observation)
        .map(
            ([roundId, observation]) => `${t("common.roundN", {round_id: roundId})} ${observation}`
        )
        .join(", ");

    let weightExtractionStatus;
    let weightExtractionInProgress;
    let extractedWeight;
    let uniqueRealLoad;
    if (canSeeWeightExtraction) {
        const allNonEmptyLoads = rounds.map((round) => round[keyToLoad]).filter(Boolean);
        if (allNonEmptyLoads.length === 1) {
            weightExtractionInProgress =
                activity.type == "loading"
                    ? activity.deliveries[0].origin_weight_extraction_in_progress
                    : activity.deliveries[0].destination_weight_extraction_in_progress;
            extractedWeight =
                activity.type == "loading"
                    ? activity.deliveries[0].origin_extracted_weight
                    : activity.deliveries[0].destination_extracted_weight;
            uniqueRealLoad = allNonEmptyLoads[0];
            weightExtractionStatus = getWeightExtractionStatus(
                // @ts-ignore
                weightExtractionInProgress,
                extractedWeight,
                uniqueRealLoad
            );
        }
    }

    return (
        <>
            <ActivityLoadCard
                clickable={clickable}
                onClick={() => onLoadClick(activity.deliveries[0], plannedLoad, activity.type)}
                background={
                    truckerObservations
                        ? "red.ultralight"
                        : weightExtractionStatus === "notValidated"
                          ? "yellow.ultralight"
                          : background
                }
                dataTestId={dataTestId}
            >
                <Flex flexDirection="column" width="100%">
                    <Flex alignItems="center">
                        <Icon name="load" color="grey.dark" mr={3} />
                        <Flex
                            flexDirection="column"
                            flex={4}
                            overflow="hidden"
                            data-testid={`${dataTestId}-description`}
                        >
                            {description}
                            <Text color="grey.dark" variant="caption">
                                {informations}
                            </Text>
                        </Flex>
                        <Flex
                            flexDirection="column"
                            flex={1}
                            overflow="hidden"
                            height="100%"
                            data-testid={`${dataTestId}-planned`}
                        >
                            <Text variant="caption">{t("activityLoads.planned")}</Text>
                            <Text fontWeight="bold" data-testid={`${dataTestId}-planned-quantity`}>
                                {!!plannedLoad && getRoundQuantities(plannedLoad)}
                            </Text>
                        </Flex>
                        <Flex
                            flexDirection="column"
                            flex={1}
                            overflow="hidden"
                            height="100%"
                            data-testid={`${dataTestId}-real`}
                        >
                            <Text variant="caption">{getRealTitle(activity.type)}</Text>
                            <Text fontWeight="bold" data-testid={`${dataTestId}-real-quantity`}>
                                {!!rounds.length && `${t("common.total")}: ${total}`}
                            </Text>
                        </Flex>
                    </Flex>
                    {!!rounds.length && (
                        <Flex mt={3}>
                            <Box width="1.15em" mr={3} />
                            <Flex
                                flexDirection="column"
                                flex={5}
                                overflow="hidden"
                                borderTopColor="grey.light"
                                borderTopWidth={1}
                                borderTopStyle="solid"
                            >
                                <Text color="grey.dark" variant="caption" mt={2}>
                                    {t("load.roundsDetailTitle")}
                                </Text>
                            </Flex>
                            <Flex
                                flexDirection="column"
                                flex={1}
                                overflow="hidden"
                                borderTopColor="grey.light"
                                borderTopWidth={1}
                                borderTopStyle="solid"
                                pr="1px"
                                pb="1px"
                            >
                                {loadTexts}
                            </Flex>
                        </Flex>
                    )}
                    {weightExtractionStatus && (
                        <WeightExtractionRow
                            weightExtractionStatus={weightExtractionStatus}
                            // @ts-ignore
                            extractedWeight={extractedWeight}
                            // @ts-ignore
                            realLoad={uniqueRealLoad}
                        />
                    )}
                    {truckerObservations && (
                        <Flex color="red.dark" mt={2}>
                            <Icon name="warning" mr={3} />
                            <Flex flex={1}>
                                {t("components.loadTruckerObservations", {
                                    observations: truckerObservations,
                                })}
                            </Flex>
                        </Flex>
                    )}
                </Flex>
            </ActivityLoadCard>
        </>
    );
}
