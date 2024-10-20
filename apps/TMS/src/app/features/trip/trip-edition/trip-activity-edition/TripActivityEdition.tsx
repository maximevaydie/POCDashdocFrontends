import {getCompanyAndAddressName} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Callout,
    Flex,
    IconButton,
    ShortcutWrapper,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import flatten from "lodash.flatten";
import React from "react";

import {BookingIcon} from "app/features/transport/transports-list/BookingIcon";
import {ActivityAskedDates} from "app/features/trip/trip-edition/trip-activity-edition/ActivityAskedDates";
import {ShipperBadge} from "app/features/trip/trip-edition/trip-activity-edition/ShipperBadge";
import {TransportLinks} from "app/features/trip/trip-edition/trip-activity-edition/TransportLinks";
import {
    getLoadQuantities,
    getLoadsCategoryAndQuantity,
    LoadQuantity,
} from "app/services/transport/load.service";

import {getActivityKeyLabel} from "../../trip.service";
import {
    AdditionalTransportData,
    DeliveryTrip,
    SimilarActivityWithTransportData,
    TransportBadgeVariant,
} from "../../trip.types";

import {ActivityScheduledDatesEdition} from "./ActivityScheduledDatesEdition";
import {LoadCell} from "./LoadCell";

import type {Load} from "app/types/transport";

interface TripActivityEdition {
    tripUid: string;
    readOnly: boolean;
    activity: SimilarActivityWithTransportData;
    activityIndex: number;
    activityIndexWithoutSimilarCount: number | "similar";
    setEditingActivityIndex: (index: number) => void;
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
}

