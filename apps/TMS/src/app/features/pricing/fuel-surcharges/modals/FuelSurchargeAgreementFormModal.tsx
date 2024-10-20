import {AnalyticsEvent, analyticsService, getConnectedCompany} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    DatePicker,
    Flex,
    Icon,
    Modal,
    NumberInput,
    Select,
    SelectOption,
    Text,
    TextInput,
    theme,
} from "@dashdoc/web-ui";
import {
    ApplicationDateType,
    FuelPriceIndex,
    FuelSurchargeAgreement,
    FuelSurchargeAgreementOwnerType,
    Nullable,
    formatDate,
    formatNumber,
    yup,
} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import isNil from "lodash.isnil";
import omitBy from "lodash.omitby";
import React, {useState} from "react";

import {FuelPriceIndexSelector} from "app/features/pricing/fuel-surcharges/FuelPriceIndexSelector";
import {FuelSurchargeAgreementExplanation} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementExplanation";
import {FuelPriceIndexFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexFormModal";
import {fetchAddFuelPriceIndex} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useDispatch, useSelector} from "app/redux/hooks";

export enum ActiveFieldValues {
    "FUEL_SURCHARGE" = "FUEL_SURCHARGE",
    "APPLICATION_DATE_TYPE" = "APPLICATION_DATE_TYPE",
    "FUEL_PRICE_INDEX" = "FUEL_PRICE_INDEX",
    "REFERENCE_DATE" = "REFERENCE_DATE",
    "REFERENCE_PRICE" = "REFERENCE_PRICE",
    "FUEL_PART" = "FUEL_PART",
}

export type ActiveField = keyof typeof ActiveFieldValues;

type FuelSurchargeAgreementFormModalProps = {
    ownerType: FuelSurchargeAgreementOwnerType;
    onClose: () => void;
    onSubmit: (fuelSurchargeAgreement: FuelSurchargeAgreement) => void;
};

