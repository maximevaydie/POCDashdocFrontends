import {
    apiService,
    getConnectedCompany,
    HasFeatureFlag,
    HasNotFeatureFlag,
    useFeatureFlag,
    type UpdatablePartner,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    ErrorMessage,
    FloatingPanelWithValidationButtons,
    SelectOption,
    Text,
} from "@dashdoc/web-ui";
import {
    NO_TRAILER,
    NO_TRUCKER,
    NO_VEHICLE,
    SimpleContact,
    SiteSlot,
    Trailer,
    Trucker,
    Vehicle,
    type Company,
    type OriginalAddress,
} from "dashdoc-utils";
import {getIn, useFormik, useFormikContext} from "formik";
import React, {useContext, useEffect, useMemo} from "react";
import {useSelector} from "react-redux";

import {RequestedVehicleSelect} from "app/features/fleet/requested-vehicle/RequestedVehicleSelect";
import {TruckerCreatableSelect} from "app/features/fleet/trucker/TruckerSelect";
import {
    getNoTrailerOption,
    TrailerPlateSelect,
    VehiclePlateSelect,
} from "app/features/fleet/vehicle/plate-select";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {useSendToTrucker} from "app/features/transport/hooks/useSendToTrucker";
import {AddressAndContactPickerDeprecated} from "app/features/transport/transport-form/address-and-contacts-picker/AddressAndContactPickerDeprecated";
import {AddressAndContactsPicker} from "app/features/transport/transport-form/address-and-contacts-picker/AddressAndContactsPicker";
import {CarrierAndContactsPicker} from "app/features/transport/transport-form/address-and-contacts-picker/CarrierAndContactsPicker";
import {useAutoFillMeans} from "app/features/transport/transport-form/hooks/useAutoFillMeans";
import {ReferenceField} from "app/features/transport/transport-form/ReferenceField";
import {useSlimCompany} from "app/hooks/useSlimCompany";

import {TransportFormContext} from "../transport-form-context";
import {useInitialMeansData} from "../transport-form-initial-values";
import {
    AutoFilledMeansFields,
    TransportFormMeans,
    TransportFormValues,
} from "../transport-form.types";
import {getMeansValidationSchema} from "../transport-form.validation";
import {TEST_ID_PREFIX} from "../TransportForm";

type Props = {
    onSubmit: (value: TransportFormMeans | null) => void;
    onClose: () => void;
    automaticMeansEnabled: boolean;
    setAutomaticMeansEnabled: (value: boolean) => void;
    autoFilledMeansFields: AutoFilledMeansFields | null;
    setAutoFilledMeansFields: (
        value:
            | AutoFilledMeansFields
            | ((prevValue: AutoFilledMeansFields | null) => AutoFilledMeansFields | null)
            | null
    ) => void;
    setPredictiveMeansField: (value: "trucker" | "trailer" | "vehicle") => void;
    setLastAssociatedMeansRequestStatus: (value: string) => void;
    confirmationExtractedCodes: string[];
    tripIndex?: number;
};

