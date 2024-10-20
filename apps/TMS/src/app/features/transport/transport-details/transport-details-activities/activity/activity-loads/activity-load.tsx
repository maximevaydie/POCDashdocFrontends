import {t} from "@dashdoc/web-core";
import {Badge, Flex, Icon, Text} from "@dashdoc/web-ui";
import {ActivityType, WasteLoad, COMPLEMENTARY_INFORMATION_SEPARATOR} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getLoadQuantities} from "app/services/transport";

import {ActivityLoadCard} from "./activity-load-card";
import {Identifiers} from "./identifiers";
import {getLoadCategoryAndDescription, getLoadInformations, getRealTitle} from "./utils";
import {getWeightExtractionStatus, WeightExtractionRow} from "./weight-extraction";

import type {Load} from "app/types/transport";

interface ActivityLoadProps {
    plannedLoad: Load | WasteLoad | undefined;
    realLoad: Load;
    clickable: boolean;
    onClick: () => any;
    extractedWeight?: number | null;
    weightExtractionInProgress?: boolean;
    background?: string;
    activityType: ActivityType;
    deliveryIsCancelled: boolean;
    dataTestId: string;
}

export const ActivityLoad: FunctionComponent<ActivityLoadProps> = ({
    plannedLoad,
    realLoad,
    clickable,
    onClick,
    extractedWeight,
    weightExtractionInProgress,
    background = "grey.ultralight",
    activityType,
    deliveryIsCancelled,
    dataTestId,
}) => {
    const weightExtractionStatus = getWeightExtractionStatus(
        // @ts-ignore
        weightExtractionInProgress,
        extractedWeight,
        realLoad
    );

    const isRentalLoad = plannedLoad?.category === "rental";
    const loadCaptionsText = getLoadInformations(realLoad ?? plannedLoad);
    let loadCaptions: string[] = [];
    if (loadCaptionsText) {
        if (isRentalLoad) {
            loadCaptions = loadCaptionsText.split(COMPLEMENTARY_INFORMATION_SEPARATOR);
        } else {
            loadCaptions = [loadCaptionsText];
        }
    }

    const stylesIfDisabled = {
        pointerEvents: "none",
        opacity: "0.66",
        cursor: "not-allowed",
    } as React.CSSProperties;

    return (
        <ActivityLoadCard
            clickable={clickable && !deliveryIsCancelled}
            onClick={onClick}
            background={
                realLoad?.trucker_observations
                    ? "red.ultralight"
                    : weightExtractionStatus === "notValidated"
                      ? "yellow.ultralight"
                      : background
            }
            dataTestId={dataTestId}
        >
            <Flex
                flexDirection="column"
                width="100%"
                style={deliveryIsCancelled ? stylesIfDisabled : {}}
            >
                <Flex alignItems="center">
                    <Icon name={"load"} color="grey.dark" mr={3} />
                    <Flex flex={4}>
                        <Flex
                            flexDirection="column"
                            overflow="hidden"
                            data-testid={`${dataTestId}-description`}
                            justifyContent="center"
                        >
                            {getLoadCategoryAndDescription(realLoad ?? plannedLoad)}
                            {loadCaptions.map((loadCaption, index) => (
                                <Text color="grey.dark" variant="caption" key={index}>
                                    {loadCaption}
                                </Text>
                            ))}
                        </Flex>
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
                            {!!plannedLoad && getLoadQuantities(plannedLoad)}
                        </Text>
                    </Flex>
                    <Flex
                        flexDirection="column"
                        flex={1}
                        overflow="hidden"
                        height="100%"
                        data-testid={`${dataTestId}-real`}
                    >
                        <Text variant="caption">{getRealTitle(activityType)}</Text>
                        <Text fontWeight="bold" data-testid={`${dataTestId}-real-quantity`}>
                            {!!realLoad && getLoadQuantities(realLoad)}
                        </Text>
                    </Flex>
                </Flex>
                {weightExtractionStatus && (
                    <WeightExtractionRow
                        weightExtractionStatus={weightExtractionStatus}
                        // @ts-ignore
                        extractedWeight={extractedWeight}
                        realLoad={realLoad}
                    />
                )}
                {!!realLoad?.trucker_observations && (
                    <Flex color="red.dark" mt={2}>
                        <Icon name="warning" mr={3} />
                        <Flex flex={1}>
                            {t("components.loadTruckerObservations", {
                                observations: realLoad.trucker_observations,
                            })}
                        </Flex>
                    </Flex>
                )}
                {!!plannedLoad &&
                    (!!plannedLoad.use_identifiers || !!realLoad?.use_identifiers) && (
                        <Identifiers
                            plannedLoad={plannedLoad}
                            realLoad={realLoad}
                            activityType={activityType}
                        />
                    )}
            </Flex>
            {deliveryIsCancelled && (
                <Badge
                    alignSelf="center"
                    variant={"errorDark"}
                    data-testid="delivery-cancelled-badge"
                    shape="squared"
                >
                    <Text variant="h2" color="unset">
                        {t("components.cancelled")}
                    </Text>
                </Badge>
            )}
        </ActivityLoadCard>
    );
};