export const TripActivityEdition = ({
    tripUid,
    readOnly,
    activity,
    activityIndex,
    activityIndexWithoutSimilarCount,
    setEditingActivityIndex,
    getBadgeVariantByTransportUid,
}: TripActivityEdition) => {
    const loads: Load[] | (Load & {badgeVariant: TransportBadgeVariant; transportId: string})[] =
        flatten(
            activity.fakeMerged
                ? [...activity.deliveries_from, ...activity.deliveries_to].map(
                      (delivery: DeliveryTrip & AdditionalTransportData) =>
                          delivery.planned_loads.map((load) => {
                              return {
                                  ...load,
                                  transportId: delivery.transportId,
                                  badgeVariant: delivery.transportUid
                                      ? getBadgeVariantByTransportUid(delivery.transportUid)
                                      : "default",
                              };
                          })
                  )
                : [...activity.deliveries_from, ...activity.deliveries_to].map(
                      (delivery) => delivery.planned_loads
                  )
        );

    const totalLoad: LoadQuantity | undefined =
        loads.length > 1
            ? loads.reduce((acc, load) => {
                  const v = {
                      ...acc,
                      weight: ((acc.weight as number) ?? 0) + (load.weight as number),
                      volume: ((acc.volume as number) ?? 0) + (load.volume as number),
                      steres: (acc.steres ?? 0) + (load.steres ?? 0),
                      linear_meters:
                          ((acc.linear_meters as number) ?? 0) + (load.linear_meters as number),
                  };
                  return v;
              })
            : undefined;

    const totalLoadQuantity = getLoadsCategoryAndQuantity(loads);

    return (
        <Flex bg="white" flex={1} overflowY="auto">
            <Box flex={1} px={4} pb={4} overflowY="scroll">
                <Flex
                    position="sticky"
                    top={0}
                    my={0}
                    py={2}
                    bg="white"
                    zIndex="level1"
                    flexDirection="row"
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <Flex>
                        <Text variant="h1" data-testid="activity-number">
                            {t("common.activity")}{" "}
                            {(activityIndexWithoutSimilarCount as number) + 1}
                        </Text>
                        <Badge
                            shape="squared"
                            ml={3}
                            data-testid="activity-badge"
                            variant={
                                activity.fakeMerged || activity.transports.length === 0
                                    ? "neutral"
                                    : getBadgeVariantByTransportUid(activity.transports[0].uid)
                            }
                        >
                            {activity.fakeMerged || activity.transports.length === 0
                                ? activity.similarUids.length + " " + t("common.activities")
                                : `${getActivityKeyLabel(
                                      activity.category
                                  )} #${activity.transports[0].sequential_id
                                      .toString()
                                      .slice(-3)}`}
                        </Badge>
                    </Flex>
                    <Flex>
                        <ShortcutWrapper
                            shortcutKeyCodes={["ArrowUp"]}
                            onShortcutPressed={handleActivityUp}
                        >
                            <IconButton
                                strokeWidth={2.5}
                                name={"arrowUp"}
                                color="grey.dark"
                                disabled={activityIndexWithoutSimilarCount === 0}
                                ml={4}
                                onClick={handleActivityUp}
                            />
                        </ShortcutWrapper>

                        <ShortcutWrapper
                            shortcutKeyCodes={["ArrowDown"]}
                            onShortcutPressed={handleActivityDown}
                        >
                            <IconButton
                                strokeWidth={2.5}
                                name={"arrowDown"}
                                color="grey.dark"
                                ml={4}
                                onClick={handleActivityDown}
                            />
                        </ShortcutWrapper>
                    </Flex>
                </Flex>
                <Flex flexDirection="column" mt={4}>
                    <ActivityAskedDates
                        activity={activity}
                        getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                    />
                    <ActivityScheduledDatesEdition
                        tripUid={tripUid}
                        activity={activity}
                        readOnly={readOnly}
                        key={activity.uid}
                    />
                    <Flex justifyContent="space-between" alignItems="center" mt={4} mb={2}>
                        <Text color="grey.dark" variant="h1">
                            {t("common.informations")}
                        </Text>
                        <Flex flexDirection={"column"}>
                            {activity.fakeMerged ? (
                                <TooltipWrapper
                                    content={activity.transports.map((transport) => (
                                        <TransportLinks
                                            data-testid={"link-to-transport-" + transport.id}
                                            key={transport.id}
                                            transport={transport}
                                            getBadgeVariantByTransportUid={
                                                getBadgeVariantByTransportUid
                                            }
                                        />
                                    ))}
                                    placement="bottom"
                                    delayHide={400}
                                >
                                    <Text color="blue.default" data-testid="link-to-transports">
                                        {t("trip.linkToTransports")}
                                    </Text>
                                </TooltipWrapper>
                            ) : (
                                activity.transports.length > 0 && (
                                    <TransportLinks
                                        data-testid="link-to-transport"
                                        transport={activity.transports[0]}
                                        getBadgeVariantByTransportUid={
                                            getBadgeVariantByTransportUid
                                        }
                                    />
                                )
                            )}
                        </Flex>
                    </Flex>
                    <Flex
                        flexDirection="column"
                        bg="grey.ultralight"
                        borderRadius={2}
                        py={2}
                        px={3}
                        mb={2}
                    >
                        <Flex>
                            <Box flex={1} mx={3}>
                                <Text fontWeight="600" mb={2}>
                                    {t("common.shipper")}
                                </Text>
                                <ShipperBadge
                                    transports={activity.transports}
                                    getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                                />
                            </Box>
                            <Box flex={1} mx={3}>
                                <Text fontWeight="600" mb={2}>
                                    {t("common.deliveryAddress")}
                                </Text>
                                {activity.address && (
                                    <>
                                        <Text variant="caption">
                                            {getCompanyAndAddressName(activity.address)}
                                        </Text>
                                        <Text variant="caption" color="grey.dark">
                                            {activity.address.address} {"\n"}{" "}
                                            {activity.address.postcode} {activity.address.city}
                                        </Text>
                                    </>
                                )}
                            </Box>
                        </Flex>
                    </Flex>
                    {activity.is_booking_needed && (
                        <Flex mt={1} alignItems="center">
                            <BookingIcon withTooltip={false} />
                            <Text ml={1} variant="caption" color="grey.dark">
                                {t("transportForm.bookingNeeded")}
                            </Text>
                        </Flex>
                    )}
                    {!!loads.length && (
                        <Flex
                            flexDirection="column"
                            bg="grey.ultralight"
                            borderRadius={2}
                            py={2}
                            px={3}
                        >
                            <Text fontWeight="600" mb={2}>
                                {t("common.loads")}
                            </Text>

                            {activity.fakeMerged
                                ? (
                                      loads as (Load & {
                                          badgeVariant: TransportBadgeVariant;
                                          transportId: string;
                                      })[]
                                  ).map((load, index, loads) => {
                                      let label = getActivityKeyLabel(activity.category);
                                      if (load.transportId) {
                                          label += ` # ${load.transportId.toString().slice(-3)}`;
                                      }
                                      return (
                                          <LoadCell
                                              load={load}
                                              index={index}
                                              loads={loads}
                                              key={index}
                                              badge={
                                                  <Badge
                                                      shape="squared"
                                                      fontSize={1}
                                                      ml={4}
                                                      variant={load.badgeVariant}
                                                  >
                                                      {label}
                                                  </Badge>
                                              }
                                          />
                                      );
                                  })
                                : loads.map((load, index, loads) => (
                                      <LoadCell
                                          load={load}
                                          index={index}
                                          loads={loads}
                                          key={index}
                                      />
                                  ))}
                            {totalLoad && (
                                <Flex borderTop={"1px solid"} borderColor="grey.light" pt={2}>
                                    <Text fontWeight="500" mb={2}>
                                        {t("common.total")}
                                    </Text>
                                    <Flex ml="auto">
                                        <Text
                                            variant="caption"
                                            mr={4}
                                            data-testid="total-load-quantity-and-category"
                                        >
                                            {totalLoadQuantity}
                                        </Text>
                                        <Text
                                            variant="caption"
                                            color="grey.dark"
                                            data-testid="total-load-quantities"
                                        >
                                            {getLoadQuantities(totalLoad)}
                                        </Text>
                                    </Flex>
                                </Flex>
                            )}
                        </Flex>
                    )}
                    <Callout mt={4} bottom={0} position="sticky" variant="secondary">
                        {t("trips.useKeyboard")}
                    </Callout>
                </Flex>
            </Box>
        </Flex>
    );

    function handleActivityUp() {
        return setEditingActivityIndex(activityIndex - 1);
    }

    function handleActivityDown() {
        return setEditingActivityIndex(activityIndex + activity.similarUids.length + 1);
    }
};
