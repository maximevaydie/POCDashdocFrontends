import {getConnectedCompany, useDispatch, useSelector, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, DatePicker, Flex, Modal, SelectOption, Text} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {Trailer, Vehicle, companyIsQualimat, parseAndZoneDate, zoneDateToISO} from "dashdoc-utils";
import {isAfter, isBefore} from "date-fns";
import React, {useState} from "react";

import {
    PlateSelectOption,
    TrailerPlateSelect,
    VehiclePlateSelect,
} from "app/features/fleet/vehicle/plate-select";
import {setActivityDateError} from "app/features/transport/transport-details/transport-details-activities/activity/activity-date.service";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchMarkSiteDone} from "app/redux/actions";
import {fetchAssignTrip} from "app/redux/actions/trips";
import {activityService} from "app/services/transport/activity.service";

import type {Activity} from "app/types/transport";

type Props = {
    isOnlyCreator: boolean;
    activity: Activity & {type: "loading" | "unloading"};
    title: string;
    onFinish: () => void;
};

export function MarkActivityDoneForm({isOnlyCreator, activity, title, onFinish}: Props) {
    const dateRange = activityService.getDateRangeToMarkDone(activity.segment, activity.type);
    const timezone = useTimezone();
    const extendedView = useExtendedView();
    const dispatch = useDispatch();
    const isCompanyQualimat = useSelector((state) =>
        companyIsQualimat(getConnectedCompany(state))
    );

    const [doneDates, setDoneDates] = useState<{onSiteDate: Date; completeDate: Date}>({
        onSiteDate: parseAndZoneDate(new Date(dateRange.start), timezone),
        completeDate: parseAndZoneDate(new Date(dateRange.end), timezone),
    });
    const {onSiteDate, completeDate} = doneDates;
    const [selectedVehicle, setSelectedVehicle] = useState<Partial<Vehicle> | undefined>(
        activity.segment?.vehicle ?? undefined
    );
    const [selectedTrailer, setSelectedTrailer] = useState<Partial<Trailer | undefined>>(
        activity.segment?.trailers[0]
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{selectedVehicle?: string; selectedTrailer?: string}>({});

    const dateError = () => setActivityDateError(activity, onSiteDate, completeDate);

    const validateQualimat = () => {
        let hasErrors = false;
        const errors: {selectedVehicle?: string; selectedTrailer?: string} = {};
        if (!selectedVehicle?.license_plate && isCompanyQualimat) {
            hasErrors = true;
            errors.selectedVehicle = t("errors.field_cannot_be_empty");
        }
        setErrors(errors);
        return !hasErrors;
    };

    const handleSubmit = async () => {
        if (dateError() !== null) {
            return;
        }

        const segment = activity.segment;

        if (
            isCompanyQualimat &&
            (segment == null || segment.child_transport == null) &&
            !validateQualimat() &&
            !isOnlyCreator
        ) {
            return;
        }

        setLoading(true);

        // If a segment is provided and the company has Qualimat feature enabled,
        // An segment update call is done before the mark-done call, to ensure the segment has vehicles plates

        if (
            segment &&
            segment.child_transport == null &&
            isCompanyQualimat &&
            (selectedVehicle?.license_plate !== segment.vehicle?.license_plate ||
                selectedTrailer?.license_plate !== segment.trailers[0]?.license_plate)
        ) {
            try {
                await dispatch(
                    fetchAssignTrip(
                        activity.site.trip?.uid as string,
                        segment?.trucker?.pk ?? null,
                        selectedVehicle?.license_plate ?? null,
                        selectedTrailer?.license_plate ?? null,
                        false, // Send to trucker
                        Boolean(extendedView),
                        null,
                        null,
                        false,
                        timezone,
                        false // delete Scheduled Dates
                    )
                );
            } catch {
                return;
            }
        }

        await dispatch(
            fetchMarkSiteDone?.(
                activity.site.uid,
                activity.type,
                zoneDateToISO(onSiteDate, timezone) as string,
                zoneDateToISO(completeDate, timezone) as string
            )
        );

        setLoading(false);
        onFinish();
    };

    const handleMinDateChange = (date: Date) => {
        setDoneDates((prev) => {
            const dates = {
                onSiteDate: new Date(date),
                completeDate: prev.completeDate,
            };
            if (date && isAfter(date, prev.completeDate)) {
                dates.completeDate = new Date(date);
            }
            return dates;
        });
    };

    const handleMaxDateChange = (date: Date) => {
        setDoneDates((prev) => {
            const dates = {
                completeDate: new Date(date),
                onSiteDate: prev.onSiteDate,
            };
            if (date && isBefore(date, prev.onSiteDate)) {
                dates.onSiteDate = new Date(date);
            }
            return dates;
        });
    };

    const handleVehicleChange = (option: SelectOption<Vehicle | string>) => {
        setSelectedVehicle(
            typeof option?.value === "string"
                ? ({
                      license_plate: option.value,
                  } as Partial<Vehicle>)
                : option?.value
        );
    };

    const handleTrailerChange = (option: SelectOption<Trailer | string>) => {
        setSelectedTrailer(
            typeof option?.value === "string"
                ? {
                      license_plate: option.value,
                  }
                : option?.value
        );
    };

    const renderDateError = () => {
        const error = dateError();
        if (error === null) {
            return null;
        }

        const errorMessageDict = {
            "start-before-end": t("activity.errors.startBeforeEnd"),
            "unloading-start-before-loading-end": t("activity.errors.unloadingBeforeLoading"),
        };

        return (
            <Text color="red.default" data-testid="mark-site-done-date-error">
                {errorMessageDict[error]}
            </Text>
        );
    };

    return (
        <Modal
            title={title}
            onClose={onFinish}
            id="update-site-arrival-date-modal"
            data-testid="update-site-arrival-date-modal"
            mainButton={{
                onClick: handleSubmit,
                disabled: loading || dateError() !== null,
                loading: loading,
                children: t("common.save"),
                "data-testid": "save-mark-site-done-button",
            }}
            additionalFooterContent={renderDateError()}
        >
            <Flex alignItems="center" flexWrap="wrap" mb={4}>
                <Text mr={2} width={["100%", "45%", "45%"]}>
                    {t("markActivityDone.onSiteDate")}
                </Text>

                <DatePicker
                    date={onSiteDate}
                    onChange={handleMinDateChange}
                    error={dateError() === "unloading-start-before-loading-end"}
                    showTime={true}
                    textInputWidth="150px"
                    rootId="react-app-modal-root"
                    data-testid="mark-site-done-date-picker-start"
                />
            </Flex>
            <Flex alignItems="center" flexWrap="wrap" mb={4}>
                <Text mr={2} width={["100%", "45%", "45%"]}>
                    {t("markActivityDone.completeDate")}
                </Text>
                <DatePicker
                    date={completeDate}
                    onChange={handleMaxDateChange}
                    error={dateError() === "start-before-end"}
                    showTime={true}
                    textInputWidth="150px"
                    rootId="react-app-modal-root"
                    data-testid="mark-site-done-date-picker-end"
                />
            </Flex>

            {isOnlyCreator && isCompanyQualimat && !activity.segment?.vehicle && (
                <Callout
                    mt={4}
                    variant="warning"
                    data-testid="mark-transport-done-qualimat-warning"
                >
                    {t("markTransportDoneModal.qualimatHistoryWillBeIncompleteOnCarrierSide")}
                </Callout>
            )}
            {isCompanyQualimat && activity.segment?.child_transport == null && !isOnlyCreator && (
                <>
                    <Box
                        mb={4}
                        mt={4}
                        ml="-15px"
                        data-testid="mark-site-done-modal-assign-vehicle"
                    >
                        <FormGroup
                            label={t("common.vehicle")}
                            mandatory
                            error={errors.selectedVehicle}
                        >
                            <VehiclePlateSelect
                                value={
                                    selectedVehicle
                                        ? {
                                              value: selectedVehicle,
                                              label: selectedVehicle.license_plate ?? undefined,
                                          }
                                        : null
                                }
                                onChange={handleVehicleChange}
                                isDisabled={false}
                                formatOptionLabel={(option) => <PlateSelectOption {...option} />}
                            />
                        </FormGroup>
                    </Box>
                    <Box ml="-15px" data-testid="mark-site-done-modal-assign-trailer">
                        <FormGroup
                            label={t("common.trailer")}
                            mandatory={false}
                            error={errors.selectedTrailer}
                        >
                            <TrailerPlateSelect
                                value={
                                    selectedTrailer
                                        ? {
                                              value: selectedTrailer,
                                              label: selectedTrailer.license_plate ?? undefined,
                                          }
                                        : null
                                }
                                onChange={handleTrailerChange}
                                isDisabled={false}
                                formatOptionLabel={(option) => <PlateSelectOption {...option} />}
                            />
                        </FormGroup>
                    </Box>
                </>
            )}
        </Modal>
    );
}