export const FuelSurchargeAgreementFormModal: React.FC<FuelSurchargeAgreementFormModalProps> = ({
    ownerType,
    onClose,
    onSubmit,
}) => {
    const dispatch = useDispatch();
    const connectedCompany = useSelector(getConnectedCompany);

    const [activeField, setActiveField] = useState<ActiveField>("FUEL_SURCHARGE");
    const [isFuelPriceIndexFormModalOpen, setIsFuelPriceIndexFormModalOpen] = useState(false);
    const [selectedApplicationDateType, setSelectedApplicationDateType] =
        useState<SelectOption | null>(null);

    const fuelSurchargeAgreementFormValidationSchema = yup.object().shape({
        name: yup.string().required(t("errors.field_cannot_be_empty")),
        application_date_type: yup.string().required(),
        reference_date: yup.date().required(t("errors.field_cannot_be_empty")),
        reference_price: yup.number().required(t("errors.field_cannot_be_empty")),
        fuel_part: yup
            .number()
            .max(100, t("errors.max_length"))
            .required(t("errors.field_cannot_be_empty")),
        fuel_price_index: yup.object().shape({
            name: yup.string(),
            source: yup.string(),
            last_update_price: yup.number().nullable(true),
            last_update_date: yup.date().nullable(true),
        }),
    });

    const applicationDateTypeOptions = [
        {
            label: t("fuelSurcharges.creationDateOption"),
            value: ApplicationDateType.CREATION_DATE,
        },
        {
            label: t("fuelSurcharges.realLoadingDateOption"),
            value: ApplicationDateType.REAL_LOADING_DATE,
        },
        {
            label: t("fuelSurcharges.plannedLoadingDateOption"),
            value: ApplicationDateType.PLANNED_LOADING_DATE,
        },
        {
            label: t("fuelSurcharges.askedLoadingDateOption"),
            value: ApplicationDateType.ASKED_LOADING_DATE,
        },
        {
            label: t("fuelSurcharges.realUnloadingDateOption"),
            value: ApplicationDateType.REAL_UNLOADING_DATE,
        },
        {
            label: t("fuelSurcharges.plannedUnloadingDateOption"),
            value: ApplicationDateType.PLANNED_UNLOADING_DATE,
        },
        {
            label: t("fuelSurcharges.askedUnloadingDateOption"),
            value: ApplicationDateType.ASKED_UNLOADING_DATE,
        },
    ];

    const formik = useFormik<
        Nullable<
            Pick<
                FuelSurchargeAgreement,
                | "owner_type"
                | "name"
                | "reference_date"
                | "reference_price"
                | "fuel_price_index"
                | "fuel_part"
                | "application_date_type"
            >
        >
    >({
        initialValues: {
            owner_type: ownerType,
            name: null,
            application_date_type: null,
            reference_date: null,
            reference_price: null,
            fuel_price_index: null,
            fuel_part: null,
        },
        onSubmit: onConfirm,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: fuelSurchargeAgreementFormValidationSchema,
    });

    const isFuelPriceIndex =
        !!formik.values.fuel_price_index?.last_update_date ||
        !!formik.values.fuel_price_index?.last_update_price;

    return (
        <Modal
            title={t(
                ownerType === FuelSurchargeAgreementOwnerType.CARRIER
                    ? "fuelSurcharges.newSaleFuelSurchargeAgreement"
                    : "fuelSurcharges.newPurchaseFuelSurchargeAgreement"
            )}
            mainButton={{
                type: "submit",
                form: "form-fuel-surcharge-agreement",
                children: t("common.create"),
                disabled: formik.isSubmitting,
            }}
            secondaryButton={{
                onClick: onClose,
            }}
            onClose={onClose}
            size="large"
        >
            <Flex>
                <Flex flex="1.5" borderRight="1px solid" borderColor="grey.light">
                    <FormikProvider value={formik}>
                        <Form
                            id="form-fuel-surcharge-agreement"
                            onSubmit={formik.handleSubmit}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                rowGap: "16px",
                                width: "100%",
                                paddingRight: "20px",
                            }}
                        >
                            <Text variant="h1" color="grey.dark">
                                {t("fuelSurcharges.general")}
                            </Text>

                            <Flex style={{columnGap: "8px"}}>
                                <Box
                                    flex="1"
                                    onFocus={() =>
                                        setActiveField(ActiveFieldValues.FUEL_SURCHARGE)
                                    }
                                >
                                    <TextInput
                                        required
                                        label={t("fuelSurcharges.nameFuelSurcharge")}
                                        value={formik.values.name as string}
                                        error={formik.errors.name as string}
                                        onChange={(name: string) =>
                                            formik.setFieldValue("name", name)
                                        }
                                        data-testid="fuel-surcharge-agreement-creation-modal-name-input"
                                    />
                                </Box>
                                <Box
                                    flex="1"
                                    onFocus={() =>
                                        setActiveField(ActiveFieldValues.APPLICATION_DATE_TYPE)
                                    }
                                >
                                    <Select
                                        required
                                        styles={{
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: theme.zIndices.topbar,
                                            }),
                                            option: (base, prop) => ({
                                                ...base,
                                                borderBottom: [
                                                    t("fuelSurcharges.creationDateOption"),
                                                    t("fuelSurcharges.askedLoadingDateOption"),
                                                ].includes(prop.label)
                                                    ? "1px solid #c4cdd5"
                                                    : "0",
                                            }),
                                        }}
                                        isClearable={false}
                                        menuPortalTarget={document.body}
                                        label={t("fuelSurcharges.dateTypeToUse")}
                                        options={applicationDateTypeOptions}
                                        value={selectedApplicationDateType}
                                        error={
                                            formik.errors.application_date_type
                                                ? t("errors.field_cannot_be_empty")
                                                : undefined
                                        }
                                        onChange={(applicationDateType: SelectOption) => {
                                            formik.setFieldValue(
                                                "application_date_type",
                                                applicationDateType?.value ?? null
                                            );
                                            setSelectedApplicationDateType(applicationDateType);
                                        }}
                                        data-testid="fuel-surcharge-agreement-creation-modal-date-type-input"
                                    />
                                </Box>
                            </Flex>
                            <Flex
                                flexDirection="column"
                                style={{rowGap: "16px"}}
                                borderRadius="5px"
                            >
                                <Text variant="h2">{t("fuelSurcharges.referenceValues")}</Text>

                                <Box
                                    onFocus={() =>
                                        setActiveField(ActiveFieldValues.FUEL_PRICE_INDEX)
                                    }
                                >
                                    <FuelPriceIndexSelector
                                        onChange={(fuel_price_index) => {
                                            formik.setFieldValue(
                                                "fuel_price_index",
                                                fuel_price_index
                                            );
                                        }}
                                        errorMessage={
                                            formik.errors.fuel_price_index
                                                ? t("errors.field_cannot_be_empty")
                                                : null
                                        }
                                        fuelPriceIndex={formik.values.fuel_price_index}
                                        onCreateFuelPriceIndex={() =>
                                            setIsFuelPriceIndexFormModalOpen(true)
                                        }
                                        data-testid="fuel-surcharge-agreement-creation-modal-price-index-input"
                                    />
                                </Box>

                                <Flex style={{columnGap: "8px"}}>
                                    <Box
                                        flex="1"
                                        onFocus={() =>
                                            setActiveField(ActiveFieldValues.REFERENCE_DATE)
                                        }
                                    >
                                        <DatePicker
                                            required
                                            label={t("fuelSurcharges.initialDate")}
                                            date={formik.values.reference_date as Date}
                                            onChange={(reference_date) =>
                                                formik.setFieldValue(
                                                    "reference_date",
                                                    reference_date
                                                )
                                            }
                                            rootId="react-app-modal-root"
                                            error={formik.errors.reference_date as string}
                                            data-testid="fuel-surcharge-agreement-creation-modal-initial-date-input"
                                        />
                                    </Box>
                                    <Box
                                        flex="1"
                                        onFocus={() =>
                                            setActiveField(ActiveFieldValues.REFERENCE_PRICE)
                                        }
                                    >
                                        <NumberInput
                                            required
                                            min={0}
                                            maxDecimals={4}
                                            units="€"
                                            textAlign="left"
                                            label={t("fuelSurcharges.initialPrice")}
                                            value={formik.values.reference_price}
                                            error={formik.errors.reference_price as string}
                                            onChange={(reference_price: number) =>
                                                formik.setFieldValue(
                                                    "reference_price",
                                                    reference_price
                                                )
                                            }
                                            data-testid="fuel-surcharge-agreement-creation-modal-initial-price-input"
                                        />
                                    </Box>
                                </Flex>
                                <Box onFocus={() => setActiveField(ActiveFieldValues.FUEL_PART)}>
                                    <NumberInput
                                        required
                                        units="%"
                                        textAlign="left"
                                        label={t("fuelSurcharges.fuelPart")}
                                        value={formik.values.fuel_part}
                                        error={formik.errors.fuel_part as string}
                                        onChange={(fuel_part: number) =>
                                            formik.setFieldValue("fuel_part", fuel_part)
                                        }
                                        data-testid="fuel-surcharge-agreement-creation-modal-transport-part-input"
                                    />
                                </Box>
                            </Flex>

                            {isFuelPriceIndex && (
                                <Flex
                                    bg="grey.light"
                                    p="2"
                                    borderRadius="5px"
                                    flexDirection="column"
                                    style={{columnGap: "8px"}}
                                >
                                    <Flex style={{columnGap: "8px"}} alignItems="center">
                                        <Icon name="info" />
                                        <Text>{t("fuelSurcharges.lastUpdateIndex")}</Text>
                                    </Flex>
                                    <Flex>
                                        <Box flex="1">
                                            {formik.values.fuel_price_index?.last_update_date && (
                                                <Text>
                                                    {t("fuelSurcharges.applicationDate")}
                                                    {t("common.colon")}
                                                    {formatDate(
                                                        formik.values.fuel_price_index
                                                            .last_update_date as Date,
                                                        "dd/MM/yyyy"
                                                    )}
                                                </Text>
                                            )}
                                        </Box>
                                        <Box flex="1">
                                            {formik.values.fuel_price_index?.last_update_price && (
                                                <Text>
                                                    {t("common.price")}
                                                    {t("common.colon")}
                                                    {formatNumber(
                                                        formik.values.fuel_price_index
                                                            .last_update_price,
                                                        {
                                                            style: "currency",
                                                            currency: "EUR",
                                                            maximumFractionDigits: 2,
                                                        }
                                                    )}
                                                </Text>
                                            )}
                                        </Box>
                                    </Flex>
                                </Flex>
                            )}
                        </Form>
                    </FormikProvider>
                </Flex>
                <Flex flex="1" width="100%">
                    <FuelSurchargeAgreementExplanation activeField={activeField} />
                </Flex>
            </Flex>
            {isFuelPriceIndexFormModalOpen && (
                <FuelPriceIndexFormModal
                    onClose={() => setIsFuelPriceIndexFormModalOpen(false)}
                    onSubmit={onCreateFuelPrice}
                />
            )}
        </Modal>
    );

    function sendEventOnFuelPriceIndexCreation(fuelPriceIndexId: FuelPriceIndex["uid"]) {
        analyticsService.sendEvent(AnalyticsEvent.fuelSurchargeIndexCreation, {
            "company id": connectedCompany?.pk,
            "fuel surcharge index id": fuelPriceIndexId,
        });
    }

    async function onCreateFuelPrice(fuelPriceIndex: FuelPriceIndex) {
        try {
            const addFuelPriceIndexRequest = dispatch(
                fetchAddFuelPriceIndex(omitBy(fuelPriceIndex, isNil))
            );
            const {fuel_price_index} = await addFuelPriceIndexRequest;
            sendEventOnFuelPriceIndexCreation(fuel_price_index.uid);
            formik.setFieldValue("fuel_price_index", fuel_price_index);
            setIsFuelPriceIndexFormModalOpen(false);
        } catch (e) {
            Logger.error(e);
        }
    }

    function onConfirm(fuelSurchargeAgreement: FuelSurchargeAgreement) {
        onSubmit(fuelSurchargeAgreement);
    }
};
