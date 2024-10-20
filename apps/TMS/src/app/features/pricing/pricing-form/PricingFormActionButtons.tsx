import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, Text, theme} from "@dashdoc/web-ui";
import {FuelSurchargeAgreementOwnerType, PricingMetricKey} from "dashdoc-utils";
import React from "react";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {PricingFormFuelSurchargeDropdown} from "app/features/pricing/pricing-form/PricingFormFuelSurchargeDropdown";
import {PricingFormTariffGridDropdown} from "app/features/pricing/pricing-form/PricingFormTariffGridDropdown";
import {TariffGridApplicationInfo} from "app/features/pricing/tariff-grids/types";
import {TariffGridLineForm} from "app/services/invoicing";

import AddPricingLineSelect from "../invoices/invoice-line-modal/add-pricing-line-select";

import {CopyPricingAction} from "./table/components/CopyPricingAction";

type Props = {
    showAddPricingLine: boolean;
    showFuelSurcharges: boolean;
    allowFuelSurchargeAgreement: boolean;
    showTariffGrids: boolean;
    showCopyToFinalPrice: boolean;
    isCarrierOfTransport: boolean;
    currency: string;
    hasAppliedManualFuelSurcharge: boolean;
    hasAppliedFuelSurchargeAgreement: boolean;
    appliedTariffGrid: TariffGridLineForm | null;
    matchingTariffGrids: TariffGridApplicationInfo[];
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    suggestCreateFuelSurchargeAgreementOwnerType: FuelSurchargeAgreementOwnerType | null;
    onAddPricingLine: (metric: PricingMetricKey) => void;
    onAddManualFuelSurcharge: () => void;
    onApplyMatchingFuelSurchargeAgreement: () => void;
    onAddTariffGrid: (tariffGridUid: string) => void;
    onCopyToFinalPrice?: () => void;
};

export function PricingFormActionButtons({
    showAddPricingLine,
    showFuelSurcharges,
    allowFuelSurchargeAgreement,
    showTariffGrids,
    showCopyToFinalPrice,
    isCarrierOfTransport,
    currency,
    hasAppliedFuelSurchargeAgreement,
    hasAppliedManualFuelSurcharge,
    appliedTariffGrid,
    matchingTariffGrids,
    matchingFuelSurchargeAgreement,
    suggestCreateFuelSurchargeAgreementOwnerType,
    onAddPricingLine,
    onAddManualFuelSurcharge,
    onApplyMatchingFuelSurchargeAgreement,
    onAddTariffGrid,
    onCopyToFinalPrice,
}: Props) {
    if (
        !showAddPricingLine &&
        !showFuelSurcharges &&
        !showTariffGrids &&
        (!showCopyToFinalPrice || !onCopyToFinalPrice)
    ) {
        return null;
    }

    return (
        <>
            <Flex
                backgroundColor={"blue.ultralight"}
                p={3}
                style={{gap: "12px"}}
                alignItems="center"
            >
                <Text color={theme.colors.blue.dark}>
                    {t("pricing.addAction")}
                    {" :"}
                </Text>

                {showAddPricingLine && (
                    <AddPricingLineSelect
                        key="add-pricing-line-action"
                        onAddPricingLine={onAddPricingLine}
                    />
                )}
                {showFuelSurcharges &&
                    (allowFuelSurchargeAgreement ? (
                        <PricingFormFuelSurchargeDropdown
                            hasAppliedFuelSurchargeAgreement={hasAppliedFuelSurchargeAgreement}
                            hasAppliedManualFuelSurcharge={hasAppliedManualFuelSurcharge}
                            matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                            suggestCreateFuelSurchargeAgreementOwnerType={
                                suggestCreateFuelSurchargeAgreementOwnerType
                            }
                            onAddManualFuelSurcharge={onAddManualFuelSurcharge}
                            onApplyMatchingFuelSurchargeAgreement={
                                onApplyMatchingFuelSurchargeAgreement
                            }
                        />
                    ) : (
                        <Button
                            data-testid="add-manual-fuel-surcharge-button"
                            key="add-fuel-surcharge-action"
                            variant="secondary"
                            type="button"
                            onClick={onAddManualFuelSurcharge}
                        >
                            <Icon name="gasIndex" mr={2} />
                            {t("pricingForm.fuelSurchargeAction")}
                        </Button>
                    ))}
                {showTariffGrids && (
                    <PricingFormTariffGridDropdown
                        isCarrierOfTransport={isCarrierOfTransport}
                        currency={currency}
                        appliedTariffGrid={appliedTariffGrid}
                        matchingTariffGrids={matchingTariffGrids}
                        onAddTariffGrid={onAddTariffGrid}
                    />
                )}
                {showCopyToFinalPrice && onCopyToFinalPrice && (
                    <CopyPricingAction
                        key="copy-price-action"
                        buttonText={t("pricesModal.copyAsFinalPrice")}
                        onCopyPrice={onCopyToFinalPrice}
                    />
                )}
            </Flex>
        </>
    );
}
