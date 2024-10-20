import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {ActivityType} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import type {Load} from "app/types/transport";

type IdentifierInfos = {
    identifier: string;
    planned: boolean;
    real: boolean;
    scanned: boolean;
};

interface IdentifiersProps {
    plannedLoad: Load;
    realLoad: Load;
    activityType: ActivityType;
}

export const Identifiers: FunctionComponent<IdentifiersProps> = ({
    plannedLoad,
    realLoad,
    activityType,
}) => {
    const getIdentifiersInfosByIdentifier = (
        identifiers: string[],
        identifierType: "planned" | "real",
        otherIdentifiersInfos: {
            [key: string]: IdentifierInfos;
        }
    ) => {
        return (identifiers || []).reduce((identifiersInfos, identifier) => {
            if (!identifiersInfos[identifier]) {
                identifiersInfos[identifier] = {
                    identifier: identifier,
                    planned: false,
                    real: false,
                    scanned: true,
                };
            }
            identifiersInfos[identifier][identifierType] = true;
            return identifiersInfos;
        }, otherIdentifiersInfos);
    };

    const plannedIdentifiersInfosByIdentifier = getIdentifiersInfosByIdentifier(
        // @ts-ignore
        plannedLoad?.identifiers,
        "planned",
        {}
    );
    const plannedAndRealIdentifiersInfosByIdentifier = getIdentifiersInfosByIdentifier(
        // @ts-ignore
        realLoad?.identifiers,
        "real",
        plannedIdentifiersInfosByIdentifier
    );

    const loadedButNotScanned = realLoad?.identifiers_observations
        ? realLoad?.identifiers_observations.split(": ")[1].split(", ")
        : [];

    loadedButNotScanned.map((identifier) => {
        plannedAndRealIdentifiersInfosByIdentifier[identifier]["scanned"] = false;
    });

    const allIdentifiersInfos = Object.keys(plannedAndRealIdentifiersInfosByIdentifier)
        .map((uid) => {
            return plannedAndRealIdentifiersInfosByIdentifier[uid];
        })
        .sort((a, b) => (a.identifier > b.identifier ? 1 : b.identifier > a.identifier ? -1 : 0));

    const getPlannedRow = (identifierInfos: IdentifierInfos) => {
        return (
            plannedLoad && (
                <Text color="grey.dark" variant="caption" mt={2}>
                    {identifierInfos.planned ? identifierInfos.identifier : "-"}
                </Text>
            )
        );
    };
    const getRealRow = (identifierInfos: IdentifierInfos) => {
        const mainText = !identifierInfos.real
            ? activityType === "loading"
                ? t("load.identifierStatus.notLoaded")
                : t("load.identifierStatus.notDelivered")
            : !identifierInfos.scanned
              ? t("load.identifierStatus.notScanned")
              : t("load.identifierStatus.scanned");
        return (
            realLoad && (
                <Text variant="caption" mt={2}>
                    <Text
                        as="span"
                        color={
                            !identifierInfos.real ||
                            !identifierInfos.scanned ||
                            (plannedLoad && !identifierInfos.planned)
                                ? "red.dark"
                                : "grey.dark"
                        }
                        variant="caption"
                        mt={2}
                    >
                        {mainText}
                    </Text>
                    {!!identifierInfos.real && !identifierInfos.scanned && (
                        <Text
                            as="span"
                            color={
                                plannedLoad && !identifierInfos.planned ? "red.dark" : "grey.dark"
                            }
                            variant="caption"
                            mt={2}
                        >
                            {`, ${
                                activityType === "loading"
                                    ? t("load.identifierStatus.loaded")
                                    : t("load.identifierStatus.delivered")
                            }`}
                        </Text>
                    )}
                    {plannedLoad && !identifierInfos.planned && (
                        <Text as="span" color="red.dark" variant="caption" mt={2}>{`, ${t(
                            "load.identifierStatus.notPlanned"
                        )}`}</Text>
                    )}
                    {!identifierInfos.planned && (
                        <Text
                            as="span"
                            color="grey.dark"
                            variant="caption"
                            mt={2}
                        >{` (${identifierInfos.identifier})`}</Text>
                    )}
                </Text>
            )
        );
    };

    const getRow = (identifierInfos: IdentifierInfos, index: number) => {
        return (
            <Flex key={index}>
                <Flex
                    flexDirection="column"
                    flex={1}
                    overflow="hidden"
                    data-testid={`${activityType}-identifier-${index}-planned`}
                >
                    {getPlannedRow(identifierInfos)}
                </Flex>
                <Flex
                    flexDirection="column"
                    flex={1}
                    overflow="hidden"
                    data-testid={`${activityType}-identifier-${index}-real`}
                >
                    {getRealRow(identifierInfos)}
                </Flex>
            </Flex>
        );
    };

    return (
        <Flex mt={3}>
            <Box width="1.15em" mr={3} />
            <Flex
                flexDirection="column"
                flex={4}
                overflow="hidden"
                borderTopColor="grey.light"
                borderTopWidth={1}
                borderTopStyle="solid"
            >
                <Text color="grey.dark" variant="caption" mt={2}>
                    {t("load.shippingUnitsCodesTitle")}
                </Text>
            </Flex>
            <Flex
                flexDirection="column"
                flex={2}
                overflow="hidden"
                borderTopColor="grey.light"
                borderTopWidth={1}
                borderTopStyle="solid"
            >
                {allIdentifiersInfos.map((identifierInfos, index) => {
                    return getRow(identifierInfos, index);
                })}
            </Flex>
        </Flex>
    );
};
