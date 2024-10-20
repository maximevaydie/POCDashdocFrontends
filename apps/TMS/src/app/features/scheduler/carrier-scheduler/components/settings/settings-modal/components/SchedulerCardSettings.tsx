import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Flex, Select, SwitchInput, Text} from "@dashdoc/web-ui";
import {SchedulerCardSettingsData} from "dashdoc-utils";
import React, {useMemo} from "react";

import {getFakeCharteringSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/__mocks__/charteringSegment";
import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {getCardHeight as getCharteringCardHeight} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/hook/useCharteringSegmentCards";
import {SegmentSchedulerCard} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/segment-card/card/SegmentSchedulerCard";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {getFakeTrip} from "app/features/scheduler/carrier-scheduler/trip-scheduler/__mocks__/trip";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {getCardHeight as getTripCardHeight} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/hook/useTripCards";
import {TripSchedulerCard} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/card/TripSchedulerCard";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

type ActivityListModeOptions = {label: string; value: "expand" | "collapsed"};
type ActivityLabelModeOptions = {label: string; value: "name_and_city" | "name" | "city"};

type SchedulerCardSettingsProps = {
    values: SchedulerCardSettingsData;
    setFieldValue: (
        field: keyof SchedulerCardSettingsData,
        value: SchedulerCardSettingsData[keyof SchedulerCardSettingsData]
    ) => void;
    viewMode: TripSchedulerView | CharteringView | DedicatedResourcesView;
};
export function SchedulerCardSettings({
    values,
    setFieldValue,
    viewMode,
}: SchedulerCardSettingsProps) {
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const activityListModeOptions: ActivityListModeOptions[] = useMemo(
        () => [
            {label: t("scheduler.cardSettings.activityMode.expand"), value: "expand"},
            {label: t("scheduler.cardSettings.activityMode.collapsed"), value: "collapsed"},
        ],
        []
    );
    const activityLabelModeOptions: ActivityLabelModeOptions[] = useMemo(
        () => [
            {
                label: t("scheduler.cardSettings.activityLabelMode.name_and_city"),
                value: "name_and_city",
            },
            {label: t("scheduler.cardSettings.activityLabelMode.name"), value: "name"},
            {label: t("scheduler.cardSettings.activityLabelMode.city"), value: "city"},
        ],
        []
    );

    const displayTagTextOptions = [
        {label: t("scheduler.cardSettings.tags.displayMode.colorOnly"), value: false},
        {label: t("scheduler.cardSettings.tags.displayMode.colorAndText"), value: true},
    ] as const;

    const fakeTrip = getFakeTrip();
    const fakeCharteringSegment = getFakeCharteringSegment();

    return (
        <Flex
            justifyContent="space-between"
            padding={4}
            style={{gap: "16px"}}
            overflow="hidden"
            height="100%"
        >
            <Flex
                flex={1}
                flexDirection="column"
                style={{gap: "12px"}}
                backgroundColor="white"
                border="1px solid"
                borderColor="grey.light"
                borderRadius={1}
                px={5}
                py={3}
                overflow="scroll"
            >
                <Text variant="h1">{t("scheduler.cardSettingsTitle")}</Text>
                <Text>{t("scheduler.cardSettingsSubtitle")}</Text>
                <SwitchInput
                    value={values.display_shipper_name}
                    labelRight={t("scheduler.cardSettings.shipper_name_or_trip_name")}
                    onChange={(value) => setFieldValue("display_shipper_name", value)}
                    data-testid="shipper-name-option"
                />
                <SwitchInput
                    value={values.display_activities}
                    labelRight={t("scheduler.cardSettings.display_activities")}
                    onChange={(value) => setFieldValue("display_activities", value)}
                    data-testid="display-activities-option"
                />

                {values.display_activities && (
                    <Box borderLeft="2px solid" borderColor="grey.light" ml={2} pl={6}>
                        <Box mt={1} mb={2}>
                            <Select
                                label={t("scheduler.cardSettings.activity_label_mode")}
                                options={activityLabelModeOptions}
                                isSearchable={false}
                                isClearable={false}
                                value={{
                                    value: values.activity_label_mode,
                                    label: activityLabelModeOptions.find(
                                        (option) => option.value === values.activity_label_mode
                                    )?.label,
                                }}
                                onChange={(option: ActivityLabelModeOptions) =>
                                    setFieldValue("activity_label_mode", option.value)
                                }
                            />
                        </Box>
                        {!hasSchedulerByTimeEnabled && (
                            <>
                                {viewMode !== "chartering" && (
                                    <Box mt={1} mb={2}>
                                        <Select
                                            label={t("scheduler.cardSettings.activity_list_mode")}
                                            options={activityListModeOptions}
                                            isSearchable={false}
                                            isClearable={false}
                                            value={{
                                                value: values.activity_list_mode,
                                                label: activityListModeOptions.find(
                                                    (option) =>
                                                        option.value === values.activity_list_mode
                                                )?.label,
                                            }}
                                            onChange={(option: ActivityListModeOptions) =>
                                                setFieldValue("activity_list_mode", option.value)
                                            }
                                        />
                                    </Box>
                                )}
                                <Box mt={1}>
                                    <Checkbox
                                        checked={values.display_activity_type}
                                        label={t("scheduler.cardSettings.display_activity_type")}
                                        onChange={(value) =>
                                            setFieldValue("display_activity_type", value)
                                        }
                                        data-testid="display-activity-type-option"
                                    />
                                </Box>
                            </>
                        )}
                    </Box>
                )}
                {viewMode !== "chartering" && (
                    <SwitchInput
                        value={values.display_means}
                        labelRight={t("scheduler.cardSettings.display_means")}
                        onChange={(value) => setFieldValue("display_means", value)}
                        data-testid="display-means-option"
                    />
                )}
                <SwitchInput
                    value={values.display_vehicle_requested}
                    labelRight={t("scheduler.cardSettings.display_vehicle_requested")}
                    onChange={(value) => setFieldValue("display_vehicle_requested", value)}
                    data-testid="display-vehicle-requested-option"
                />

                <SwitchInput
                    value={values.display_global_instructions}
                    labelRight={t("transportForm.shipperIntructions")}
                    onChange={(value) => setFieldValue("display_global_instructions", value)}
                    data-testid="display-global-instructions-option"
                />

                <SwitchInput
                    value={values.display_tags}
                    labelRight={t("common.tags")}
                    onChange={(value) => setFieldValue("display_tags", value)}
                    data-testid="display-global-instructions-option"
                />

                {values.display_tags ? (
                    <Box borderLeft="2px solid" borderColor="grey.light" ml={2} pl={6}>
                        <Box mt={1}>
                            <Select
                                label={t("scheduler.cardSettings.tags.displayMode")}
                                options={displayTagTextOptions}
                                isSearchable={false}
                                isClearable={false}
                                value={{
                                    value: values.display_tag_text,
                                    label: displayTagTextOptions.find(
                                        (option) => option.value === values.display_tag_text
                                    )?.label,
                                }}
                                onChange={(option: (typeof displayTagTextOptions)[number]) =>
                                    setFieldValue("display_tag_text", option.value)
                                }
                            />
                        </Box>
                    </Box>
                ) : null}
            </Flex>
            <Box
                flex={1}
                border="1px solid"
                borderColor="grey.light"
                borderRadius={1}
                px={5}
                py={3}
                backgroundColor="white"
                overflow="scroll"
            >
                <Text variant="h1" mb={5}>
                    {t("scheduler.cardSettings.previewTitle")}
                </Text>
                {viewMode === "chartering" || viewMode === "dedicated_resources" ? (
                    <SegmentSchedulerCard
                        charteringSegment={fakeCharteringSegment}
                        height={getCharteringCardHeight(values, fakeCharteringSegment)}
                        settings={values}
                    />
                ) : (
                    <TripSchedulerCard
                        trip={fakeTrip}
                        settings={values}
                        viewMode={viewMode}
                        height={getTripCardHeight(values, fakeTrip)}
                    />
                )}
            </Box>
        </Flex>
    );
}
