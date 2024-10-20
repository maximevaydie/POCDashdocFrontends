import {
    apiService,
    getConnectedManager,
    HasFeatureFlag,
    HasNotFeatureFlag,
    isDateInconsistent,
    SuggestedAddress,
    useTimezone,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    ButtonWithShortcutProps,
    DateTimePicker,
    ErrorMessage,
    Flex,
    FloatingPanelWithValidationButtons,
    Icon,
    SwitchInput,
    Text,
    TextArea,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    ExtractedNewAddress,
    formatDate,
    getSiteZonedAskedDateTimes,
    OriginalAddress,
    parseAndZoneDate,
    SimpleContact,
    zoneDateToISO,
} from "dashdoc-utils";
import {set} from "date-fns";
import {useFormik} from "formik";
import React, {FunctionComponent, useContext, useMemo, useState} from "react";

import {LockRequestedTimesSwitch} from "app/features/transport/transport-details/transport-details-activities/activity/LockRequestedTimesSwitch";
import {AddressAndContactPickerDeprecated} from "app/features/transport/transport-form/address-and-contacts-picker/AddressAndContactPickerDeprecated";
import {ReferenceField} from "app/features/transport/transport-form/ReferenceField";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {useSelector} from "app/redux/hooks";

import {InconsistentDatesCallout} from "../../dates/InconsistentDatesCallout";
import {AddressAndContactsPicker} from "../address-and-contacts-picker/AddressAndContactsPicker";
import {TransportFormContext} from "../transport-form-context";
import {getInitialActivityData} from "../transport-form-initial-values";
import {TransportFormActivity} from "../transport-form.types";
import {getActivityValidationSchema} from "../transport-form.validation";
import {TEST_ID_PREFIX} from "../TransportForm";

type ActivityFormPanelProps = {
    activity: TransportFormActivity | null;
    activityType: "loading" | "unloading";
    onSubmit: (transportFormActivity: TransportFormActivity) => void;
    onClose: () => void;
    suggestedAddresses?: SuggestedAddress[];
    confirmationExtractedAddresses?: (OriginalAddress | ExtractedNewAddress)[];
    confirmationExtractedCodes?: string[];
    activityConfirmationExtractedSlot?: string[];
    minDate?: string;
    maxDate?: string;
    secondaryButton?: {
        label: string;
        onClick: () => void;
    };
};

