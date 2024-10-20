import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    IconButton,
    Modal,
    NumberInput,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatNumber, TransportAddress} from "dashdoc-utils";
import sortBy from "lodash.sortby";
import React, {FunctionComponent, useCallback, useMemo, useState} from "react";
import {Link} from "react-router-dom";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {fetchRefreshDistance} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import {DistanceBySegment} from "./getTotalDistanceBySegmentUid";

import type {Segment, Transport} from "app/types/transport";

type DistanceSource = "user" | "telematic" | "estimated";

const getCoalescedDistance = (
    userDistance: number | null,
    telematicDistance: number | null,
    estimatedDistance: number | null
): [distance: number | null, source: DistanceSource] => {
    let distance = null;
    let source: DistanceSource = "estimated";
    if (userDistance) {
        distance = userDistance;
        source = "user";
    } else if (telematicDistance) {
        distance = telematicDistance;
        source = "telematic";
    } else if (estimatedDistance) {
        distance = estimatedDistance;
        source = "estimated";
    }

    if (distance) {
        distance = Math.round(distance * 100) / 100;
    }

    return [distance, source];
};

const DistanceInput: FunctionComponent<{
    id: string;
    userDistance: number | null;
    telematicDistance: number | null;
    estimatedDistance: number | null;
    onChanged: (userDistance: number | null) => void;
}> = ({id, userDistance, telematicDistance, estimatedDistance, onChanged}) => {
    const [coalescedDistance, source] = getCoalescedDistance(
        userDistance,
        telematicDistance,
        estimatedDistance
    );

    const sourceIcon = {
        user: "user",
        telematic: "telematicConnection",
        estimated: "rulerDesign",
    }[source];

    const sourceTooltipContent = {
        user: t("telematic.mileageSourceUser"),
        telematic: t("telematic.mileageSourceTelematic"),
        estimated: t("telematic.mileageSourceEstimated"),
    }[source];

    return (
        <>
            <Flex>
                <NumberInput
                    id={`${id}-distance`}
                    data-testid={`distance-input`}
                    value={coalescedDistance}
                    onChange={(newDistance: number) => {
                        onChanged(newDistance);
                    }}
                    placeholder={`${t("telematic.noData")}`}
                    maxDecimals={2}
                    autoFocus
                    leftIcon={sourceIcon as "user" | "telematicConnection" | "rulerDesign"}
                    leftTooltipContent={sourceTooltipContent}
                    leftTooltipPlacement="left"
                    units="km"
                />
                <Button
                    disabled={source !== "user"}
                    onClick={() => onChanged(null)}
                    variant="secondary"
                >
                    <TooltipWrapper content={t("distanceModal.removeUserDistance")}>
                        <Icon name="undo" />
                    </TooltipWrapper>
                </Button>
            </Flex>

            {source === "telematic" && (
                <TooltipWrapper content={t("telematic.wrongOrMissingDataTooltip")}>
                    <small>
                        <Link to={`/app/settings/telematic/`}>
                            <Icon name="info" /> {t("telematic.wrongOrMissingData")}
                        </Link>
                    </small>
                </TooltipWrapper>
            )}
        </>
    );
};

const SegmentSummaryForRow = ({
    originAddress,
    destinationAddress,
    mileageAtOrigin,
    mileageAtDestination,
}: {
    originAddress: TransportAddress | null;
    destinationAddress: TransportAddress | null;
    mileageAtOrigin: number | null;
    mileageAtDestination: number | null;
}) => {
    return (
        <Flex
            flex={1}
            justifyContent="space-between"
            alignItems="center"
            marginRight={8}
            marginBottom={4}
        >
            <Box>
                {originAddress && (
                    <Text>{`${originAddress.city} (${originAddress.postcode})`}</Text>
                )}
                <Text>{mileageAtOrigin ? `${mileageAtOrigin} km` : t("telematic.noMileage")}</Text>
            </Box>
            <Icon mx={4} name="arrowRight" />
            <Box>
                {destinationAddress && (
                    <Text>{`${destinationAddress.city} (${destinationAddress.postcode})`}</Text>
                )}
                <Text>
                    {mileageAtDestination
                        ? `${mileageAtDestination} km`
                        : t("telematic.noMileage")}
                </Text>
            </Box>
        </Flex>
    );
};

const DistanceRow: FunctionComponent<{
    segment: Segment;
    userDistance: number | null;
    onSetUserDistance: (uid: string, value: number | null) => void;
    sortedVisitedTransportSitesUids: string[];
}> = ({segment, userDistance, onSetUserDistance, sortedVisitedTransportSitesUids}) => {
    const notDirectSegment =
        sortedVisitedTransportSitesUids.includes(segment.origin.uid) &&
        sortedVisitedTransportSitesUids.includes(segment.destination.uid) &&
        sortedVisitedTransportSitesUids.indexOf(segment.destination.uid) !=
            sortedVisitedTransportSitesUids.indexOf(segment.origin.uid) + 1;

    return (
        <Box flex={1}>
            <Flex alignItems="center" fontWeight="bold">
                <Icon name="truck" color="grey.ultradark" lineHeight="10px"></Icon>&nbsp;
                {segment.vehicle ? (
                    <VehicleLabel color="grey.ultradark" vehicle={segment.vehicle} />
                ) : (
                    <Text>{t("common.unspecified")}</Text>
                )}
            </Flex>
            <Flex alignItems="flex-start">
                <SegmentSummaryForRow
                    originAddress={segment.origin.address}
                    destinationAddress={segment.destination.address}
                    mileageAtOrigin={segment.origin_mileage}
                    mileageAtDestination={segment.destination_mileage}
                />
                {notDirectSegment ? (
                    <Flex height="fit-content" backgroundColor="yellow.light" p={4}>
                        <Icon name="warning" color="yellow.dark" mr={4} />
                        <Text>{t("telematic.notDirectSegment")}</Text>
                    </Flex>
                ) : (
                    <Box>
                        <DistanceInput
                            id={`distance-modal-segment-${segment.uid}`}
                            userDistance={userDistance}
                            telematicDistance={segment.telematic_distance}
                            estimatedDistance={segment.estimated_distance}
                            onChanged={(value) => {
                                onSetUserDistance(segment.uid, value);
                            }}
                        />
                    </Box>
                )}
            </Flex>
        </Box>
    );
};

