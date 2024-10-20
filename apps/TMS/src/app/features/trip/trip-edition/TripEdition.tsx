import {ModerationButton} from "@dashdoc/web-common";
import {useTimezone} from "@dashdoc/web-common";
import {ErrorBoundary} from "@dashdoc/web-common";
import {getConnectedManager} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {
    TabTitle,
    Button,
    Card,
    Flex,
    ShortcutWrapper,
    IconButton,
    Tabs,
    Text,
    Checkbox,
    Box,
    Popover,
} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, useToggle} from "dashdoc-utils";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {useDeleteScheduledDates} from "app/features/transport/hooks/useDeleteScheduledDates";
import {useHasEditionRightsOnTrip} from "app/features/trip/hook/useHasEditionRightsOnTrip";
import {TripActivityEdition} from "app/features/trip/trip-edition/trip-activity-edition/TripActivityEdition";
import TripIndicators from "app/features/trip/trip-edition/trip-indicators";
import {TripEditionMainSection} from "app/features/trip/trip-edition/TripEditionMainSection";
import {getActivityIndexWithoutSimilarCount, getTripTags} from "app/features/trip/trip.service";
import {TripWithTransportData} from "app/features/trip/trip.types";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchRetrieveTrip, fetchSplitTrip} from "app/redux/actions/trips";
import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";
import {getLastTripEvent} from "app/redux/selectors/realtime";
import {getTripWithFakeMergedActivities} from "app/redux/selectors/trip";
import {useTransportBadgeVariant} from "app/screens/trip/hooks/useTransportBadgeVariant";
import {SidebarTabNames} from "app/types/constants";

