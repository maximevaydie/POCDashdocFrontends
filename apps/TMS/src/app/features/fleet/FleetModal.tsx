import {
    apiService,
    CompanySelect,
    getConnectedCompany,
    getErrorMessagesFromServerError,
    HasFeatureFlag,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Checkbox,
    DatePicker,
    Flex,
    Modal,
    ModeDescription,
    ModeTypeSelector,
    NumberInput,
    Select,
    SelectCountry,
    SelectOption,
    SwitchInput,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {Company, FleetItem, FuelType, parseDate, Tag, Trailer, Vehicle, yup} from "dashdoc-utils";
import {VehicleRegistered} from "dashdoc-utils/dist/api/scopes/vehicle-registration-systems";
import debounce from "debounce-promise";
import {FormikErrors, FormikProps, FormikProvider, useFormik} from "formik";
import React, {useCallback, useMemo, useState} from "react";
import {useSelector} from "react-redux";

import TelematicFleetForm, {useTelematicFleetForm} from "app/features/fleet/TelematicFleetForm";
import useCompanyIsQualimat from "app/hooks/useCompanyIsQualimat";
import {
    fetchAddTrailer,
    fetchAddVehicle,
    fetchUpdateTrailer,
    fetchUpdateVehicle,
} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {fuelTypeService} from "app/services/transport/fuelType.service";

import {TagSection} from "../core/tags/TagSection";

interface Values {
    license_plate: string;
    fleet_number: string;
    remote_id: string;
    category: string;
    used_for_qualimat_transports: boolean;
    telematic_vendor_name: string;
    telematic_vendor_vehicle_id: string;
    technical_control_deadline: Date | null;
    tachograph_deadline: Date | null;
    speed_limiter_deadline: Date | null;
    country: string;
    fuel_type: FuelType | null;
    gross_combination_weight_in_tons: number | null;
    is_dedicated: boolean;
    dedicated_by_carrier?: Company | null;
}

type FleetModalProps = {
    item?: Vehicle | Trailer;
    type?: FleetItem["type"];
    onSubmit?: () => void;
    onClose: () => void;
};

type RegisteredVehicle = {
    license_plate: string;
    type: "vehicle" | "trailer";
    fuel_type: FuelType | null;
    gross_combination_weight_in_tons: number | null;
};

const useSearchInVehicleRegistrationSystem = (fleetCategory: FleetItem["type"]) => {
    const [lastSearch, setLastSearch] = useState<RegisteredVehicle | null>(null);

    const debouncedFetchRegisteredVehicle = useCallback(
        debounce((license_plate: string) =>
            apiService.VehicleRegistrationSystem.get(license_plate)
        ),
        []
    );

    const searchForRegisteredVehicle = useCallback(
        async (license_plate: string): Promise<RegisteredVehicle | null> => {
            try {
                const {
                    fuel_type,
                    gross_combination_weight_in_tons,
                    kind_is_truck,
                }: VehicleRegistered = await debouncedFetchRegisteredVehicle(license_plate);

                return {
                    license_plate,
                    type: kind_is_truck ? "vehicle" : "trailer",
                    fuel_type,
                    gross_combination_weight_in_tons,
                };
            } catch (ex) {
                if (ex?.status === 404) {
                    return null;
                }

                throw ex;
            }
        },
        [debouncedFetchRegisteredVehicle]
    );

    const handleLicensePlateChanged = useCallback(
        async (license_plate: string) => {
            if (fleetCategory !== "vehicle") {
                return;
            }
            setLastSearch(await searchForRegisteredVehicle(license_plate));
        },
        [fleetCategory, searchForRegisteredVehicle]
    );

    return {
        lastRegisteredVehicle: lastSearch,
        handleLicensePlateChanged,
    };
};

export default function FleetModal({item, type, onSubmit, onClose}: FleetModalProps) {
    const isEditing = !!item;

    const [fleetCategoryTab, setCategoryType] = useState<FleetItem["type"]>("vehicle");
    const fleetCategory = useMemo(() => type || fleetCategoryTab, [fleetCategoryTab, type]);
    const hasDedicatedResourcesEnabled = useFeatureFlag("dedicatedResources");

    const FleetModalValidationSchema = yup.object().shape({
        category: yup.string(),
        fleet_number: yup.string().max(10),
        license_plate: yup.string().max(200),
        remote_id: yup.string().max(100),
        tags: yup.array().of(yup.object()),
        tachograph_deadline: yup.date().nullable(true),
        speed_limiter_deadline: yup.date().nullable(true),
        technical_control_deadline: yup.date().nullable(true),
        used_for_qualimat_transports: yup.boolean().required(),
        fuel_type: yup
            .string()
            .nullable(true)
            .transform((v) => (v === "" ? null : v)),
        gross_combination_weight_in_tons: yup.number().nullable(true),
        is_dedicated: yup.boolean(),
        dedicated_by_carrier: yup
            .object()
            .nullable(true)
            .test(
                "requiredDedicatedToCompany",
                t("common.mandatoryField"),
                (dedicated_by_carrier, context) => {
                    return context.parent.is_dedicated ? !!dedicated_by_carrier : true;
                }
            ),
    });

    // nosemgrep
    const [initialValues, setInitialValues] = useState<Values>({
        license_plate: item?.license_plate ?? "",
        fleet_number: item?.fleet_number ?? "",
        remote_id: item?.remote_id ?? "",
        used_for_qualimat_transports: item?.used_for_qualimat_transports || false,
        category: fleetCategory === "vehicle" ? (item as Vehicle)?.category : "",
        telematic_vendor_name: "",
        telematic_vendor_vehicle_id: "",
        technical_control_deadline: parseDate(item?.technical_control_deadline),
        tachograph_deadline:
            fleetCategory === "vehicle" ? parseDate((item as Vehicle)?.tachograph_deadline) : null,
        speed_limiter_deadline:
            fleetCategory === "vehicle"
                ? parseDate((item as Vehicle)?.speed_limiter_deadline)
                : null,
        country: item?.country ?? "FR",
        fuel_type: fleetCategory === "vehicle" ? ((item as Vehicle)?.fuel_type ?? null) : null,
        gross_combination_weight_in_tons:
            fleetCategory === "vehicle"
                ? ((item as Vehicle)?.gross_combination_weight_in_tons ?? null)
                : null,
        is_dedicated: hasDedicatedResourcesEnabled ? !!item?.dedicated_by_carrier : false,
        dedicated_by_carrier: hasDedicatedResourcesEnabled
            ? (item?.dedicated_by_carrier as Company)
            : undefined,
    });

    const [tags, setTags] = useState<Tag[]>([]);
    const connectedCompany = useSelector(getConnectedCompany);
    const qualimatEnabled = useCompanyIsQualimat();

    const fuelTypesOptions = fuelTypeService.getFuelTypeSelectOptions();

    const fleetCategories: ModeDescription<FleetItem["type"]>[] = useMemo(
        () => [
            {value: "vehicle", label: t("common.vehicle"), icon: "truck"},
            {value: "trailer", label: t("common.trailer"), icon: "trailer"},
        ],
        []
    );

    const {vehicleEligibleForTelematic, telematicVendors, submitTelematic} = useTelematicFleetForm(
        item,
        fleetCategory,
        (link) => {
            setInitialValues((values) => ({
                ...values,
                telematic_vendor_name: link.vendor_name,
                telematic_vendor_vehicle_id: link.vendor_id,
            }));
        }
    );

    const dispatch = useDispatch();

    const submitFunction = useMemo(() => {
        if (fleetCategory === "vehicle") {
            if (isEditing) {
                return fetchUpdateVehicle;
            } else {
                return fetchAddVehicle;
            }
        } else {
            if (isEditing) {
                return fetchUpdateTrailer;
            } else {
                return fetchAddTrailer;
            }
        }
    }, [fleetCategory, isEditing]);

    const submit = useCallback(
        async (values: Partial<Values>) => {
            const errorMessageFn = (error: any) => {
                let message;
                if (error["remote_id"]) {
                    message = t("common.duplicate_remote_id");
                } else if (error["fleet_number"]) {
                    message = t("common.duplicate_fleet_number");
                } else if (error["license_plate"]) {
                    message = t("common.duplicate_license_plate");
                } else {
                    message = t("common.error");
                }

                return message;
            };

            const submitVehicleAction = await dispatch(
                submitFunction(
                    {
                        ...FleetModalValidationSchema.cast(values),
                        carrier: connectedCompany?.pk,
                        tags: item?.tags || tags,
                        ...(item ? {pk: item.pk} : {}),

                        // Dedicated fields
                        is_dedicated: undefined,
                        dedicated_by_carrier: undefined,
                        dedicated_by_carrier_id:
                            !item && values.is_dedicated && values.dedicated_by_carrier
                                ? values.dedicated_by_carrier.pk
                                : undefined,
                    },
                    errorMessageFn
                )
            );
            if ("vehicle" in submitVehicleAction) {
                await submitTelematic(submitVehicleAction.vehicle.pk, {
                    vendor_name: values?.telematic_vendor_name || "",
                    vendor_id: values?.telematic_vendor_vehicle_id || "",
                });
            }
        },
        [dispatch, submitFunction, connectedCompany?.pk, tags, item, submitTelematic]
    );

    const handleSubmit = useCallback(
        async (values: Partial<Values>, formik: FormikProps<Values>) => {
            let success = false;
            try {
                await submit(values);
                success = true;
            } catch (error) {
                const messages = await getErrorMessagesFromServerError(error);
                if (messages.vendor_id) {
                    messages.telematic_vendor_vehicle_id = messages.vendor_id[0];
                }
                if (messages["remote_id"]) {
                    messages.remote_id = t("common.duplicate_remote_id");
                }
                formik.setErrors(messages);
            }
            if (success) {
                onSubmit?.();
                onClose();
            }
        },
        [onSubmit, submit, onClose]
    );

    const formik = useFormik({
        initialValues,
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: FleetModalValidationSchema,
        onSubmit: handleSubmit,
    });

    const {lastRegisteredVehicle, handleLicensePlateChanged} =
        useSearchInVehicleRegistrationSystem(fleetCategory);

    const applyRegisteredVehicle = useCallback(() => {
        if (!lastRegisteredVehicle) {
            return;
        }

        lastRegisteredVehicle.fuel_type &&
            formik.setFieldValue("fuel_type", lastRegisteredVehicle.fuel_type);
        lastRegisteredVehicle.gross_combination_weight_in_tons &&
            formik.setFieldValue(
                "gross_combination_weight_in_tons",
                lastRegisteredVehicle.gross_combination_weight_in_tons
            );
    }, [formik, lastRegisteredVehicle]);

    const shouldShowRegisteredVehicle = useMemo(() => {
        if (
            !lastRegisteredVehicle ||
            formik.values.license_plate !== lastRegisteredVehicle.license_plate
        ) {
            return false;
        }

        const {fuel_type, gross_combination_weight_in_tons} = lastRegisteredVehicle;

        return (
            fuel_type !== formik.values.fuel_type ||
            gross_combination_weight_in_tons !== formik.values.gross_combination_weight_in_tons
        );
    }, [
        formik.values.fuel_type,
        formik.values.gross_combination_weight_in_tons,
        formik.values.license_plate,
        lastRegisteredVehicle,
    ]);

    const modalTitle = useMemo(() => {
        if (fleetCategory === "vehicle") {
            if (isEditing) {
                return t("components.editVehicle");
            } else {
                return t("components.addVehicle");
            }
        } else {
            if (isEditing) {
                return t("components.editTrailer");
            } else {
                return t("components.addTrailer");
            }
        }
    }, [fleetCategory, isEditing]);

    return (
        <Modal
            title={modalTitle}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "add-equipment-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "add-equipment-modal-close",
            }}
            onClose={onClose}
            data-testid="add-equipment-modal"
            size="large"
        >
            <FormikProvider value={formik}>
                <Text variant="h1" mb={4}>
                    {t("common.vehicleType")}
                </Text>
                <ModeTypeSelector
                    modeList={fleetCategories}
                    currentMode={fleetCategory}
                    setCurrentMode={setCategoryType}
                    disabled={isEditing}
                />
                {qualimatEnabled && (
                    <Box mt={4}>
                        <Checkbox
                            label={
                                fleetCategory === "vehicle"
                                    ? t("addVehicle.qualimatCheckbox")
                                    : t("addTrailer.qualimatCheckbox")
                            }
                            data-testid="add-vehicle-qualimatvec-checkbox"
                            name="used_for_qualimat_transports"
                            checked={formik.values.used_for_qualimat_transports}
                            onChange={(checked: boolean) => {
                                let confirmed = true;
                                if (
                                    formik.initialValues.used_for_qualimat_transports === true &&
                                    !checked
                                ) {
                                    confirmed = confirm(t("addVehicle.qualimatUncheckWarning"));
                                }
                                if (confirmed) {
                                    formik.setFieldValue("used_for_qualimat_transports", checked);
                                }
                            }}
                            error={formik.errors.used_for_qualimat_transports}
                        />
                    </Box>
                )}

                <Text variant="h1" my={4}>
                    {t("common.informations")}
                </Text>

                <Flex mb={4}>
                    <Box width="50%">
                        <TextInput
                            {...formik.getFieldProps("license_plate")}
                            label={t("common.licensePlate")}
                            data-testid="add-equipment-modal-plate"
                            onChange={(license_plate: string, e) => {
                                handleLicensePlateChanged(license_plate);
                                formik.handleChange(e);
                            }}
                            error={formik.errors.license_plate}
                        />
                    </Box>
                    <Box ml={4} width="50%">
                        <SelectCountry
                            label={t("common.country")}
                            name="country"
                            data-testid="add-equipment-modal-country"
                            onChange={(country: string) => {
                                formik.setFieldValue("country", country);
                            }}
                            value={formik.values.country || ""}
                            error={formik.errors.country}
                        />
                    </Box>
                </Flex>

                {shouldShowRegisteredVehicle && (
                    <Callout mb={4}>
                        {t("fleet.registeredvehicleFound", {
                            license_plate: lastRegisteredVehicle?.license_plate,
                        })}
                        <ul>
                            {lastRegisteredVehicle?.gross_combination_weight_in_tons && (
                                <li>
                                    {t("common.gross_combination_weight")}:{" "}
                                    <Text display="inline" variant="h2">
                                        {lastRegisteredVehicle?.gross_combination_weight_in_tons}{" "}
                                        {t("pricingMetrics.unit.weight")}
                                    </Text>
                                </li>
                            )}
                            {lastRegisteredVehicle?.fuel_type && (
                                <li>
                                    {t("common.fuel_type")}:{" "}
                                    <Text display="inline" variant="h2">
                                        {fuelTypeService.translateFuelType(
                                            lastRegisteredVehicle?.fuel_type
                                        )}
                                    </Text>
                                </li>
                            )}
                        </ul>
                        <Button variant="plain" onClick={applyRegisteredVehicle}>
                            {t("fleet.useFeatures")}
                        </Button>
                    </Callout>
                )}

                <Flex mb={4}>
                    <Box width="50%">
                        <TextInput
                            {...formik.getFieldProps("fleet_number")}
                            label={t("common.fleetNumber")}
                            data-testid="add-fleet-number-modal"
                            onChange={(_, e) => {
                                formik.handleChange(e);
                            }}
                            error={formik.errors.fleet_number}
                        />
                    </Box>
                    <Box width="50%" ml={4}>
                        <TextInput
                            {...formik.getFieldProps("remote_id")}
                            label={t("components.remoteId")}
                            data-testid="add-remote-id-modal"
                            onChange={(_, e) => {
                                formik.handleChange(e);
                            }}
                            error={formik.errors.remote_id}
                        />
                    </Box>
                </Flex>

                <HasFeatureFlag flagName={"dedicatedResources"}>
                    <Box mb={3}>
                        <SwitchInput
                            value={!!formik.values.is_dedicated}
                            onChange={(value) => formik.setFieldValue("is_dedicated", value)}
                            labelRight={t("fleet.dedicatedFleet")}
                            disabled={!!item}
                            data-testid="dedicated-fleet-switch"
                        />
                        {formik.values.is_dedicated && (
                            <Box mt={3}>
                                <CompanySelect
                                    required
                                    isDisabled={!!item}
                                    companyCategory={"carrier"}
                                    data-testid={"dedicated-fleet-company"}
                                    error={formik.errors.dedicated_by_carrier}
                                    label={t("common.employer")}
                                    onChange={(newCompany: Company) =>
                                        formik.setFieldValue("dedicated_by_carrier", newCompany)
                                    }
                                    value={formik.values.dedicated_by_carrier}
                                    excludeCompaniesPks={
                                        connectedCompany ? [connectedCompany?.pk] : undefined
                                    }
                                />
                            </Box>
                        )}
                    </Box>
                </HasFeatureFlag>

                {!isEditing && (
                    <Box mb={4} data-testid="add-equipment-modal-tags">
                        <TagSection
                            tags={tags}
                            onAdd={(tag) => setTags([...tags, tag])}
                            onDelete={(tag) =>
                                setTags(
                                    tags.filter((t) => {
                                        const key = tag?.pk ? "pk" : "name";
                                        return t[key] !== tag[key];
                                    })
                                )
                            }
                        />
                    </Box>
                )}

                {fleetCategory === "vehicle" && (
                    <>
                        <Text variant="h1" my={4}>
                            {t("common.feature")}
                        </Text>

                        <Flex mb={4}>
                            <Box width="50%">
                                <Select
                                    label={t("common.fuel_type")}
                                    error={formik.errors.fuel_type}
                                    name="fuel_type"
                                    data-testid="add-equipment-modal-fuel-type-field"
                                    options={fuelTypesOptions}
                                    onChange={(option: SelectOption) => {
                                        formik.setFieldError("fuel_type", undefined);
                                        formik.setFieldValue("fuel_type", option?.value ?? null);
                                    }}
                                    value={fuelTypesOptions.find(
                                        ({value}) => value === formik.values.fuel_type
                                    )}
                                    placeholder={t("common.fuel_type.placeholder")}
                                />
                            </Box>
                            <Box width="50%" ml={4}>
                                <NumberInput
                                    label={t("common.gross_combination_weight")}
                                    units={t("pricingMetrics.unit.weight")}
                                    {...formik.getFieldProps("gross_combination_weight_in_tons")}
                                    onChange={(value: number) => {
                                        formik.setFieldValue(
                                            "gross_combination_weight_in_tons",
                                            value
                                        );
                                        formik.setFieldError(
                                            "gross_combination_weight_in_tons",
                                            undefined
                                        );
                                    }}
                                    min={0}
                                />
                            </Box>
                        </Flex>
                        {!!formik.values.gross_combination_weight_in_tons &&
                            formik.values.gross_combination_weight_in_tons >= 1000 && (
                                <Callout mt={2} variant="warning">
                                    {t("addVehicle.warnGcwOutOfBounds")}
                                </Callout>
                            )}
                    </>
                )}

                <Text variant="h1" my={4}>
                    {t("fleet.deadlines")}
                </Text>

                <DatePicker
                    label={t("fleet.technicalControlDeadlinePlaceholder")}
                    data-testid="add-vehicle-modal-tech-control-deadline"
                    error={formik.errors.technical_control_deadline}
                    date={formik.values.technical_control_deadline ?? null}
                    onChange={(date: Date) => {
                        formik.setFieldValue("technical_control_deadline", date);
                    }}
                    placeholder={t("fleet.technicalControlDeadlinePlaceholder")}
                    clearable={true}
                    rootId="react-app-modal-root"
                />

                {fleetCategory === "vehicle" && (
                    <Flex my={4}>
                        <Box width="50%">
                            <DatePicker
                                label={t("fleet.tachographControlDeadlinePlaceholder")}
                                error={
                                    (formik.errors as FormikErrors<Vehicle>).tachograph_deadline
                                }
                                date={formik.values.tachograph_deadline ?? null}
                                onChange={(date: Date) => {
                                    formik.setFieldValue("tachograph_deadline", date);
                                }}
                                placeholder={t("fleet.tachographControlDeadlinePlaceholder")}
                                clearable={true}
                                rootId="react-app-modal-root"
                                data-testid="add-vehicle-modal-tachograph-deadline"
                            />
                        </Box>
                        <Box width="50%" ml={4}>
                            <DatePicker
                                label={t("fleet.speedLimiterControlDeadlinePlaceholder")}
                                error={
                                    (formik.errors as FormikErrors<Vehicle>).speed_limiter_deadline
                                }
                                date={formik.values.speed_limiter_deadline ?? null}
                                onChange={(date: Date) => {
                                    formik.setFieldValue("speed_limiter_deadline", date);
                                }}
                                placeholder={t("fleet.speedLimiterControlDeadlinePlaceholder")}
                                clearable={true}
                                rootId="react-app-modal-root"
                                data-testid="add-vehicle-modal-speed-limiter-deadline"
                            />
                        </Box>
                    </Flex>
                )}

                {vehicleEligibleForTelematic && (
                    <>
                        <Text variant="h1" flexGrow={1} my={4}>
                            {t("settings.telematics")}
                        </Text>

                        <TelematicFleetForm
                            telematicVendors={telematicVendors}
                            setVendorId={(vendorId: string) => {
                                formik.setFieldValue("telematic_vendor_vehicle_id", vendorId);
                            }}
                            setVendorName={(vendorName: string) => {
                                formik.setFieldValue("telematic_vendor_name", vendorName);
                            }}
                            vendorName={formik.values.telematic_vendor_name ?? ""}
                            vendorId={formik.values.telematic_vendor_vehicle_id ?? ""}
                            vendorIdError={formik.errors.telematic_vendor_vehicle_id}
                            vendorNameError={formik.errors.telematic_vendor_name}
                        />
                    </>
                )}
            </FormikProvider>
        </Modal>
    );
}