export function MeansFormPanel({
    onSubmit,
    onClose,
    automaticMeansEnabled,
    setAutomaticMeansEnabled,
    autoFilledMeansFields,
    setAutoFilledMeansFields,
    setPredictiveMeansField,
    setLastAssociatedMeansRequestStatus,
    confirmationExtractedCodes,
    tripIndex,
}: Props) {
    const {
        values: {loadings, unloadings, trips, means},
    } = useFormikContext<TransportFormValues>();

    const initialMeans = tripIndex != null ? trips[tripIndex].means : means;

    const {isOrder, isTemplate} = useContext(TransportFormContext);

    const company = useSelector(getConnectedCompany);
    const companyPk = company?.pk;

    const requiredCarrier = !isOrder && company?.settings?.default_role === "carrier";
    const initialValues = useInitialMeansData(isOrder);
    const hasRecipientsOrderEnabled = useFeatureFlag("recipientsOrder");
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    const transportDateRange: SiteSlot | undefined = useMemo(() => {
        let start: string | undefined = undefined;
        let end: string | undefined = undefined;
        [...loadings, ...unloadings].map((activity) => {
            if (activity.slots.length > 0) {
                const slot = activity.slots[0];
                if (!start || slot.start < start) {
                    start = slot.start;
                }
                if (!end || slot.end > end) {
                    end = slot.end;
                }
            }
        });
        return start && end ? {start, end} : undefined;
    }, [loadings, unloadings]);

    const formik = useFormik<TransportFormMeans>({
        initialValues: initialMeans ?? initialValues,
        validationSchema: getMeansValidationSchema(
            isOrder,
            companyPk,
            company?.settings ?? null,
            hasRecipientsOrderEnabled,
            hasBetterCompanyRolesEnabled
        ),
        onSubmit: (value) => {
            if (isCarrierSelf) {
                // When the carrier of the transport is also the current company,
                // then sendToCarrier must be true in all cases.
                value.sendToCarrier = true;
            }
            if (
                !value.carrier?.address &&
                !value.carrier?.carrier &&
                !value.carrier?.contact &&
                !value.carrier?.reference
            ) {
                value.carrier = undefined;
            }
            if (
                Object.keys(value).findIndex(
                    (key) => value[key as keyof TransportFormMeans] !== null
                ) === -1
            ) {
                onSubmit(null);
            } else {
                onSubmit(value);
            }
            onClose();
        },
    });

    let isCarrierSelf: boolean =
        companyPk != null && formik.values.carrier?.address?.company?.pk === companyPk;
    if (hasBetterCompanyRolesEnabled) {
        isCarrierSelf = companyPk != null && formik.values.carrier?.carrier?.pk === companyPk;
    }
    const carrierSlimCompany = useSlimCompany(
        hasBetterCompanyRolesEnabled
            ? formik.values.carrier?.carrier
            : //TODO: Partial<Company> is not compatible with Company
              (formik.values.carrier?.address?.company as any as Company | undefined)
    );

    const hasCarrier = hasBetterCompanyRolesEnabled
        ? formik.values.carrier?.carrier
        : formik.values.carrier?.address;
    const carrierId = hasBetterCompanyRolesEnabled
        ? formik.values.carrier?.carrier?.pk
        : formik.values.carrier?.address?.pk;

    const {persistSendToCarrier} = useSendToCarrier();
    useEffect(() => {
        if (isCarrierSelf && !isOrder) {
            formik.setFieldValue("selectedVehicle", undefined);
        }
    }, [isOrder, isCarrierSelf]);

    function handleCarrierAddressChange(value: OriginalAddress) {
        formik.setFieldValue("carrier.address", value);
        formik.setFieldValue("carrier.contact", null);
        formik.setFieldValue("trucker", null);
        formik.setFieldValue("vehicle", null);
        formik.setFieldValue("trailer", null);
    }

    function handleCarrierChange(value: UpdatablePartner | null) {
        formik.setFieldValue("carrier.carrier", value);
        formik.setFieldValue("carrier.contact", null);
        formik.setFieldValue("trucker", null);
        formik.setFieldValue("vehicle", null);
        formik.setFieldValue("trailer", null);
    }

    const {autoFillMeans, getAutoFilledFieldIcon} = useAutoFillMeans({
        onAutoFillTrucker: (trucker: Trucker) => formik.setFieldValue("trucker", trucker),
        onAutoFillVehicle: (vehicle: Vehicle) => formik.setFieldValue("vehicle", vehicle),
        onAutoFillTrailer: (trailer: Trailer) => formik.setFieldValue("trailer", trailer),
    });

    const {persistSendToTrucker} = useSendToTrucker();

    const handleTruckerChange = (option: SelectOption<Trucker> | null) => {
        const trucker = option?.value;
        formik.setFieldValue("trucker", trucker);

        if (automaticMeansEnabled && trucker != null) {
            // Auto fill means from means combination
            if (trucker?.means_combination) {
                const autoFilledMeans = autoFillMeans("trucker", trucker);
                setAutoFilledMeansFields(autoFilledMeans);
                setAutomaticMeansEnabled(false);
                return;
            }

            // Auto fill means from last associated means (smart suggestion)
            apiService.Truckers.getLastAssociatedMeans(trucker.pk, {}, {apiVersion: "web"})
                .then((lastAssociatedMeans) => {
                    setLastAssociatedMeansRequestStatus("successful request");
                    setPredictiveMeansField("trucker");
                    const truckerName = trucker.display_name;
                    const newAutoFilledMeansFields: AutoFilledMeansFields = {
                        source: "smartSuggestion",
                    };

                    // Check if user did not fill it during the api call and if there is a result
                    if (!formik.values.vehicle && lastAssociatedMeans.vehicle !== null) {
                        if (lastAssociatedMeans.vehicle === NO_VEHICLE) {
                            newAutoFilledMeansFields.vehicle = t(
                                "smartSuggests.automaticFieldTooltipContent.vehicle.noValue.predictedByTrucker",
                                {truckerName}
                            );
                        } else {
                            if (lastAssociatedMeans.vehicle.license_plate) {
                                formik.setFieldValue("vehicle", lastAssociatedMeans.vehicle);
                                newAutoFilledMeansFields.vehicle = t(
                                    "smartSuggests.automaticFieldTooltipContent.vehicle.value.predictedByTrucker",
                                    {
                                        licensePlate: lastAssociatedMeans.vehicle.license_plate,
                                        truckerName,
                                    }
                                );
                            }
                        }
                    }

                    // Check if user did not fill it during the api call if there is a result
                    if (!formik.values.trailer && lastAssociatedMeans.trailer !== null) {
                        if (lastAssociatedMeans.trailer === NO_TRAILER) {
                            newAutoFilledMeansFields.trailer = t(
                                "smartSuggests.automaticFieldTooltipContent.trailer.noValue.predictedByTrucker",
                                {truckerName}
                            );
                        } else {
                            if (lastAssociatedMeans.trailer.license_plate) {
                                formik.setFieldValue("trailer", lastAssociatedMeans.trailer);
                                newAutoFilledMeansFields.trailer = t(
                                    "smartSuggests.automaticFieldTooltipContent.trailer.value.predictedByTrucker",
                                    {
                                        licensePlate: lastAssociatedMeans.trailer.license_plate,
                                        truckerName,
                                    }
                                );
                            }
                        }
                    }
                    setAutoFilledMeansFields(newAutoFilledMeansFields);
                })
                .catch(() => {
                    setLastAssociatedMeansRequestStatus("failed request");
                });
        } else {
            setAutoFilledMeansFields((prevValue) => {
                if (!prevValue) {
                    return null;
                }
                return {...prevValue, trucker: undefined};
            });
        }
        setAutomaticMeansEnabled(false);
    };

    const handleVehicleChange = (option: SelectOption<Vehicle | string> | null) => {
        const isNew = option?.__isNew__;
        const vehicle = (isNew ? {license_plate: option.value} : option?.value) as Vehicle | null;
        formik.setFieldValue("vehicle", vehicle);

        if (automaticMeansEnabled && vehicle != null && !isNew) {
            // Auto fill means from means combination if available
            if (vehicle?.means_combination) {
                const newAutoFilledMeansFields = autoFillMeans("vehicle", vehicle);
                setAutoFilledMeansFields(newAutoFilledMeansFields);
                setAutomaticMeansEnabled(false);
                return;
            }

            // Auto fill means from last associated means (smart suggestion)
            apiService.Vehicles.getLastAssociatedMeans(vehicle.pk)
                .then((lastAssociatedMeans) => {
                    setLastAssociatedMeansRequestStatus("successful request");
                    setPredictiveMeansField("trucker");
                    const newAutoFilledMeansFields: AutoFilledMeansFields = {
                        source: "smartSuggestion",
                    };

                    const vehicleLicensePlate = vehicle.license_plate;

                    // Check if user did not fill it during the api call and if there is a result
                    if (!formik.values.trucker && lastAssociatedMeans.trucker !== null) {
                        if (lastAssociatedMeans.trucker === NO_TRUCKER) {
                            newAutoFilledMeansFields.trucker = t(
                                "smartSuggests.automaticFieldTooltipContent.trucker.noValue.predictedByVehicle",
                                {vehicleLicensePlate}
                            );
                        } else {
                            formik.setFieldValue("trucker", lastAssociatedMeans.trucker);
                            newAutoFilledMeansFields.trucker = t(
                                "smartSuggests.automaticFieldTooltipContent.trucker.value.predictedByVehicle",
                                {
                                    truckerName: lastAssociatedMeans.trucker.display_name,
                                    vehicleLicensePlate,
                                }
                            );
                        }
                    }

                    // Check if user did not fill it during the api call if there is a result
                    if (!formik.values.trailer && lastAssociatedMeans.trailer !== null) {
                        if (lastAssociatedMeans["trailer"] === NO_TRAILER) {
                            newAutoFilledMeansFields.trailer = t(
                                "smartSuggests.automaticFieldTooltipContent.trailer.noValue.predictedByVehicle",
                                {vehicleLicensePlate}
                            );
                        } else {
                            if (lastAssociatedMeans.trailer.license_plate) {
                                formik.setFieldValue("trailer", lastAssociatedMeans.trailer);
                                newAutoFilledMeansFields.trailer = t(
                                    "smartSuggests.automaticFieldTooltipContent.trailer.value.predictedByVehicle",
                                    {
                                        licensePlate: lastAssociatedMeans.trailer.license_plate,
                                        vehicleLicensePlate,
                                    }
                                );
                            }
                        }
                    }

                    setAutoFilledMeansFields(newAutoFilledMeansFields);
                })
                .catch(() => {
                    setLastAssociatedMeansRequestStatus("failed request");
                });
        } else {
            setAutoFilledMeansFields((prevValue) => {
                if (!prevValue) {
                    return null;
                }
                return {...prevValue, vehicle: undefined};
            });
        }
        setAutomaticMeansEnabled(false);
    };

    const handleTrailerChange = (option: SelectOption<Trailer | string>) => {
        const isNew = option?.__isNew__;
        const trailer = (isNew ? {license_plate: option.value} : option?.value) as Trailer | null;
        formik.setFieldValue("trailer", trailer);

        if (automaticMeansEnabled && trailer != null && !isNew) {
            // Auto fill means from means combination
            if (trailer.means_combination) {
                const newAutoFilledMeansFields = autoFillMeans("trailer", trailer);
                setAutoFilledMeansFields(newAutoFilledMeansFields);
                setAutomaticMeansEnabled(false);
                return;
            }

            // Auto fill means from last associated means (smart suggestion)
            apiService.Trailers.getLastAssociatedMeans(trailer.pk)
                .then((lastAssociatedMeans) => {
                    setLastAssociatedMeansRequestStatus("successful request");
                    setPredictiveMeansField("trailer");
                    const newAutoFilledMeansFields: AutoFilledMeansFields = {
                        source: "smartSuggestion",
                    };

                    const trailerLicensePlate = trailer.license_plate;

                    // Check if user did not fill it during the api call and if there is a result
                    if (!formik.values.trucker && lastAssociatedMeans.trucker !== null) {
                        if (lastAssociatedMeans.trucker === NO_TRUCKER) {
                            newAutoFilledMeansFields.trucker = t(
                                "smartSuggests.automaticFieldTooltipContent.trucker.noValue.predictedByTrailer",
                                {trailerLicensePlate}
                            );
                        } else {
                            formik.setFieldValue("trucker", lastAssociatedMeans.trucker);
                            newAutoFilledMeansFields.trucker = t(
                                "smartSuggests.automaticFieldTooltipContent.trucker.value.predictedByTrailer",
                                {
                                    truckerName: lastAssociatedMeans["trucker"].display_name,
                                    trailerLicensePlate,
                                }
                            );
                        }
                    }

                    // Check if user did not fill it during the api call and if there is a result
                    if (!formik.values.vehicle && lastAssociatedMeans["vehicle"] !== null) {
                        if (lastAssociatedMeans["vehicle"] === NO_VEHICLE) {
                            newAutoFilledMeansFields.vehicle = t(
                                "smartSuggests.automaticFieldTooltipContent.vehicle.noValue.predictedByTrailer",
                                {trailerLicensePlate}
                            );
                        } else {
                            if (lastAssociatedMeans.vehicle.license_plate) {
                                formik.setFieldValue("vehicle", lastAssociatedMeans.vehicle);
                                newAutoFilledMeansFields.vehicle = t(
                                    "smartSuggests.automaticFieldTooltipContent.vehicle.value.predictedByTrailer",
                                    {
                                        licensePlate: lastAssociatedMeans["vehicle"].license_plate,
                                        trailerLicensePlate,
                                    }
                                );
                            }
                        }
                    }

                    setAutoFilledMeansFields(newAutoFilledMeansFields);
                })
                .catch(() => {
                    setLastAssociatedMeansRequestStatus("failed request");
                });
        } else {
            setAutoFilledMeansFields((prevValue) => {
                if (!prevValue) {
                    return null;
                }
                return {...prevValue, trailer: undefined};
            });
        }
        setAutomaticMeansEnabled(false);
    };

    return (
        <FloatingPanelWithValidationButtons
            width={0.33}
            minWidth={528}
            onClose={onClose}
            title={t("common.means")}
            mainButton={{
                onClick: () => {
                    formik.submitForm();
                },
            }}
            data-testid={`${TEST_ID_PREFIX}add-means-panel`}
        >
            <Text variant="h1" mb={3}>
                {t("common.carrier")}
            </Text>
            <HasNotFeatureFlag flagName="betterCompanyRoles">
                <HasFeatureFlag flagName="recipientsOrder">
                    <AddressAndContactsPicker
                        field="carrier"
                        address={formik.values.carrier?.address || null}
                        onAddressChange={handleCarrierAddressChange}
                        onTouchedField={(field) => formik.setFieldTouched(`carrier.${field}`)}
                        addressRequiredError={
                            getIn(formik.touched, "carrier.address")
                                ? getIn(formik.errors, "carrier.address")
                                : undefined
                        }
                        isClearable={!requiredCarrier}
                        isRequired={requiredCarrier}
                        autoFocus={!initialMeans && (isTemplate || !requiredCarrier)}
                        contacts={formik.values.carrier?.contacts ?? []}
                        onContactsChange={(contacts: SimpleContact[]) => {
                            formik.setFieldValue("carrier.contacts", contacts);
                        }}
                        displayTooltip
                    />
                </HasFeatureFlag>
                <HasNotFeatureFlag flagName="recipientsOrder">
                    <AddressAndContactPickerDeprecated
                        field="carrier"
                        address={formik.values.carrier?.address ?? null}
                        contact={formik.values.carrier?.contact ?? null}
                        onAddressChange={handleCarrierAddressChange}
                        onContactChange={(value) => formik.setFieldValue("carrier.contact", value)}
                        onTouchedField={(field) => formik.setFieldTouched(`carrier.${field}`)}
                        addressRequiredError={
                            getIn(formik.touched, "carrier.address")
                                ? getIn(formik.errors, "carrier.address")
                                : undefined
                        }
                        isClearable={!requiredCarrier}
                        isRequired={requiredCarrier}
                        autoFocus={!initialMeans && (isTemplate || !requiredCarrier)}
                        displayTooltip
                    />
                </HasNotFeatureFlag>
                <ReferenceField
                    field="carrier"
                    confirmationExtractedCodes={confirmationExtractedCodes}
                    reference={formik.values.carrier?.reference ?? null}
                    referenceCompanyPk={
                        formik.values.carrier?.address &&
                        "company" in formik.values.carrier.address
                            ? (formik.values.carrier.address?.company.pk ?? null)
                            : null
                    }
                    onChange={(value) => formik.setFieldValue("carrier.reference", value)}
                />
            </HasNotFeatureFlag>
            <HasFeatureFlag flagName="betterCompanyRoles">
                <CarrierAndContactsPicker
                    direction="column"
                    isClearable={!requiredCarrier}
                    isRequired={requiredCarrier}
                    autoFocus={!initialMeans && (isTemplate || !requiredCarrier)}
                    carrier={formik.values.carrier?.carrier ?? null}
                    onCarrierChange={handleCarrierChange}
                    contacts={formik.values.carrier?.contacts ?? []}
                    onContactsChange={(contacts: SimpleContact[]) => {
                        formik.setFieldValue("carrier.contacts", contacts);
                    }}
                    onTouchedContacts={() => formik.setFieldTouched("carrier.contacts")}
                />
                <ReferenceField
                    field="carrier"
                    confirmationExtractedCodes={confirmationExtractedCodes}
                    reference={formik.values.carrier?.reference ?? null}
                    referenceCompanyPk={formik.values.carrier?.carrier?.pk ?? null}
                    onChange={(value) => formik.setFieldValue("carrier.reference", value)}
                />
            </HasFeatureFlag>

            {getIn(formik.errors, "carrier.contact") && (
                <ErrorMessage
                    error={getIn(formik.errors, "carrier.contact") as string}
                    data-testid="missing-contact-error"
                />
            )}

            {getIn(formik.errors, "carrier.contacts") && (
                <ErrorMessage
                    error={getIn(formik.errors, "carrier.contacts") as string}
                    data-testid="missing-contacts-error"
                />
            )}

            {!isCarrierSelf && !isTemplate && hasCarrier && (
                <Box pt={3}>
                    <Checkbox
                        checked={!!formik.values?.sendToCarrier}
                        onChange={(value) => {
                            formik.setFieldValue("sendToCarrier", value);
                            persistSendToCarrier(value);
                        }}
                        label={t("components.sendToCarrier")}
                        data-testid="means-send-to-carrier-checkbox"
                    />
                </Box>
            )}

            {!isOrder && !isTemplate && hasCarrier && (
                <>
                    <Text variant="h1" mb={3} mt={5}>
                        {t("common.trucker")}
                    </Text>
                    <TruckerCreatableSelect
                        key={`trucker-${carrierId}`} // hacky way to reload the truckers list when carrier change
                        label={t("common.trucker")}
                        value={formik.values.trucker ? {value: formik.values.trucker} : null}
                        onChange={handleTruckerChange}
                        iconName={
                            autoFilledMeansFields?.trucker
                                ? getAutoFilledFieldIcon(autoFilledMeansFields?.source)
                                : null
                        }
                        tooltipContent={autoFilledMeansFields?.trucker}
                        rentalCarrierCompany={!isCarrierSelf ? carrierSlimCompany : undefined}
                        autoFocus={!initialMeans && !isOrder}
                        data-testid="trucker-select"
                        dateRange={transportDateRange}
                    />

                    {formik.values.trucker && (
                        <Box mt={3} ml="2px">
                            <Checkbox
                                checked={!!formik.values?.sendToTrucker}
                                onChange={(value) => {
                                    formik.setFieldValue("sendToTrucker", value);
                                    persistSendToTrucker(value);
                                }}
                                label={t("components.sendToTrucker")}
                                data-testid="send-to-trucker-checkbox"
                            />
                        </Box>
                    )}

                    {isCarrierSelf && (
                        <>
                            <Text variant="h1" mb={3} mt={5}>
                                {t("components.licensePlate")}
                            </Text>
                            <VehiclePlateSelect
                                label={t("common.vehiclePlate")}
                                value={
                                    formik.values.vehicle ? {value: formik.values.vehicle} : null
                                }
                                onChange={handleVehicleChange}
                                iconName={
                                    autoFilledMeansFields?.vehicle
                                        ? getAutoFilledFieldIcon(autoFilledMeansFields.source)
                                        : null
                                }
                                tooltipContent={autoFilledMeansFields?.vehicle}
                                data-testid="vehicle-select"
                                dateRange={transportDateRange}
                            />
                            <Box mb={3} />
                            <TrailerPlateSelect
                                label={t("common.trailerPlate")}
                                value={
                                    formik.values.trailer
                                        ? {value: formik.values.trailer}
                                        : {value: getNoTrailerOption()}
                                }
                                onChange={handleTrailerChange}
                                iconName={
                                    autoFilledMeansFields?.trailer
                                        ? getAutoFilledFieldIcon(autoFilledMeansFields.source)
                                        : null
                                }
                                tooltipContent={autoFilledMeansFields?.trailer}
                                data-testid="trailer-select"
                                dateRange={transportDateRange}
                            />
                        </>
                    )}
                </>
            )}

            <Text variant="h1" mb={3} mt={5}>
                {t("common.vehicle")}
            </Text>
            <RequestedVehicleSelect
                requestedVehicle={formik.values.requestedVehicle}
                onChange={(value) => formik.setFieldValue("requestedVehicle", value)}
                data-testid="vehicle-type-input"
                error={formik.errors.requestedVehicle}
            />
        </FloatingPanelWithValidationButtons>
    );
}
