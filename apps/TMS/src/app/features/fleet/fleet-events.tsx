import {useTimezone} from "@dashdoc/web-common";
import {t, TranslationKeys} from "@dashdoc/web-core";
import {Box, EventCircle, Flex, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, FleetEvent, Unavailability} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";

import {loadRequestAbsenceManagerConnector} from "app/redux/reducers/connectors";
import {getMiddayTimeFormatted} from "app/redux/selectors/connector";

type UnavailabilityEventProps = {
    event: FleetEvent;
};

const UnavailabilityEvent: FunctionComponent<UnavailabilityEventProps> = ({event}) => {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    dispatch(loadRequestAbsenceManagerConnector());
    const middayTime = useSelector(getMiddayTimeFormatted);

    const getFormattedUnavailabilityType = useCallback(
        (unavailabilityType: Unavailability["unavailability_type"]) =>
            // nosemgrep
            t(`unavailability.${unavailabilityType}` as TranslationKeys),
        []
    );

    const getFormattedUnavailabilityField = useCallback(
        (unavailability: Unavailability, unavailabilityField: keyof Unavailability) => {
            switch (unavailabilityField) {
                case "unavailability_type":
                    return (
                        <Flex>
                            <Text variant="captionBold" color="grey.dark" mr={1}>
                                {t("unavailability.cause") + ":"}
                            </Text>
                            <Text mr={1} variant="caption">
                                {getFormattedUnavailabilityType(
                                    unavailability.unavailability_type
                                )}
                            </Text>
                        </Flex>
                    );
                case "start_date": {
                    const startAfternoon =
                        formatDate(
                            parseAndZoneDate(unavailability?.start_date, timezone),
                            "HH:mm"
                        ) === middayTime;
                    return (
                        <Flex alignItems="baseline">
                            <Text variant="captionBold" color="grey.dark" mr={1}>
                                {t("unavailability.startDate") + ":"}
                            </Text>
                            <Flex alignItems="center" fontSize={1}>
                                {formatDate(
                                    parseAndZoneDate(unavailability.start_date, timezone),
                                    "P"
                                )}{" "}
                                {startAfternoon ? t("unavailability.afternoon") : ""}
                            </Flex>
                        </Flex>
                    );
                }
                case "end_date": {
                    const endMorning =
                        formatDate(
                            parseAndZoneDate(unavailability?.end_date, timezone),
                            "HH:mm"
                        ) === middayTime;
                    return (
                        <Flex alignItems="baseline">
                            <Text variant="captionBold" color="grey.dark" mr={1}>
                                {t("unavailability.endDate") + ":"}
                            </Text>
                            <Flex fontSize={1}>
                                {formatDate(
                                    parseAndZoneDate(unavailability.end_date, timezone),
                                    "P"
                                )}{" "}
                                {endMorning ? t("unavailability.morning") : ""}{" "}
                            </Flex>
                        </Flex>
                    );
                }
                case "unavailability_note":
                    return (
                        <Flex>
                            <Text variant="captionBold" color="grey.dark" mr={1}>
                                {t("unavailability.notes") + ":"}
                            </Text>
                            <Text variant="caption" flex={1}>
                                {unavailability.unavailability_note}
                            </Text>
                        </Flex>
                    );
                default:
                    return null;
            }
        },
        [getFormattedUnavailabilityType, timezone, middayTime]
    );

    const formatUpdatedUnavailability = useCallback(
        (unavailability: Unavailability, updatedFields: Array<keyof Unavailability>) => (
            <>
                {updatedFields.map((unavailabilityField, key) => (
                    <Box key={key}>
                        {getFormattedUnavailabilityField(unavailability, unavailabilityField)}
                    </Box>
                ))}
            </>
        ),
        [getFormattedUnavailabilityField]
    );

    const updatedUnavailabilityFields = useCallback(
        (oldUnavailability: Unavailability, newUnavailability: Unavailability) =>
            Object.entries(newUnavailability).reduce(
                (acc, [k, v]: [keyof Unavailability, string]) => {
                    if (oldUnavailability[k] !== v) {
                        acc.push(k);
                    }
                    return acc;
                },
                [] as Array<keyof Unavailability>
            ),
        []
    );

    const isTrucker = useMemo(() => event.category === "trucker_unavailability", [event]);

    switch (event.action) {
        case "created":
            return (
                <Flex
                    flex={1}
                    justifyContent="space-between"
                    alignItems="baseline"
                    data-testid="event-unavailability-added"
                >
                    <Text mb={1} flex={1}>
                        {t(
                            isTrucker
                                ? `unavailability.authorAddedUnavailability`
                                : `unavailability.authorAddedFleetUnavailability`,
                            {
                                author: event.author.display_name,
                                type: getFormattedUnavailabilityType(
                                    event.new_data.unavailability_type
                                ),
                                startDate: formatDate(
                                    parseAndZoneDate(event.new_data.start_date, timezone),
                                    "PPP"
                                ),
                                endDate: formatDate(
                                    parseAndZoneDate(event.new_data?.end_date, timezone),
                                    "PPP"
                                ),
                            }
                        )}
                    </Text>
                    <Text color="grey.dark" variant="caption" ml={2}>
                        {formatDate(parseAndZoneDate(event.created, timezone), "PPPp")}
                    </Text>
                </Flex>
            );
        case "updated": {
            const updatedFields = updatedUnavailabilityFields(event.old_data, event.new_data);
            return (
                <Box flex={1} data-testid="event-unavailability-updated">
                    <Flex flex={1} justifyContent="space-between" alignItems="baseline">
                        <Text mb={1} flex={1}>
                            {t(
                                isTrucker
                                    ? `unavailability.authorUpdatedUnavailability`
                                    : `unavailability.authorUpdatedFleetUnavailability`,
                                {
                                    author: event.author.display_name,
                                }
                            )}
                        </Text>
                        <Text color="grey.dark" variant="caption" ml={2}>
                            {formatDate(parseAndZoneDate(event.created, timezone), "PPPp")}
                        </Text>
                    </Flex>
                    <Flex backgroundColor="grey.ultralight" p={1}>
                        <Box flex={1} mr={4}>
                            <Text variant="captionBold">{t("components.previousValue")}</Text>
                            {formatUpdatedUnavailability(event.old_data, updatedFields)}
                        </Box>
                        <Box flex={1}>
                            <Text variant="captionBold">{t("components.newValue")}</Text>
                            {formatUpdatedUnavailability(event.new_data, updatedFields)}
                        </Box>
                    </Flex>
                </Box>
            );
        }
        case "deleted":
            return (
                <Flex
                    flex={1}
                    justifyContent="space-between"
                    alignItems="baseline"
                    data-testid="event-unavailability-deleted"
                >
                    <Text flex={1}>
                        {t(
                            isTrucker
                                ? `unavailability.authorDeletedUnavailability`
                                : `unavailability.authorDeletedFleetUnavailability`,
                            {
                                author: event.author.display_name,
                                type: getFormattedUnavailabilityType(
                                    event.old_data.unavailability_type
                                ),
                                startDate: formatDate(
                                    parseAndZoneDate(event.old_data.start_date, timezone),
                                    "PPP"
                                ),
                                endDate: formatDate(
                                    parseAndZoneDate(event.old_data?.end_date, timezone),
                                    "PPP"
                                ),
                            }
                        )}
                    </Text>
                    <Text color="grey.dark" variant="caption" ml={2}>
                        {formatDate(parseAndZoneDate(event.created, timezone), "PPPp")}
                    </Text>
                </Flex>
            );
        default:
            return null;
    }
};

type EventDetailProps = {
    event: FleetEvent;
};

const EventDetail: FunctionComponent<EventDetailProps> = ({event}) => {
    switch (event.category) {
        case "trucker_unavailability":
        case "vehicle_unavailability":
        case "trailer_unavailability":
            return <UnavailabilityEvent key={event.pk} event={event} />;
        default:
            return null;
    }
};

type FleetEventsProps = {
    events: FleetEvent[];
};

const FleetEvents: FunctionComponent<FleetEventsProps> = ({events}) => (
    <>
        {events?.length > 0 ? (
            events.map((event, key) => (
                <Flex key={key} flex={1} p={2}>
                    <Box pt={1} mr={1}>
                        <EventCircle />
                    </Box>
                    <Flex flex={1}>
                        <EventDetail event={event} />
                    </Flex>
                </Flex>
            ))
        ) : (
            <Box py={4}>
                <Text textAlign="center" color="grey.dark">
                    {t("unavailability.noEvent")}
                </Text>
            </Box>
        )}
    </>
);

export default FleetEvents;