const TripEditionComponent: FunctionComponent<{
    tripUid: string;
    handleClose?: () => void;
    onSubcontract?: () => void;
}> = ({tripUid, handleClose, onSubcontract}) => {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const history = useHistory();

    const lastTripRealtimeEvent = useSelector((state) => {
        const event = getLastTripEvent(state);
        if (!tripUid || event?.data.uid !== tripUid) {
            return null;
        }
        return event;
    });

    const {extendedView} = useExtendedView();
    const manager = useSelector(getConnectedManager);
    const [iShortcutDisabled, disableShortcut, enableShortcut] = useToggle();
    const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
    const [deleteScheduledDates, setDeleteScheduledDates] = useDeleteScheduledDates(true);

    const debouncedFetchTrip = useCallback(
        debounce(() => {
            if (!tripUid) {
                Logger.error("Tried to access a trip details without an uid");
            } else {
                try {
                    dispatch(fetchRetrieveTrip(tripUid, extendedView));
                } catch (e) {
                    Logger.error(`Trip with uid ${tripUid} not found.`);
                }
            }
        }, 300),
        [dispatch, tripUid, extendedView]
    );

    useEffect(() => {
        debouncedFetchTrip();
    }, [debouncedFetchTrip, lastTripRealtimeEvent]);

    const trip: TripWithTransportData | null = useSelector(
        (state: RootState) => getTripWithFakeMergedActivities(state, tripUid),
        isEqual
    );
    const getBadgeVariantByTransportUid = useTransportBadgeVariant(trip?.activities || []);
    const activitiesWithFakeMergedAdded = trip?.activities || [];

    const handleActivityIndexChange = (index: number | null) => {
        if (index === null) {
            return setEditingActivityIndex(null);
        }
        if (index < 0 || index >= activitiesWithFakeMergedAdded.length) {
            return;
        }
        if (
            activitiesWithFakeMergedAdded[index].fakeMerged === false &&
            activitiesWithFakeMergedAdded[index].similarUids.length !== 0
        ) {
            handleActivityIndexChange(index === 0 ? index : index - 1);
        } else {
            setEditingActivityIndex(index);
        }

        // scroll to make the selected activity visible
        const activityElement = document.querySelector(
            `[data-testid="trip-activity-editable-item-${index}"]`
        );
        if (
            activityElement &&
            (activityElement?.getBoundingClientRect().top > window.innerHeight - 80 ||
                activityElement?.getBoundingClientRect().top < 80)
        ) {
            activityElement.scrollIntoView();
        }
    };
    const editable = useHasEditionRightsOnTrip(trip?.carrier);

    const tags = useMemo(() => (trip ? getTripTags(trip) : []), [trip]);

    const splitTrip = async () => {
        try {
            await fetchSplitTrip(tripUid, extendedView, deleteScheduledDates)(dispatch);
        } catch {
            return;
        }
        handleClose ? handleClose() : history.push("/app/scheduler");
    };

    const activitySelected = activitiesWithFakeMergedAdded[editingActivityIndex ?? 0];

    if (!trip) {
        return <LoadingWheel />;
    }
    return (
        <Box height="100%" overflowY="hidden" data-testid="transport-from-screen">
            <FullHeightMinWidthScreen>
                <Box
                    width="100%"
                    flexDirection="column"
                    px={3}
                    display="flex"
                    height="calc(100% - 10px)"
                    marginX="auto"
                >
                    <Flex alignItems="center">
                        <ShortcutWrapper
                            shortcutKeyCodes={["Control", "Enter"]}
                            isShortcutDisabled={iShortcutDisabled}
                            tooltipLabel="<i>ctrl + enter</i>"
                            tooltipPlacement="left"
                            onShortcutPressed={() =>
                                handleClose ? handleClose() : history.push("/app/scheduler")
                            }
                        >
                            <IconButton
                                fontSize={28}
                                name="arrowLeft"
                                onClick={() =>
                                    handleClose ? handleClose() : history.push("/app/scheduler")
                                }
                                data-testid="validate-trip"
                            />
                        </ShortcutWrapper>
                        <Flex flexDirection="column">
                            <Flex>
                                <TabTitle
                                    title={getTabTranslations(SidebarTabNames.TRIP_EDITION)}
                                    customTitle={t("sidebar.tripEdition") + " " + trip.name}
                                />
                                <Flex ml={2} my={2} style={{gap: "4px"}}>
                                    {tags.map((tag, index) => (
                                        <Tag key={index} tag={tag} />
                                    ))}
                                </Flex>
                                <ModerationButton manager={manager} path={`trips/${trip.uid}/`} />
                            </Flex>
                            <Text as="small" variant="caption" color="grey.dark">
                                {t("common.createdOn")}{" "}
                                {formatDate(parseAndZoneDate(trip.created, timezone), "PPPp")}
                            </Text>
                        </Flex>
                        {trip.child_transport == null &&
                            editable &&
                            trip.status === "unstarted" && (
                                <Flex ml="auto">
                                    <Popover>
                                        <Popover.Trigger>
                                            <IconButton name="moreActions" />
                                        </Popover.Trigger>
                                        <Popover.Content>
                                            <Button
                                                onClick={splitTrip}
                                                variant="plain"
                                                severity="danger"
                                                withConfirmation
                                                confirmationMessage={
                                                    <>
                                                        <Text mb={3}>
                                                            {t(
                                                                "trip.splitConfirmationModal.message"
                                                            )}
                                                        </Text>
                                                        <Checkbox
                                                            checked={deleteScheduledDates}
                                                            onChange={setDeleteScheduledDates}
                                                            label={t(
                                                                "components.deletedScheduledDates"
                                                            )}
                                                            data-testid="deleted-scheduled-dates"
                                                        />
                                                    </>
                                                }
                                                modalProps={{
                                                    title: t("trip.splitConfirmationModal.title"),
                                                    mainButton: {
                                                        children: t("common.delete"),
                                                        severity: "danger",
                                                    },
                                                }}
                                                mr={3}
                                                data-testid="delete-trip"
                                            >
                                                {t("common.delete")}
                                            </Button>
                                        </Popover.Content>
                                    </Popover>
                                </Flex>
                            )}
                    </Flex>
                    <ErrorBoundary>
                        <Flex flex={1} pt={3} overflowY="auto">
                            <Box flex={1} mr={3} overflowY="scroll">
                                <TripEditionMainSection
                                    trip={trip}
                                    readOnly={!editable}
                                    disableShortcut={disableShortcut}
                                    enableShortcut={enableShortcut}
                                    setEditingActivityIndex={handleActivityIndexChange}
                                    transportUids={[]}
                                    editingActivityIndex={editingActivityIndex}
                                    getBadgeVariantByTransportUid={getBadgeVariantByTransportUid}
                                    onSubcontract={onSubcontract}
                                />
                            </Box>

                            <Card flex={1} p={2}>
                                <Tabs
                                    tabs={[
                                        {
                                            label: t("signature.preview"),
                                            testId: "preview-tab",
                                            content: <TripIndicators trip={trip} />,
                                        },
                                        {
                                            label: t("trip.activityDetails"),
                                            testId: "activity-detail-tab",
                                            content:
                                                editingActivityIndex != null ? (
                                                    <TripActivityEdition
                                                        tripUid={tripUid}
                                                        readOnly={!editable}
                                                        activity={activitySelected}
                                                        activityIndex={editingActivityIndex}
                                                        activityIndexWithoutSimilarCount={getActivityIndexWithoutSimilarCount(
                                                            editingActivityIndex,
                                                            activitySelected,
                                                            activitiesWithFakeMergedAdded
                                                        )}
                                                        setEditingActivityIndex={
                                                            handleActivityIndexChange
                                                        }
                                                        getBadgeVariantByTransportUid={
                                                            getBadgeVariantByTransportUid
                                                        }
                                                    />
                                                ) : null,
                                        },
                                    ]}
                                    key={
                                        editingActivityIndex === null
                                            ? "indicators"
                                            : "activity-edition"
                                    }
                                    initialActiveTab={editingActivityIndex === null ? 0 : 1}
                                    onTabChanged={(n) => {
                                        if (n === 0) {
                                            handleActivityIndexChange(null);
                                        } else if (editingActivityIndex === null) {
                                            handleActivityIndexChange(0);
                                        }
                                    }}
                                />
                            </Card>
                        </Flex>
                    </ErrorBoundary>
                </Box>
            </FullHeightMinWidthScreen>
        </Box>
    );
};

export const TripEdition = React.memo(TripEditionComponent);
