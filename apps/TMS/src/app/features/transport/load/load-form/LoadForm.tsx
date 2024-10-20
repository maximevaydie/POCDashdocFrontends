import {apiService, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    AutoCompleteTextInput,
    Box,
    Button,
    Callout,
    Checkbox,
    Flex,
    Icon,
    IconButton,
    NumberInput,
    Select,
    SelectOption,
    Text,
    TextInput,
    TextInputEditableList,
    TextProps,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    COMPLEMENTARY_INFORMATION_SEPARATOR,
    cubicMetersToLiters,
    loadIsQuantifiable,
    PREDEFINED_LOAD_CATEGORIES,
    PredefinedLoadCategory,
} from "dashdoc-utils";
import {FieldArray, FieldArrayRenderProps, Form, FormikProvider, useFormik} from "formik";
import {isEmpty} from "lodash";
import isNil from "lodash.isnil";
import React, {
    forwardRef,
    FunctionComponent,
    Ref,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {AdrFormSection} from "app/features/transport/load/load-form/AdrFormSection";
import useCompanyIsQualimat from "app/hooks/useCompanyIsQualimat";
import {useSelector} from "app/redux/hooks";

import {TransportFormContext} from "../../transport-form/transport-form-context";
import {
    getPreferredLoadCategory,
    getSuggestedLoadDescriptionsOptions,
} from "../../transport-form/transport-form-smart-suggestions";
import {
    FormLoad,
    LoadSmartSuggestion,
    TransportFormDeliveryOption,
} from "../../transport-form/transport-form.types";

import {
    getDeliveryOptions,
    getIdtfNumberOptions,
    getLoadCategoryOptions,
    getLoadCategoryTooltipContent,
    getLoadDisplaySettings,
    getOtherLoadCategoryTooltipContent,
    isEqualDeliveries,
} from "./load-form.helpers";
import {getLoadFormValues, getLoadValidationSchema} from "./load-form.validation";
import useLoadInitialValues from "./useLoadInitialValues";
import {WeightExtractionBanner} from "./WeightExtractionBanner";

type TransportLoadFormProps = {
    deliveries: TransportFormDeliveryOption[];
    showSelectedDelivery: boolean;
    isEditing: boolean;
    initialLoadData?: FormLoad;
    isModifyingFinalInfo?: boolean;
    loadsSmartSuggestionsMap: Map<number, LoadSmartSuggestion>;
    onSubmit: (load: FormLoad) => void | Promise<void>;
    onClose: () => void;
    rootId: string;
    extractedWeight?: number;
};

export const LoadIdentifiersLabel = () => {
    return (
        <Flex alignItems="baseline">
            {t("components.loadIdentifiersCheckboxLabel")}
            &nbsp;
            <TooltipWrapper
                content={
                    <>
                        <Text>{t("components.loadIdentifiersInfoTooltipLine1")}</Text>
                        <Text>{t("components.loadIdentifiersInfoTooltipLine2")}</Text>
                    </>
                }
            >
                <Icon name="info" size="xs" />
            </TooltipWrapper>
        </Flex>
    );
};

export const LoadFormSubHeading: FunctionComponent<TextProps> = (props) => {
    const {children, ...textProps} = props;
    return (
        <Text {...textProps} variant="captionBold" my={2}>
            {children}
        </Text>
    );
};

function TransportLoadForm(
    {
        deliveries,
        showSelectedDelivery,
        initialLoadData,
        isEditing,
        isModifyingFinalInfo,
        loadsSmartSuggestionsMap,
        onSubmit,
        onClose,
        rootId,
        extractedWeight,
    }: TransportLoadFormProps,
    ref: Ref<{submitForm: (submitMode: "save" | "saveAndAdd") => void}>
) {
    const [submitMode, setSubmitMode] = useState<"save" | "saveAndAdd">("save");
    const initialWeight = initialLoadData?.weight || null;
    const [transientWeight, setTransientWeight] = useState(initialWeight);

    const formContext = useContext(TransportFormContext);

    const {transportShape, loadsCount, volumeDisplayUnit, isTemplate, requiresWashing} =
        formContext;

    const loadsCountIncludingEditedLoad = useMemo(
        () => (isEditing ? formContext.loadsCount : formContext.loadsCount + 1),
        [formContext.loadsCount, isEditing]
    );

    const initialValues = useLoadInitialValues(
        // @ts-ignore
        deliveries.length === 1 ? deliveries[0] : null,
        loadsCount > 0 ? {requires_washing: requiresWashing} : {}
    );

    const company = useSelector(getConnectedCompany);

    const isQualimat = useCompanyIsQualimat();

    const getVolumeInDisplayUnit = (volume: number | null) => {
        if (volume != null && volumeDisplayUnit === "L") {
            // volume is handled as m3 from the API
            volume = cubicMetersToLiters(volume);
        }
        return volume;
    };

    const formik = useFormik<FormLoad>({
        initialValues: initialLoadData
            ? {...initialLoadData, volume: getVolumeInDisplayUnit(initialLoadData.volume)}
            : initialValues,
        validationSchema: getLoadValidationSchema(formContext, isQualimat),
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: async (load) => {
            await onSubmit(getLoadFormValues(load, volumeDisplayUnit));
            if (submitMode === "saveAndAdd") {
                formik.resetForm({
                    values: initialValues,
                });
            } else {
                onClose();
            }
        },
    });

    useImperativeHandle(
        ref,
        () => ({
            submitForm: (submitMode: "save" | "saveAndAdd") => {
                setSubmitMode(submitMode);
                formik.submitForm();
            },
            isSubmitting: () => formik.isSubmitting,
        }),
        [formik]
    );

    const isDisplayed = useMemo(() => {
        const result = getLoadDisplaySettings(
            formik.values,
            {
                ...formContext,
                loadsCount: loadsCountIncludingEditedLoad,
            },
            company
        );

        if (!result.multipleRoundsSection) {
            formik.setFieldValue("isMultipleRounds", false);
        }
        if (!result.multipleCompartmentsSection) {
            formik.setFieldValue("isMultipleCompartments", false);
        }

        return result;
    }, [company, formContext, formik.values, loadsCountIncludingEditedLoad]);

    const handleMultipleRoundChange = (value: boolean) => {
        formik.setFieldValue("isMultipleRounds", value);
        if (value) {
            handleIsDangerousChanged(false);
        }
    };

    const handleIsDangerousChanged = (value: boolean) => {
        formik.setFieldValue("is_dangerous", value);
        if (value) {
            formik.setFieldValue("legal_mentions", t("adr.defaultLegalMentions"));
            handleMultipleRoundChange(false);
        } else {
            formik.setFieldValue("adrUnCode", undefined);
            formik.setFieldValue("adrUnDescriptionByLanguage", {});
            formik.setFieldValue("legal_mentions", "");
        }
    };

    const deliveryOptions = getDeliveryOptions(deliveries, showSelectedDelivery);

    const loadCategoryOptions = getLoadCategoryOptions({
        isQualimat,
        transportShape,
        loadsCount: loadsCountIncludingEditedLoad,
        isComplexTransportForm: formContext.isComplexMode,
        alphabeticalSorting: false,
    });

    const [preferredLoadCategory, loadCategoryPredictedBy] = getPreferredLoadCategory(
        formik.values.delivery,
        loadsSmartSuggestionsMap
    );

    const isLoadCategorySmartSuggested = isNil(initialLoadData) && !isNil(loadCategoryPredictedBy);

    const suggestedLoadDescriptionsOptions = getSuggestedLoadDescriptionsOptions(
        formik.values.delivery,
        loadsSmartSuggestionsMap
    );

    const loadCategoryTooltipContent = getLoadCategoryTooltipContent(
        isLoadCategorySmartSuggested,
        formik.touched.category ?? false,
        loadCategoryPredictedBy === "loading"
            ? formik.values.delivery?.loadingActivity
            : formik.values.delivery?.unloadingActivity,
        formik.values.category
    );

    const otherCategoryNameTooltipContent = getOtherLoadCategoryTooltipContent(
        isLoadCategorySmartSuggested,
        formik.touched.category ?? false,
        loadCategoryPredictedBy === "loading"
            ? formik.values.delivery?.loadingActivity
            : formik.values.delivery?.unloadingActivity,
        formik.values.otherCategory
    );

    const initialAdrUnCode = initialLoadData?.adrUnCode?.code;
    useEffect(() => {
        if (!initialAdrUnCode) {
            return;
        }
        apiService.AdrUnCodes.get(initialAdrUnCode, {query: {lookup_field: "code"}}).then(
            (adrCode) => {
                formik.setFieldValue("adrUnCode", adrCode);
            }
        );
    }, [initialAdrUnCode]);

    useEffect(() => {
        // smart suggestions
        if (preferredLoadCategory && isNil(initialLoadData) && !formik.touched.category) {
            if (
                !PREDEFINED_LOAD_CATEGORIES.includes(
                    preferredLoadCategory as PredefinedLoadCategory
                )
            ) {
                formik.setFieldValue("category", "other");
                formik.setFieldValue("otherCategory", preferredLoadCategory);
            } else {
                formik.setFieldValue("category", preferredLoadCategory);
            }
        }
    }, [preferredLoadCategory]);

    const _renderLoadComplementaryInformation = () => {
        return (
            <Flex justifyContent="space-between">
                <Box
                    data-testid="transport-load-complementary-information"
                    flexBasis="100%"
                    mb={2}
                >
                    <TextInput
                        {...formik.getFieldProps("complementary_information")}
                        label={t("components.complementaryInformation")}
                        onChange={(value) => {
                            formik.setFieldValue("complementary_information", value);
                        }}
                        data-testid="complementaryInformation"
                        error={formik.errors.complementary_information}
                    />
                </Box>
            </Flex>
        );
    };
    const _renderRentalLoadComplementaryInformation = () => {
        return (
            <Flex justifyContent="space-between">
                <Box
                    data-testid="transport-load-complementary-information"
                    flexBasis="100%"
                    mb={2}
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    <TextInputEditableList
                        defaultItem={formik.values.complementary_information}
                        onChange={(value) => {
                            formik.setFieldValue("complementary_information", value);
                        }}
                        label={t("components.complementaryInformation")}
                        addItemLabel={t("components.addComplementaryInformation")}
                        error={formik.errors.complementary_information}
                        separator={COMPLEMENTARY_INFORMATION_SEPARATOR}
                    />
                </Box>
            </Flex>
        );
    };

    const renderIdentifiersFieldArray = (arrayHelpers: FieldArrayRenderProps) => {
        if (isEmpty(formik.values.identifiers) || !formik.values.identifiers) {
            return null;
        }
        const {identifiers} = formik.values;

        return (
            <Box
                p={2}
                borderColor={"grey.ultradark"}
                borderWidth={1}
                borderStyle="dashed"
                marginBottom={2}
            >
                {identifiers.map((identifier: string, index: number) => (
                    <Flex key={index} alignItems="center" mb={2}>
                        <Box flex={1}>
                            <TextInput
                                name={`identifiers.${index}`}
                                data-testid={`identifiers.${index}`}
                                label={t("components.loadIdentifiersCodeLabel", {
                                    codeNumber: index + 1,
                                })}
                                value={identifier}
                                onChange={(value) => {
                                    arrayHelpers.replace(index, value);
                                }}
                                required={true}
                                error={formik.errors.identifiers?.[index]}
                            />
                        </Box>
                        <IconButton
                            name="delete"
                            color="red.default"
                            onClick={() => {
                                formik.setFieldValue("quantity", identifiers.length - 1);
                                arrayHelpers.remove(index);
                            }}
                        />
                    </Flex>
                ))}
                <Button
                    type="button"
                    variant="plain"
                    onClick={() => {
                        formik.setFieldValue("quantity", identifiers.length + 1);
                        arrayHelpers.push("");
                    }}
                >
                    <Icon name="add" mr={2} /> {t("components.loadIdentifiersAddIdentifier")}
                </Button>
            </Box>
        );
    };

    return (
        <FormikProvider value={formik}>
            <Form noValidate data-testid="transport-load-form">
                {isModifyingFinalInfo && (
                    <AmendTransportWarningBanner isRental={formik.values.category === "rental"} />
                )}

                <Box>
                    <LoadFormSubHeading>{t("common.general")}</LoadFormSubHeading>

                    {(deliveryOptions.length > 1 || showSelectedDelivery) && (
                        <Box mb={2}>
                            <Select
                                data-testid="load-delivery-select"
                                label={t("common.delivery")}
                                options={deliveryOptions}
                                value={
                                    deliveryOptions.find(({value}) =>
                                        isEqualDeliveries(value, formik.values.delivery)
                                    ) ?? null
                                }
                                onChange={(option: SelectOption) => {
                                    formik.setFieldValue("delivery", option?.value);
                                }}
                                isSearchable={false}
                                required
                                error={formik.errors.delivery as string}
                                key={`delivery-select-${formik.values.uid}`}
                                autoFocus={
                                    !initialLoadData && !isEditing && !formik.values.delivery
                                }
                                isDisabled={deliveryOptions.length <= 1}
                            />
                        </Box>
                    )}

                    <Flex justifyContent="space-between">
                        <Box flexBasis="49.5%" mb={2}>
                            <Select
                                data-testid="load-category-select"
                                label={t("common.loadType")}
                                options={loadCategoryOptions}
                                value={
                                    formik.values.category
                                        ? loadCategoryOptions.find(
                                              ({value}) => value === formik.values.category
                                          )
                                        : null
                                }
                                onChange={(option: SelectOption<PredefinedLoadCategory>) => {
                                    formik.setFieldValue("category", option.value);
                                    formik.setFieldTouched("category", true);
                                    if (
                                        option.value &&
                                        loadIsQuantifiable(option.value) &&
                                        formik.values.quantity === null
                                    ) {
                                        formik.setFieldValue("quantity", undefined);
                                    }

                                    if (option.value === "bulk_qualimat") {
                                        formik.setFieldValue("requiresWashing", true);
                                    }
                                }}
                                isSearchable={false}
                                isClearable={false}
                                iconName={
                                    isLoadCategorySmartSuggested && !formik.touched.category
                                        ? "magicWand"
                                        : undefined
                                }
                                tooltipContent={loadCategoryTooltipContent ?? undefined}
                                required
                                error={formik.errors.category}
                                key={`load-type-${formik.values.uid}`}
                                autoFocus={
                                    !initialLoadData && !isEditing && deliveryOptions.length === 1
                                }
                            />
                        </Box>

                        {formik.values.category === "other" && (
                            <Box
                                data-testid="load-modal-other-category-name"
                                flexBasis="49.5%"
                                mb={2}
                            >
                                <TextInput
                                    {...formik.getFieldProps("otherCategory")}
                                    data-testid="other-category-name"
                                    label={t("common.name")}
                                    onChange={(value) => {
                                        formik.setFieldValue("otherCategory", value);
                                    }}
                                    required
                                    error={formik.errors.otherCategory}
                                    rightIcon={
                                        isLoadCategorySmartSuggested &&
                                        !formik.touched.otherCategory
                                            ? "magicWand"
                                            : undefined
                                    }
                                    rightIconColor="blue.dark"
                                    rightTooltipContent={otherCategoryNameTooltipContent}
                                    rightTooltipPlacement="top"
                                />
                            </Box>
                        )}
                    </Flex>

                    {isDisplayed.missingQualimatVehicleInformation && (
                        <Callout mb={2}>
                            <Text>{t("load.needQualimatVehicleWarningText")}</Text>
                        </Callout>
                    )}

                    {isDisplayed.rentalInformation && (
                        <>
                            <Box>{_renderRentalLoadComplementaryInformation()}</Box>
                            <Callout mb={2}>
                                <Text>{t("transportForm.rentalLoadNotice")}</Text>
                            </Callout>
                        </>
                    )}

                    {!isDisplayed.rentalInformation && (
                        <Box>
                            <Flex justifyContent="space-between">
                                <Box data-testid="load-modal-description" flexBasis="100%" mb={2}>
                                    <AutoCompleteTextInput
                                        {...formik.getFieldProps("description")}
                                        label={t("components.loadType")}
                                        suggestions={suggestedLoadDescriptionsOptions}
                                        suggestionsIcon="magicWand"
                                        onChange={(value) =>
                                            formik.setFieldValue("description", value)
                                        }
                                        required={!isTemplate}
                                        data-testid="input-description"
                                        error={
                                            formik.touched.description && formik.errors.description
                                        }
                                        rootId={rootId}
                                    />
                                </Box>
                            </Flex>
                            {isDisplayed.dangerousSection && (
                                <Callout iconDisabled mb={2}>
                                    {t("adr.natureOfGood")}
                                </Callout>
                            )}
                            {isDisplayed.bulkQualimatSection && (
                                <Flex justifyContent="space-between">
                                    <Box
                                        data-testid="load-modal-idtf-number"
                                        flexBasis="100%"
                                        mb={2}
                                    >
                                        <Select
                                            {...formik.getFieldProps("idtf_number")}
                                            data-testid="load-select-idtf"
                                            label={t("common.IDTFNumber")}
                                            options={getIdtfNumberOptions()}
                                            value={
                                                formik.values.idtf_number
                                                    ? getIdtfNumberOptions().find(
                                                          ({value}) =>
                                                              value === formik.values.idtf_number
                                                      )
                                                    : null
                                            }
                                            onChange={(option: SelectOption<string>) =>
                                                formik.setFieldValue(
                                                    "idtf_number",
                                                    option?.value ?? null
                                                )
                                            }
                                            isSearchable={true}
                                            required
                                            error={formik.errors.idtf_number}
                                        />
                                    </Box>
                                </Flex>
                            )}
                            {_renderLoadComplementaryInformation()}

                            <LoadFormSubHeading>{t("common.quantity")}</LoadFormSubHeading>
                            <WeightExtractionBanner
                                extractedWeight={extractedWeight ?? null}
                                weight={transientWeight ?? null}
                            />
                            <Flex justifyContent="space-between" flexWrap="wrap">
                                {isDisplayed.quantitySection && (
                                    <Box
                                        data-testid="load-modal-quantity"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <NumberInput
                                            {...formik.getFieldProps("quantity")}
                                            label={t("common.quantity")}
                                            maxDecimals={
                                                formik.values.category === "other" ? 2 : 0
                                            }
                                            onChange={(value) => {
                                                formik.setFieldValue("quantity", value);
                                            }}
                                            data-testid="input-quantity"
                                            error={formik.errors.quantity}
                                        />
                                    </Box>
                                )}

                                <Box
                                    data-testid="load-modal-total-weight"
                                    flexBasis="49.5%"
                                    mb={2}
                                >
                                    <NumberInput
                                        {...formik.getFieldProps("weight")}
                                        label={t("components.totalWeight")}
                                        onChange={(value) => {
                                            formik.setFieldValue("weight", value);
                                        }}
                                        data-testid="input-weight"
                                        maxDecimals={2}
                                        error={formik.errors.weight}
                                        onTransientChange={setTransientWeight}
                                    />
                                </Box>

                                <Box data-testid="load-modal-volume" flexBasis="49.5%" mb={2}>
                                    <NumberInput
                                        {...formik.getFieldProps("volume")}
                                        label={
                                            t("components.totalVolume") + ` (${volumeDisplayUnit})`
                                        }
                                        onChange={(value) => {
                                            formik.setFieldValue("volume", value);
                                        }}
                                        data-testid="transport-load-form-volume"
                                        maxDecimals={3}
                                        error={formik.errors.volume}
                                    />
                                </Box>

                                {isDisplayed.linearMetersSection && (
                                    <Box
                                        data-testid="load-modal-linear-meters"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <NumberInput
                                            {...formik.getFieldProps("linear_meters")}
                                            label={t("common.linearMeters")}
                                            onChange={(value) => {
                                                formik.setFieldValue("linear_meters", value);
                                            }}
                                            maxDecimals={2}
                                            data-testid="input-linear-meters"
                                            error={formik.errors.linear_meters}
                                        />
                                    </Box>
                                )}

                                {isDisplayed.plannedReturnablePalletsSection && (
                                    <Box
                                        data-testid="load-modal-planned-returnable-pallets"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <NumberInput
                                            {...formik.getFieldProps("plannedReturnablePallets")}
                                            label={t("components.returnablePallets")}
                                            onChange={(value) => {
                                                formik.setFieldValue(
                                                    "plannedReturnablePallets",
                                                    value
                                                );
                                            }}
                                            data-testid="plannedReturnablePallets"
                                            maxDecimals={0}
                                            error={formik.errors.plannedReturnablePallets}
                                        />
                                    </Box>
                                )}

                                {isDisplayed.roundWoodSection && (
                                    <Box data-testid="load-modal-steres" flexBasis="49.5%" mb={2}>
                                        <NumberInput
                                            {...formik.getFieldProps("steres")}
                                            label={t("common.steres")}
                                            onChange={(value) => {
                                                formik.setFieldValue("steres", value);
                                            }}
                                            data-testid="input-steres"
                                            maxDecimals={3}
                                            error={formik.errors.steres}
                                        />
                                    </Box>
                                )}

                                {isDisplayed.containerSection && (
                                    <Box
                                        data-testid="load-modal-tare-weight"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <NumberInput
                                            {...formik.getFieldProps("tare_weight")}
                                            label={t("components.tareWeight") + " (kg)"}
                                            onChange={(value) => {
                                                formik.setFieldValue("tare_weight", value);
                                            }}
                                            min={0}
                                            maxDecimals={2}
                                            data-testid="input-tare-weight"
                                            error={formik.errors.tare_weight}
                                        />
                                    </Box>
                                )}
                            </Flex>
                            <LoadFormSubHeading>{t("common.specificities")}</LoadFormSubHeading>
                            <Flex justifyContent="space-between">
                                <Box flexBasis="100%" mb={2}>
                                    <Checkbox
                                        {...formik.getFieldProps("requiresWashing")}
                                        label={t("common.requiresWashing")}
                                        checked={formik.values.requiresWashing}
                                        disabled={formik.values.category === "bulk_qualimat"}
                                        onChange={(value) =>
                                            formik.setFieldValue("requiresWashing", value)
                                        }
                                        data-testid="load-requires-washing-checkbox"
                                        error={formik.errors.requiresWashing}
                                    />
                                </Box>
                            </Flex>
                            <Flex justifyContent="space-between">
                                <Box
                                    data-testid="load-form-refrigerated-check"
                                    flexBasis="49.5%"
                                    mb={2}
                                >
                                    <Checkbox
                                        {...formik.getFieldProps("refrigerated")}
                                        label={t("common.controlledTemperature")}
                                        checked={formik.values.refrigerated}
                                        onChange={(value) => {
                                            formik.setFieldValue("refrigerated", value);
                                        }}
                                        data-testid="checkbox-refrigerated"
                                        error={formik.errors.refrigerated}
                                    />
                                </Box>
                                {isDisplayed.refrigeratedSection && (
                                    <Box
                                        data-testid="transport-load-form-refrigerated"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <TextInput
                                            {...formik.getFieldProps("temperature")}
                                            label={t("common.temperature")}
                                            onChange={(value) => {
                                                formik.setFieldValue("temperature", value);
                                            }}
                                            data-testid="input-temperature"
                                            error={formik.errors.temperature}
                                        />
                                    </Box>
                                )}
                            </Flex>
                            {/* --- Container seal number --- */}
                            <Flex justifyContent="space-between">
                                <Box flexBasis="49.5%" mb={2}>
                                    <Checkbox
                                        label={t("components.sealNumber")}
                                        name="check_container_seal_number"
                                        data-testid="check_container_seal_number"
                                        checked={formik.values.sealNumberChecked}
                                        onChange={(value) => {
                                            formik.setFieldValue("sealNumberChecked", value);
                                        }}
                                    />
                                </Box>
                                {formik.values.sealNumberChecked && (
                                    <Box
                                        data-testid="transport-load-form-container-seal-number"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <TextInput
                                            {...formik.getFieldProps("container_seal_number")}
                                            label={t("components.sealNumber")}
                                            onChange={(value) =>
                                                formik.setFieldValue(
                                                    "container_seal_number",
                                                    value
                                                )
                                            }
                                            data-testid="containerSealNumber"
                                            error={formik.errors.container_seal_number}
                                        />
                                    </Box>
                                )}
                            </Flex>
                            {/* --- Dangerous and ADR inputs --- */}
                            {isDisplayed.dangerousCheckbox && (
                                <Flex justifyContent="space-between">
                                    <Box flexBasis="100%" mb={2}>
                                        <Checkbox
                                            {...formik.getFieldProps("is_dangerous")}
                                            label={t("common.dangerousGoods")}
                                            onChange={(value) => handleIsDangerousChanged(value)}
                                            checked={formik.values.is_dangerous}
                                            error={formik.errors.is_dangerous}
                                            data-testid="load-is-dangerous-checkbox"
                                        />
                                    </Box>
                                </Flex>
                            )}
                            {isDisplayed.dangerousSection && (
                                <AdrFormSection formik={formik} rootId={rootId} />
                            )}
                            {/* --- Multiple rounds --- */}
                            {isDisplayed.multipleRoundsSection && (
                                <Flex justifyContent="space-between">
                                    <Box flexBasis="100%" mb={2}>
                                        <Checkbox
                                            {...formik.getFieldProps("isMultipleRounds")}
                                            label={t("loads.multipleRounds")}
                                            checked={formik.values.isMultipleRounds}
                                            onChange={(value) => handleMultipleRoundChange(value)}
                                            data-testid="load-multi-rounds-checkbox"
                                            error={formik.errors.isMultipleRounds}
                                        />
                                    </Box>
                                </Flex>
                            )}
                            {/* --- Multiple compartments --- */}
                            {isDisplayed.multipleCompartmentsSection && (
                                <Flex justifyContent="space-between">
                                    <Box
                                        data-testid="load-modal-container-number"
                                        flexBasis="100%"
                                        mb={2}
                                    >
                                        <Checkbox
                                            {...formik.getFieldProps("isMultipleCompartments")}
                                            label={t("loads.isMultipleCompartments")}
                                            checked={formik.values.isMultipleCompartments}
                                            onChange={(value) =>
                                                formik.setFieldValue(
                                                    "isMultipleCompartments",
                                                    value
                                                )
                                            }
                                            data-testid="load-multi-compartments-checkbox"
                                            error={formik.errors.isMultipleCompartments}
                                        />
                                    </Box>
                                </Flex>
                            )}
                            {/* --- Container number --- */}
                            {isDisplayed.containerSection && (
                                <Flex justifyContent="space-between">
                                    <Box
                                        data-testid="load-modal-check-container-number"
                                        flexBasis="49.5%"
                                        mb={2}
                                    >
                                        <Checkbox
                                            label={t("components.containerNumber")}
                                            name="check_container_number"
                                            checked={formik.values.containerNumberChecked}
                                            onChange={(value) => {
                                                formik.setFieldValue(
                                                    "containerNumberChecked",
                                                    value
                                                );
                                            }}
                                        />
                                    </Box>
                                    {formik.values.containerNumberChecked && (
                                        <Box
                                            data-testid="load-modal-container-number"
                                            flexBasis="49.5%"
                                            mb={2}
                                        >
                                            <TextInput
                                                {...formik.getFieldProps("container_number")}
                                                label={t("components.containerNumber")}
                                                onChange={(value) =>
                                                    formik.setFieldValue("container_number", value)
                                                }
                                                error={formik.errors.container_number}
                                            />
                                        </Box>
                                    )}
                                </Flex>
                            )}
                            {/* --- Identifiers --- */}
                            {loadIsQuantifiable(formik.values.category) && (
                                <Box mb={2}>
                                    <Checkbox
                                        {...formik.getFieldProps("use_identifiers")}
                                        checked={
                                            !isEmpty(formik.values.identifiers) &&
                                            formik.values.use_identifiers
                                        }
                                        disabled={formik.values.category === "bulk_qualimat"}
                                        onChange={(value) => {
                                            formik.setFieldValue("use_identifiers", value);
                                            if (value) {
                                                if (!formik.values.quantity) {
                                                    formik.setFieldValue("identifiers", [""]);
                                                    formik.setFieldValue("quantity", 1);
                                                } else {
                                                    formik.setFieldValue(
                                                        "identifiers",
                                                        Array(formik.values.quantity).fill("")
                                                    );
                                                }
                                            } else {
                                                formik.setFieldValue("identifiers", []);
                                            }
                                        }}
                                        label={<LoadIdentifiersLabel />}
                                        data-testid="use-identifiers-checkbox"
                                        error={formik.errors.use_identifiers}
                                    />
                                    {!isEmpty(formik.values.identifiers) && (
                                        <FieldArray
                                            name="identifiers"
                                            data-testid="use-identifiers-input"
                                            render={renderIdentifiersFieldArray}
                                        />
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Form>
        </FormikProvider>
    );
}

export default forwardRef(TransportLoadForm);
