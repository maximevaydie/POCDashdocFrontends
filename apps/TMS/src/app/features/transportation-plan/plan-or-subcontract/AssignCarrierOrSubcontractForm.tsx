import {guid} from "@dashdoc/core";
import {
    getConnectedCompany,
    HasFeatureFlag,
    HasNotFeatureFlag,
    useFeatureFlag,
    type CarrierInTransport,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Checkbox,
    Flex,
    Icon,
    Required,
    Text,
    TextInput,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    Company,
    Pricing,
    RequestedVehicle,
    type FuelSurchargeLine,
    type SimpleContact,
} from "dashdoc-utils";
import {Field, Form, FormikProvider, useFormik} from "formik";
import flatten from "lodash.flatten";
import uniqBy from "lodash.uniqby";
import React, {useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";

import {CompanyAndContactPicker} from "app/features/company/contact/contacts-picker/CompanyAndContactPicker";
import {
    getKeepExistingRequestedVehicleOption,
    RequestedVehicleSelect,
    RequestedVehicleValue,
} from "app/features/fleet/requested-vehicle/RequestedVehicleSelect";
import {PricingForm} from "app/features/pricing/pricing-form/PricingForm";
import {CarrierAndContactsPicker} from "app/features/transport/transport-form/address-and-contacts-picker/CarrierAndContactsPicker";
import {TransportAssignationHistory} from "app/features/transportation-plan/assignation-history/types";
import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {useMatchingTariffGridsWhenCharteringTransport} from "app/hooks/useMatchingTariffGrids";
import {
    DatesForFuelSurchargeAgreementTransportMatch,
    fetchMatchingFuelSurchargeAgreementFromNewTransport,
} from "app/services/invoicing/fuelSurchargeAgreementMatching.service";
import {
    computePricingBeforeSubmit,
    getInitialPricingForm,
    type PricingFormData,
} from "app/services/invoicing/pricing.service";
import {tariffGridMatchingService} from "app/services/invoicing/tariffGridMatching.service";

type FormValues = {
    carrier: Company | CarrierInTransport | null;
    contacts: SimpleContact[] | null;
    sendToCarrier: boolean;
    instructions?: string;
    requestedVehicle?: RequestedVehicleValue;
    quotation: PricingFormData;
    analytics?: {[key: string]: string | boolean};
};

export type SubcontractFormProps = {
    formId: string;
    disabled: boolean;
    initialSendToCarrierValue: boolean;
    initialPrice: Pricing | null;
    transportRequestedVehicle?: RequestedVehicle | null;
    isBulk: boolean;
    selectedHistoryTransport?: TransportAssignationHistory;
    datesForFuelSurchargeAgreementMatch?: DatesForFuelSurchargeAgreementTransportMatch;
    isSubcontractingTheWholeTransport?: boolean;
    transportUid: string | undefined;
    contextType: "subcontracting" | "assignation";
    onChangeSendToCarrier: (sendToCarrier: boolean) => void;
    onSubmit: (values: SubcontractSubmit) => Promise<void>;
};

const getRequestedVehicleUid = (
    requestedVehicle: RequestedVehicleValue | undefined
): string | null | undefined => {
    if (requestedVehicle === undefined) {
        return undefined;
    }
    if (requestedVehicle === null) {
        return null;
    }
    if (
        "isKeepExistingRequestedVehicleOption" in requestedVehicle &&
        requestedVehicle.isKeepExistingRequestedVehicleOption
    ) {
        return undefined;
    }
    if ("uid" in requestedVehicle) {
        return requestedVehicle.uid;
    }
    return undefined;
};

export function AssignCarrierOrSubcontractForm(props: SubcontractFormProps) {
    const {
        disabled,
        formId,
        initialSendToCarrierValue,
        initialPrice,
        selectedHistoryTransport,
        datesForFuelSurchargeAgreementMatch,
        isSubcontractingTheWholeTransport,
        transportUid,
        contextType,
        onChangeSendToCarrier,
        onSubmit,
        transportRequestedVehicle,
        isBulk,
    } = props;

    const connectedCompany = useSelector(getConnectedCompany);
    const hasFuelSurchargesAndTariffGridsManagement = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );
    const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");

    const [pricingFormKey, setPricingFormKey] = useState("_");
    const [pricingError, setPricingError] = useState<boolean>(false);

    const [initialQuotation, setInitialQuotation] = useState<PricingFormData>(getInitialQuotation);

    const initialRequestedVehicle = useMemo(() => {
        let initialRequestedVehicle: RequestedVehicleValue = null;
        if (
            transportRequestedVehicle &&
            transportRequestedVehicle.group_view_id === connectedCompany?.group_view_id
        ) {
            // If the parent transport has a requested vehicle and it's from the same group as the connected company,
            // we use it as the initial requested vehicle.
            initialRequestedVehicle = {...transportRequestedVehicle};
        } else if (transportRequestedVehicle || isBulk) {
            initialRequestedVehicle = getKeepExistingRequestedVehicleOption();
        }
        return initialRequestedVehicle;
    }, [connectedCompany, transportRequestedVehicle, isBulk]);

    const formik = useFormik<FormValues>({
        initialValues: {
            carrier: selectedHistoryTransport?.carrier ?? null,
            contacts: selectedHistoryTransport
                ? uniqBy(
                      flatten(
                          selectedHistoryTransport.deliveries.map(
                              (delivery) => delivery.tracking_contacts
                          )
                      ).map((tracking_contact) => tracking_contact.contact),
                      "contact.uid"
                  )
                : null,
            instructions: selectedHistoryTransport?.instructions ?? "",
            sendToCarrier: initialSendToCarrierValue,
            requestedVehicle: initialRequestedVehicle,
            quotation: initialQuotation,
        },
        onSubmit: handleSubmit,
        validate: validateValues,
        validateOnBlur: false,
        validateOnChange: false,
    });
    const {carrier, contacts, sendToCarrier, quotation} = formik.values;

    const companyIsSet = carrier !== null;
    const isCompanySelf = companyIsSet && carrier?.pk === connectedCompany?.pk;

    const matchingTariffGrids = useMatchingTariffGridsWhenCharteringTransport({
        transportUid: transportUid,
        carrierPk: carrier?.pk,
        requestedVehicleUid: getRequestedVehicleUid(formik.values.requestedVehicle),
        type: contextType,
    });
    const [hasDismissedTariffGrid, setHasDismissedTariffGrid] = useState<boolean>(false);

    const handlePricingFormChange = (pricing: PricingFormData, hasErrors: boolean) => {
        const hadTariffGridSelected = !!formik.values.quotation?.tariff_grid_line;
        const willHaveTariffGridSelected = !!pricing.tariff_grid_line;
        if (hadTariffGridSelected && !willHaveTariffGridSelected) {
            setHasDismissedTariffGrid(true);
        }
        formik.setFieldValue("quotation", pricing);
        setPricingError(hasErrors);
    };

    useEffect(() => {
        // If the current pricing has no selected tariff grid,
        // and the tariff grid hasn't been dismissed by the user,
        // and if we have exactly one matching tariff grid,
        // then automatically select it.
        if (
            !hasDismissedTariffGrid &&
            matchingTariffGrids.length === 1 &&
            !formik.values.quotation?.tariff_grid_line
        ) {
            handlePricingFormChange(
                {
                    ...formik.values.quotation,
                    tariff_grid_line: tariffGridMatchingService.gridApplicationInfoToGridLineForm(
                        matchingTariffGrids[0]
                    ),
                },
                false
            );
        }
    }, [carrier, hasDismissedTariffGrid, matchingTariffGrids]);

    const canSelectTariffGrids =
        hasFuelSurchargesAndTariffGridsManagement &&
        hasPurchaseTariffGridsEnabled &&
        isSubcontractingTheWholeTransport; // Due to technical limitations, we can only select tariff grids when subcontracting the whole transport
    useEffect(() => {
        rematchFuelSurchargeAgreement();
    }, [carrier]);

    return (
        <FormikProvider value={formik}>
            <Form id={formId}>
                <Box>
                    <Callout p={4} pb={6} iconDisabled flexGrow={1}>
                        <Text variant="h1" mb={2}>
                            {t("common.carrier")} <Required />
                        </Text>
                        <HasFeatureFlag flagName="betterCompanyRoles">
                            <CarrierAndContactsPicker
                                direction="row"
                                isClearable
                                isRequired
                                contactIsRequired
                                carrier={formik.values.carrier as CarrierInTransport | null}
                                contacts={formik.values.contacts ?? []}
                                contactsError={formik.errors.contacts}
                                carrierError={formik.errors.carrier}
                                onCarrierChange={(value) => {
                                    formik.setFieldValue("carrier", value);
                                    formik.setFieldValue("contacts", []);
                                }}
                                onContactsChange={(contacts) => {
                                    formik.setFieldValue("contacts", contacts);
                                }}
                                onTouchedContacts={() => formik.setFieldTouched("contacts")}
                            />

                            {/** If the selected company is a carrier and not the current
                             * company, show "send to carrier" checkbox.  */}
                            {!!formik.values.carrier &&
                                !!formik.values.contacts?.length &&
                                !isCompanySelf && (
                                    <Box pt={3}>
                                        <Checkbox
                                            checked={sendToCarrier}
                                            label={t("components.sendToCarrier")}
                                            data-testid="charter-modal-send-to-carrier-checkbox"
                                            onChange={(sendToCarrierChecked) => {
                                                formik.setFieldValue(
                                                    "sendToCarrier",
                                                    sendToCarrierChecked
                                                );
                                                onChangeSendToCarrier(sendToCarrierChecked);
                                            }}
                                        />
                                    </Box>
                                )}
                        </HasFeatureFlag>
                        <HasNotFeatureFlag flagName="betterCompanyRoles">
                            <CompanyAndContactPicker
                                initialSelection={{
                                    company: carrier as Company | null,
                                    contacts: contacts || [],
                                    key: "_" /* We don't use the key in this use case */,
                                }}
                                onUpdate={(newReceiver, sendToCarrier) => {
                                    formik.setFieldValue("carrier", newReceiver.company);
                                    formik.setFieldValue("contacts", newReceiver.contacts);
                                    formik.setFieldValue("sendToCarrier", sendToCarrier);
                                    onChangeSendToCarrier(sendToCarrier);
                                }}
                                contactError={formik.errors.contacts}
                                companyError={formik.errors.carrier}
                                initialSendToCarrier={sendToCarrier}
                                multipleContacts
                                contactRequired
                                displayTooltip
                            />
                        </HasNotFeatureFlag>
                    </Callout>

                    <Box pt={5}>
                        <Text variant="h1">{t("common.instructions")}</Text>
                    </Box>
                    <Box pt={2}>
                        <Flex alignItems="center">
                            <Text variant="h2">{t("common.instructions")}</Text>
                            <TooltipWrapper content={t("chartering.instructionsTooltip")}>
                                <Icon name="info" ml={2} />
                            </TooltipWrapper>
                        </Flex>
                        <Box pt={2}>
                            <Field
                                component={TextInput}
                                {...formik.getFieldProps("instructions")}
                                onChange={(value: number) => {
                                    formik.setFieldValue("instructions", value);
                                }}
                                label={t("transportForm.globalInstructionsTitle")}
                                error={formik.errors.instructions}
                                disabled={disabled}
                            />
                        </Box>
                    </Box>
                    <Box pt={2}>
                        <Flex alignItems="flex-end">
                            <Text variant="h2">{t("components.requestedVehicle")}</Text>
                        </Flex>
                        <Box pt={2}>
                            <Field
                                component={RequestedVehicleSelect}
                                {...formik.getFieldProps("requestedVehicle")}
                                data-testid="requested-vehicle-select"
                                onChange={(requestedVehicle: RequestedVehicleValue) => {
                                    formik.setFieldValue("requestedVehicle", requestedVehicle);
                                }}
                                error={formik.errors.requestedVehicle}
                                isDisabled={disabled}
                                allowReusingExistingRequestedVehicle={
                                    !!initialRequestedVehicle &&
                                    "group_view_id" in initialRequestedVehicle &&
                                    initialRequestedVehicle.group_view_id !==
                                        connectedCompany?.group_view_id
                                }
                                requestedVehicle={formik.values.requestedVehicle}
                                // Set menuPortalTarget to document.body to prevent the pricing form
                                // from overlapping the dropdown menu of the requested vehicle select
                                menuPortalTarget={document.body}
                            />
                        </Box>
                    </Box>
                </Box>

                <Text pt={5} variant="h1">
                    {t("common.cost")}
                </Text>
                <Box pt={3}>
                    <PricingForm
                        key={pricingFormKey}
                        initialPlannedQuantities={initialPrice?.planned_quantities}
                        initialRealQuantities={initialPrice?.real_quantities}
                        hideHeaderInformation
                        submitOnChange
                        isCarrierOfTransport={false}
                        isOwnerOfCurrentFuelSurchargeAgreement={true}
                        isForChartering={true}
                        initialPricing={quotation}
                        onSubmit={handlePricingFormChange}
                        hideErrors={formik.submitCount === 0}
                        matchingTariffGridInfos={matchingTariffGrids}
                        matchingFuelSurchargeAgreement={null}
                        displayTariffGrids={canSelectTariffGrids}
                    />
                </Box>
            </Form>
        </FormikProvider>
    );

    function getInitialQuotation() {
        const initialQuotation = getInitialPricingForm(
            selectedHistoryTransport?.quotation ?? initialPrice,
            connectedCompany,
            {
                copyTariffGridLine: false,
                requireLinesForFuelSurchargeAgreement: false,
            }
        );

        if (!selectedHistoryTransport) {
            // Initialize price with same lines as the provided price (usually the parent transport's price),
            // since chartering generally have the same pricing lines as their parent transport,
            // but a different unit price.
            initialQuotation.fuel_surcharge_line = null;
            initialQuotation.gas_index_invoice_item = null;
            initialQuotation.gas_index = "0";
            for (let line of initialQuotation.lines) {
                line.invoice_item = null;
                line.unit_price = "";
            }
        }

        return initialQuotation;
    }

    async function rematchFuelSurchargeAgreement() {
        const matchResult =
            hasFuelSurchargesAndTariffGridsManagement &&
            datesForFuelSurchargeAgreementMatch &&
            carrier &&
            connectedCompany
                ? await fetchMatchingFuelSurchargeAgreementFromNewTransport(
                      undefined,
                      carrier.pk,
                      connectedCompany.pk,
                      datesForFuelSurchargeAgreementMatch
                  )
                : undefined;

        const currentQuotation = quotation ?? getInitialQuotation();
        let fuel_surcharge_line: FuelSurchargeLine | null = null;
        if (matchResult?.fuel_surcharge_agreement && matchResult?.fuel_surcharge_item) {
            fuel_surcharge_line = {
                name: matchResult.fuel_surcharge_agreement.name,
                created_by: matchResult.fuel_surcharge_agreement.created_by,
                quantity: "" + matchResult.fuel_surcharge_item.computed_rate,
                invoice_item: matchResult.fuel_surcharge_agreement.invoice_item,
            };
        }
        const modifiedQuotation: PricingFormData = {
            ...currentQuotation,
            fuel_surcharge_line,
            dismissed_automatic_fuel_surcharge_application: false,
        };

        setInitialQuotation(modifiedQuotation);
        setPricingFormKey(guid());
    }

    async function handleSubmit(values: FormValues) {
        const {
            carrier,
            contacts,
            instructions,
            quotation,
            sendToCarrier,
            analytics,
            requestedVehicle,
        } = values;
        if (!carrier || !contacts?.length) {
            Logger.error("Missing carrier address or contact");
            return;
        }

        const quotationToSubmit = quotation
            ? computePricingBeforeSubmit(quotation, false, true)
            : undefined;

        let requestedVehicleUid = undefined;
        if (requestedVehicle === null) {
            requestedVehicleUid = null;
        } else if (requestedVehicle && "uid" in requestedVehicle) {
            requestedVehicleUid = requestedVehicle.uid;
        }

        const value: SubcontractSubmit = {
            carrier: {pk: carrier.pk},
            carrier_contacts: contacts?.map((contact) => contact.uid),
            send_to_carrier: sendToCarrier,
            instructions: instructions ?? "",
            quotation: quotationToSubmit,
            analytics,
            requested_vehicle_uid: requestedVehicleUid,
        };

        await onSubmit(value);
    }

    function validateValues(values: FormValues) {
        let errors: {[field in keyof FormValues]?: string} = {};

        if (!values.carrier) {
            errors.carrier = t("errors.field_cannot_be_empty");
        }
        if (!values.contacts?.length) {
            errors.contacts = t("errors.field_cannot_be_empty");
        }
        if (pricingError) {
            errors.quotation = t("common.mandatoryField");
        }
        return errors;
    }
}
