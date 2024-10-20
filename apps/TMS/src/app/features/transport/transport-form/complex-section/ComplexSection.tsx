import {SuggestedAddress} from "@dashdoc/web-common";
import {Flex, theme} from "@dashdoc/web-ui";
import React from "react";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {TariffGridApplicationInfo} from "app/features/pricing/tariff-grids/types";

import {AutoFilledMeansFields} from "../transport-form.types";

import {DeliveriesSection} from "./DeliveriesSection";
import {MeansSection} from "./MeansSection";
import {PriceSection} from "./PriceSection";
import {SupportExchangesSection} from "./SupportExchangesSection";

interface ComplexSectionProps {
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
    isCarrier: boolean;
    isCarrierGroupOfTransport: boolean;
    isOwnerOfCurrentFuelSurchargeAgreement: boolean;
    canEditCustomerToInvoice: boolean;
    matchingTariffGrids: TariffGridApplicationInfo[];
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    invoiceItemSuggestionArguments?: InvoiceItemSuggestionArguments;
    originAddressesSuggestedByShipper: SuggestedAddress[];
}

export function ComplexSection({
    automaticMeansEnabled,
    setAutomaticMeansEnabled,
    autoFilledMeansFields,
    setAutoFilledMeansFields,
    setPredictiveMeansField,
    setLastAssociatedMeansRequestStatus,
    confirmationExtractedCodes,
    isCarrier,
    isCarrierGroupOfTransport,
    isOwnerOfCurrentFuelSurchargeAgreement,
    canEditCustomerToInvoice,
    matchingTariffGrids,
    matchingFuelSurchargeAgreement,
    invoiceItemSuggestionArguments,
    originAddressesSuggestedByShipper,
}: ComplexSectionProps) {
    return (
        <Flex flexDirection="column" style={{gap: theme.space[4]}}>
            <Flex flex={1} style={{gap: theme.space[3]}}>
                <MeansSection
                    automaticMeansEnabled={automaticMeansEnabled}
                    setAutomaticMeansEnabled={setAutomaticMeansEnabled}
                    autoFilledMeansFields={autoFilledMeansFields}
                    setAutoFilledMeansFields={setAutoFilledMeansFields}
                    setPredictiveMeansField={setPredictiveMeansField}
                    setLastAssociatedMeansRequestStatus={setLastAssociatedMeansRequestStatus}
                    confirmationExtractedCodes={confirmationExtractedCodes}
                    // TODO: This is temporary, we need to rework the means section to be able to handle breaks
                    tripIndex={0}
                />
                <PriceSection
                    isCarrier={isCarrier}
                    isCarrierGroupOfTransport={isCarrierGroupOfTransport}
                    isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                    canEditCustomerToInvoice={canEditCustomerToInvoice}
                    matchingTariffGrids={matchingTariffGrids}
                    matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                    invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                />
            </Flex>
            <DeliveriesSection
                originAddressesSuggestedByShipper={originAddressesSuggestedByShipper}
            />
            <SupportExchangesSection />
        </Flex>
    );
}