export const ActivityFormPanel: FunctionComponent<ActivityFormPanelProps> = ({
    activity,
    activityType,
    onSubmit,
    onClose,
    suggestedAddresses,
    confirmationExtractedAddresses,
    confirmationExtractedCodes,
    activityConfirmationExtractedSlot,
    minDate,
    maxDate,
    secondaryButton,
}) => {
    const {transportShape, isRental, isMultipleRounds, isTemplate, isOrder} =
        useContext(TransportFormContext);
    const hasSchedulerByTimeUseAskedDatesEnabled = useFeatureFlag("schedulerByTimeUseAskedDates");
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    // @ts-ignore
    const managerPk = useSelector(getConnectedManager).pk;
    const timezone = useTimezone();
    const formik = useFormik<TransportFormActivity>({
        initialValues: activity ?? getInitialActivityData(managerPk.toString(), activityType),
        validationSchema: getActivityValidationSchema(activityType),
        onSubmit: (values) => {
            onSubmit(values);
            if (submitMode === "saveAndAdd") {
                secondaryButton
                    ? secondaryButton.onClick()
                    : formik.resetForm({
                          values: getInitialActivityData(managerPk.toString(), activityType),
                      });
            } else {
                onClose();
            }
        },
    });
    const [submitMode, setSubmitMode] = useState<"save" | "saveAndAdd">("save");

    const [lastSiteInstructionsInput, setLastSiteInstructionsInput] = useState("");
    const [lastAddressInstructionsInput, setLastAddressInstructionsInput] = useState("");

    const _getActivityAskedDateAndTimes = () => {
        const {zonedStart, zonedEnd} = getSiteZonedAskedDateTimes(formik.values, timezone);

        const {hasSetAskedTimes} = formik.values;

        return {
            arrival_date: zonedStart || undefined,
            arrival_time_min:
                zonedStart && hasSetAskedTimes?.hasSetAskedMinTime
                    ? formatDate(zonedStart, "HH:mm")
                    : "",
            arrival_time_max:
                zonedEnd && hasSetAskedTimes?.hasSetAskedMaxTime
                    ? formatDate(zonedEnd, "HH:mm")
                    : "",
        };
    };

    const handleArrivalDateChange = (date: Date) => {
        const {zonedStart: oldZonedStart, zonedEnd: oldZonedEnd} = getSiteZonedAskedDateTimes(
            formik.values,
            timezone
        );

        const startHours = oldZonedStart ? oldZonedStart.getHours() : 0;
        const startMinutes = oldZonedStart ? oldZonedStart.getMinutes() : 0;

        const endHours = oldZonedEnd ? oldZonedEnd.getHours() : 23;
        const endMinutes = oldZonedEnd ? oldZonedEnd.getMinutes() : 59;

        const zonedStart = set(new Date(date), {hours: startHours, minutes: startMinutes});
        const zonedEnd = set(new Date(date), {hours: endHours, minutes: endMinutes});

        formik.setFieldValue("slots", [
            {
                start: zoneDateToISO(zonedStart, timezone),
                end: zoneDateToISO(zonedEnd, timezone),
            },
        ]);
        formik.setFieldTouched("slots");
    };

    const handleArrivalTimeChange = (newTime: {min?: string; max?: string}) => {
        const {zonedStart: oldZonedStart, zonedEnd: oldZonedEnd} = getSiteZonedAskedDateTimes(
            formik.values,
            timezone
        );

        let newStartHours = 0;
        let newStartMinutes = 0;
        if (newTime.min) {
            const [startHours = "00", startMinutes = "00"] = newTime.min.split(":");
            newStartHours = parseInt(startHours);
            newStartMinutes = parseInt(startMinutes);
            formik.setFieldValue("hasSetAskedTimes.hasSetAskedMinTime", true);
        }
        // If we have newTime with min value equals to null,
        // it means that the user wants to reset the min asked time.
        else if (newTime.min === null) {
            formik.setFieldValue("hasSetAskedTimes.hasSetAskedMinTime", false);
        } else if (oldZonedStart) {
            newStartHours = oldZonedStart.getHours();
            newStartMinutes = oldZonedStart.getMinutes();
        }

        const baseDate = oldZonedStart ? new Date(oldZonedStart) : new Date();

        const zonedStart = set(baseDate, {
            hours: newStartHours,
            minutes: newStartMinutes,
        });

        let newEndHours = 23;
        let newEndMinutes = 59;
        if (newTime.max) {
            const [endHours = "23", endMinutes = "59"] = newTime.max.split(":");
            newEndHours = parseInt(endHours);
            newEndMinutes = parseInt(endMinutes);
            formik.setFieldValue("hasSetAskedTimes.hasSetAskedMaxTime", true);
        }
        // If we have newTime with max value equals to null,
        // it means that the user wants to reset the max asked time.
        else if (newTime.max === null) {
            formik.setFieldValue("hasSetAskedTimes.hasSetAskedMaxTime", false);
        } else if (oldZonedEnd) {
            newEndHours = oldZonedEnd.getHours();
            newEndMinutes = oldZonedEnd.getMinutes();
        }

        const zonedEnd = set(new Date(baseDate), {hours: newEndHours, minutes: newEndMinutes});

        formik.setFieldValue("slots", [
            {
                start: zoneDateToISO(zonedStart, timezone),
                end: zoneDateToISO(zonedEnd, timezone),
            },
        ]);
        formik.setFieldTouched("slots");

        if (hasSchedulerByTimeUseAskedDatesEnabled && hasSchedulerByTimeEnabled) {
            if (
                newStartHours === 0 &&
                newStartMinutes === 0 &&
                newEndHours === 23 &&
                newEndMinutes === 59
            ) {
                formik.setFieldValue("lockedRequestedTimes", false);
            } else if (
                (oldZonedStart === null ||
                    (oldZonedStart.getHours() === 0 && oldZonedStart.getMinutes() === 0)) &&
                (oldZonedEnd === null ||
                    (oldZonedEnd.getHours() === 23 && oldZonedEnd.getMinutes() === 59))
            ) {
                formik.setFieldValue("lockedRequestedTimes", true);
            }
        }
    };

    const {arrival_date, arrival_time_min, arrival_time_max} = _getActivityAskedDateAndTimes();

    const _getActivityExtractedDateAndTimes = (): {
        extractedDate: Date | undefined;
        extractedTimeMin: string;
        extractedTimeMax: string;
    } => {
        if (activityConfirmationExtractedSlot) {
            const slotStartZonedDate = parseAndZoneDate(
                activityConfirmationExtractedSlot[0],
                timezone
            );
            const slotEndZonedDate = parseAndZoneDate(
                activityConfirmationExtractedSlot[1],
                timezone
            );
            let extractedTimeMin = formatDate(slotStartZonedDate, "HH:mm");
            let extractedTimeMax = formatDate(slotEndZonedDate, "HH:mm");
            if (extractedTimeMin === "00:00" && extractedTimeMax === "00:00") {
                // in that case we assume that we did not extract any time and that this is the default time
                extractedTimeMin = extractedTimeMax = "";
            }

            return {
                extractedDate: slotStartZonedDate as Date, // for now we assume start and end are the same date, and extracted date will only be use for date not for time
                extractedTimeMin,
                extractedTimeMax,
            };
        } else {
            return {extractedDate: undefined, extractedTimeMin: "", extractedTimeMax: ""};
        }
    };
    const {extractedDate, extractedTimeMin, extractedTimeMax} =
        _getActivityExtractedDateAndTimes();

    const handleAddressChange = async (address: OriginalAddress | undefined) => {
        const previousAddressPk =
            formik.values.address && "created_by" in formik.values.address
                ? (formik.values.address.pk ?? formik.values.address.original)
                : undefined;
        formik.setFieldValue("address", address);
        if (address?.pk !== previousAddressPk) {
            formik.setFieldValue("contact", null);
            formik.setFieldValue("contacts", []);
        }

        // Here we are refetching the address because the object `address` here does
        // not have all the needed attribute, especially not the `instructions` attribute.
        if (address) {
            const detailedAddress = await apiService.Addresses.get(address.pk);
            let addressInstructions = "";
            if (detailedAddress.instructions) {
                setLastAddressInstructionsInput(detailedAddress.instructions);
                addressInstructions = detailedAddress.instructions;
            }

            const newInstructions = [lastSiteInstructionsInput, addressInstructions]
                .filter(Boolean)
                .join(" ");
            formik.setFieldValue("instructions", newInstructions);
            if (!formik.touched.isBookingNeeded) {
                formik.setFieldValue("isBookingNeeded", address.has_flow_site);
            }
        }
    };

    const handleAddressChangeWithExtractedNewAddress = async (address: ExtractedNewAddress) => {
        formik.setFieldValue("address", address);
        formik.setFieldValue("contact", null);
        formik.setFieldValue("contacts", []);
    };

    const handleChangeSiteInstructions = (value: string) => {
        formik.setFieldValue("instructions", value);
        setLastSiteInstructionsInput(
            lastAddressInstructionsInput
                ? value.substring(0, value.indexOf(lastAddressInstructionsInput))
                : value
        );
    };

    const canSaveAndAdd =
        !activity &&
        !isMultipleRounds &&
        !isRental &&
        (activityType === "loading"
            ? transportShape !== "ungrouping"
            : transportShape !== "grouping");

    const secondaryButtons = useMemo(() => {
        const buttons: ButtonWithShortcutProps[] = [
            {
                variant: "plain",
                onClick: onClose,
                children: <Text>{t("common.cancel")}</Text>,
                shortcutKeyCodes: ["Escape"],
                tooltipLabel: "<i>escap</i>",
            },
        ];
        if (secondaryButton || canSaveAndAdd) {
            buttons.push({
                variant: "secondary",
                onClick: () => {
                    setSubmitMode("saveAndAdd");
                    formik.submitForm();
                },
                shortcutKeyCodes: ["Control", "Shift", "Enter"],
                tooltipLabel: "<i>ctrl + shift + enter</i>",
                children: secondaryButton?.label ?? t("common.validateAndAdd"),
            });
        }

        return buttons;
    }, [canSaveAndAdd, formik, onClose, secondaryButton]);

    const isInconsistent = isDateInconsistent(
        parseAndZoneDate(formik.values?.slots[0]?.start, timezone),
        parseAndZoneDate(formik.values?.slots[0]?.end, timezone),
        timezone,
        minDate,
        maxDate
    );
    const field = activityType === "loading" ? "origin" : "destination";

    return (
        <FloatingPanelWithValidationButtons
            width={0.33}
            minWidth={528}
            onClose={onClose}
            title={
                activity?.address
                    ? activityType === "loading"
                        ? t("transportForm.editLoading")
                        : t("transportForm.editUnloading")
                    : activityType === "loading"
                      ? t("transportForm.addLoading")
                      : t("transportForm.addUnloading")
            }
            mainButton={{
                onClick: () => {
                    setSubmitMode("save");
                    formik.submitForm();
                },
            }}
            secondaryButtons={secondaryButtons}
            data-testid={
                activityType == "loading"
                    ? `${TEST_ID_PREFIX}add-loading-panel`
                    : `${TEST_ID_PREFIX}add-unloading-panel`
            }
        >
            <Text variant="h1" mb={3}>
                {" "}
                {/*
// @ts-ignore */}
                {t("common.general", null, {capitalize: true})}
            </Text>
            <HasFeatureFlag flagName="recipientsOrder">
                <AddressAndContactsPicker
                    field={field}
                    address={formik.values.address ?? null}
                    onAddressChange={handleAddressChange}
                    onTouchedField={(field) => formik.setFieldTouched(field)}
                    addressRequiredError={
                        formik.touched.address ? (formik.errors.address as string) : undefined
                    }
                    suggestedAddresses={suggestedAddresses}
                    confirmationExtractedAddresses={confirmationExtractedAddresses}
                    key={`${activityType}_address_${formik.values.uid}`}
                    autoFocus={!activity?.address}
                    isRequired={true}
                    contacts={formik.values.contacts || null}
                    onContactsChange={(contacts: SimpleContact[]) => {
                        formik.setFieldValue("contacts", contacts);
                    }}
                    onAddressChangeWithExtractedNewAddress={
                        handleAddressChangeWithExtractedNewAddress
                    }
                />
            </HasFeatureFlag>
            <HasNotFeatureFlag flagName="recipientsOrder">
                <AddressAndContactPickerDeprecated
                    field={field}
                    address={formik.values.address ?? null}
                    contact={formik.values.contact ?? null}
                    onAddressChange={handleAddressChange}
                    onContactChange={(value) => formik.setFieldValue("contact", value)}
                    onTouchedField={(field) => formik.setFieldTouched(field)}
                    addressRequiredError={
                        formik.touched.address ? (formik.errors.address as string) : undefined
                    }
                    suggestedAddresses={suggestedAddresses}
                    confirmationExtractedAddresses={confirmationExtractedAddresses}
                    key={`${activityType}_address_${formik.values.uid}`}
                    autoFocus={!activity?.address}
                    isRequired={true}
                    onAddressChangeWithExtractedNewAddress={
                        handleAddressChangeWithExtractedNewAddress
                    }
                />
            </HasNotFeatureFlag>
            <ReferenceField
                field={field}
                confirmationExtractedCodes={confirmationExtractedCodes}
                reference={formik.values.reference ?? null}
                referenceCompanyPk={
                    formik.values.address && "company" in formik.values.address
                        ? (formik.values.address.company?.pk ?? null)
                        : null
                }
                onChange={(value) => formik.setFieldValue("reference", value)}
            />

            {!isTemplate && (
                <>
                    <Text variant="h1" mb={3} mt={5}>
                        {activityType === "loading"
                            ? t("common.askedPickupDate")
                            : t("common.askedDeliveryDate")}
                    </Text>
                    <DateTimePicker
                        date={arrival_date ?? null}
                        timeMin={arrival_time_min}
                        timeMax={arrival_time_max}
                        onDateChange={handleArrivalDateChange}
                        onTimeChange={handleArrivalTimeChange}
                        hasTimeError={!!formik.errors.slots && !!formik.touched.slots}
                        specialDate={extractedDate}
                        specialDateIcon="robot"
                        specialTimeMin={extractedTimeMin}
                        specialTimeMax={extractedTimeMax}
                        specialTimeIcon="robot"
                    />
                    {formik.errors.slots && formik.touched.slots && (
                        <ErrorMessage error={formik.errors.slots as unknown as string} />
                    )}
                    <LockRequestedTimesSwitch
                        value={formik.values.lockedRequestedTimes ?? false}
                        onChange={(value) => {
                            formik.setFieldValue("lockedRequestedTimes", value);
                            formik.setFieldTouched("lockedRequestedTimes");
                        }}
                    />

                    {isInconsistent && <InconsistentDatesCallout />}
                </>
            )}

            {!isTemplate && (
                <>
                    <Text variant="h1" mb={3} mt={5}>
                        {t("common.options")}
                    </Text>
                    <SwitchInput
                        value={formik.values.isBookingNeeded}
                        onChange={(value) => {
                            formik.setFieldValue("isBookingNeeded", value);
                            formik.setFieldTouched("isBookingNeeded");
                        }}
                        labelRight={
                            <Flex alignItems="center">
                                {t("transportForm.bookingNeeded")}{" "}
                                <TooltipWrapper content={t("transportForm.bookingNeededTooltip")}>
                                    <Icon name="info" ml={2} />
                                </TooltipWrapper>
                            </Flex>
                        }
                    />
                    <Box mb={2} />
                    <SwitchInput
                        value={formik.values.etaTracking}
                        onChange={(value) => {
                            formik.setFieldValue("etaTracking", value);
                            formik.setFieldTouched("etaTracking");
                        }}
                        labelRight={t("common.eta")}
                    />
                    {formik.errors.etaTracking && formik.touched.etaTracking && (
                        <ErrorMessage error={formik.errors.etaTracking as unknown as string} />
                    )}
                </>
            )}
            <Flex alignItems="center" mb={3} mt={5}>
                <Text variant="h1">
                    {activityType === "loading"
                        ? t("transportForm.activityInstructionsLoadingTitle")
                        : t("transportForm.activityInstructionsUnloadingTitle")}
                </Text>
                <TooltipWrapper
                    content={
                        activityType === "loading"
                            ? t("transportForm.activityInstructionsLoadingTooltip")
                            : t("transportForm.activityInstructionsUnloadingTooltip")
                    }
                >
                    <Icon name="info" ml={2} />
                </TooltipWrapper>
            </Flex>

            <TextArea
                pt={3}
                css={{lineHeight: "20px"}}
                minHeight={50}
                maxLength={1000}
                id="loading_instructions"
                onChange={handleChangeSiteInstructions}
                placeholder={
                    activityType === "loading"
                        ? t("transportsForm.activityInstructionsLoadingPlaceholder")
                        : t("transportsForm.activityInstructionsUnloadingPlaceholder")
                }
                value={formik.values.instructions}
                data-testid={`input-instructions-${activityType}`}
                rows={1}
            />
            {!isOrder && (
                <>
                    <Flex alignItems="center" my={2}>
                        <Text variant="h1">{t("transportsForm.truckerInstructions")}</Text>
                        <TooltipWrapper
                            content={
                                activityType === "loading"
                                    ? t("transportForm.truckerInstructionsLoadingTooltip")
                                    : t("transportForm.truckerInstructionsUnloadingTooltip")
                            }
                        >
                            <Icon name="info" ml={2} />
                        </TooltipWrapper>
                    </Flex>
                    <Box>
                        <TextArea
                            pt={3}
                            css={{lineHeight: "20px"}}
                            minHeight={50}
                            maxLength={1000}
                            rows={1}
                            value={formik.values.truckerInstructions}
                            onChange={(value) =>
                                formik.setFieldValue("truckerInstructions", value)
                            }
                            type="text"
                            placeholder={t("transportsForm.truckerInstructionsPlaceholder")}
                        />
                    </Box>
                </>
            )}
        </FloatingPanelWithValidationButtons>
    );
};