interface Props {
    transport: Transport;
    onSubmit?: (newValues: {
        distancesBySegmentUid: DistanceBySegment;
        totalTransportDistance: number | null;
    }) => void;
    onClose: () => void;
}

export const DistanceModal: FunctionComponent<Props> = ({transport, onSubmit, onClose}) => {
    const distancesBySegmentUid = useMemo(() => {
        const distancesBySegmentUid: Record<
            string,
            Pick<Segment, "telematic_distance" | "estimated_distance">
        > = {};
        for (const segment of transport.segments) {
            distancesBySegmentUid[segment.uid] = {
                telematic_distance: segment.telematic_distance,
                estimated_distance: segment.estimated_distance,
            };
        }
        return distancesBySegmentUid;
    }, [transport.segments]);

    const [localUserDistancesBySegmentUid, setLocalUserDistancesBySegmentUid] = useState(
        transport.segments.reduce(
            (acc, segment) => {
                acc[segment.uid] = segment.user_distance;
                return acc;
            },
            {} as Record<string, number | null>
        )
    );

    const getSegmentDistance = useCallback(
        (segmentUid: string) => {
            return getCoalescedDistance(
                localUserDistancesBySegmentUid[segmentUid],
                distancesBySegmentUid[segmentUid].telematic_distance,
                distancesBySegmentUid[segmentUid].estimated_distance
            )[0];
        },
        [distancesBySegmentUid, localUserDistancesBySegmentUid]
    );

    const localTotalDistance = useMemo(() => {
        let distance = 0;
        for (const segmentUid of Object.keys(localUserDistancesBySegmentUid)) {
            distance += getSegmentDistance(segmentUid) ?? 0;
        }
        return distance;
    }, [getSegmentDistance, localUserDistancesBySegmentUid]);

    const setLocalUserDistance = (uid: string, distance: number | null) => {
        setLocalUserDistancesBySegmentUid({
            ...localUserDistancesBySegmentUid,
            [uid]: distance,
        });
    };

    // distance refresh
    const [refreshing, setRefreshing] = useState(false);
    const dispatch = useDispatch();

    const refresh = useCallback(() => {
        setRefreshing(true);

        dispatch(fetchRefreshDistance(transport.uid)).finally(() => setRefreshing(false));
    }, [dispatch, transport.uid]);

    const handleSaveSegmentDistances = () => {
        (async () => {
            const payload = Object.entries(localUserDistancesBySegmentUid).reduce(
                (acc, [uid, localUserDistance]) => {
                    acc.push({uid, user_distance: localUserDistance});
                    return acc;
                },
                [] as {uid: string; user_distance: number | null}[]
            );

            await apiService.patch(`/telematics/distance/${transport.uid}/`, payload, {
                apiVersion: "v4",
            });

            const newDistancesBySegmentUid = Object.entries(distancesBySegmentUid).reduce(
                (acc, [uid, distances]) => {
                    acc[uid] = {
                        ...distances,
                        user_distance: localUserDistancesBySegmentUid[uid],
                    };
                    return acc;
                },
                {} as DistanceBySegment
            );

            onSubmit?.({
                distancesBySegmentUid: newDistancesBySegmentUid,
                totalTransportDistance: localTotalDistance,
            });
            onClose();
        })();
    };

    let transportSites = transport.segments.map((segment) => segment.origin);
    transportSites.push(transport.segments[transport.segments.length - 1].destination);
    let visitedTransportSites = transportSites.filter((site) => site?.real_start);
    let sortedVisitedTransportSites = sortBy(visitedTransportSites, ["real_start"]);
    let sortedVisitedTransportSitesUids = sortedVisitedTransportSites.map((site) => site.uid);

    return (
        <Modal
            id="add-telematic-modal"
            title={t("telematic.distances")}
            onClose={onClose}
            mainButton={{
                type: "submit",
                "data-testid": "telematic-set-user-distances",
                onClick: handleSaveSegmentDistances,
                children: t("common.save"),
            }}
            size="large"
        >
            <Box>
                {transport.segments.map((segment) => {
                    return (
                        <DistanceRow
                            key={segment.uid}
                            segment={segment}
                            onSetUserDistance={setLocalUserDistance}
                            userDistance={localUserDistancesBySegmentUid[segment.uid]}
                            sortedVisitedTransportSitesUids={sortedVisitedTransportSitesUids}
                        />
                    );
                })}
            </Box>
            <Text textAlign="right" fontWeight="bold">
                {t("common.total")} :{" "}
                {formatNumber(localTotalDistance, {maximumFractionDigits: 2})} km
            </Text>
            <Box>
                <IconButton
                    onClick={refresh}
                    name="refresh"
                    label={t("distanceModal.estimateDistance")}
                    color={"blue.default"}
                    disabled={refreshing}
                />
            </Box>
        </Modal>
    );
};
