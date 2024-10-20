import {t, TranslationKeys} from "@dashdoc/web-core";
import {
    ClickableFlex,
    ClickOutside,
    CountBadge,
    Dropdown,
    Flex,
    FlexProps,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {
    formatDate,
    formatNumber,
    FuelSurchargeAgreementOwnerType,
    parseDate,
    useToggle,
} from "dashdoc-utils";
import React from "react";

import {FuelSurchargeAgreementCreateActionButton} from "app/features/pricing/fuel-surcharges/actions/FuelSurchargeAgreementCreateActionButton";
import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";

type Props = {
    hasAppliedManualFuelSurcharge: boolean;
    hasAppliedFuelSurchargeAgreement: boolean;
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    suggestCreateFuelSurchargeAgreementOwnerType: FuelSurchargeAgreementOwnerType | null;
    onAddManualFuelSurcharge: () => void;
    onApplyMatchingFuelSurchargeAgreement: () => void;
};

export function PricingFormFuelSurchargeDropdown({
    hasAppliedManualFuelSurcharge,
    hasAppliedFuelSurchargeAgreement,
    matchingFuelSurchargeAgreement,
    suggestCreateFuelSurchargeAgreementOwnerType,
    onAddManualFuelSurcharge,
    onApplyMatchingFuelSurchargeAgreement,
}: Props) {
    const [isOpen, open, close] = useToggle();

    return (
        <ClickOutside
            reactRoot={document.getElementById("react-app-modal-root")}
            onClickOutside={() => {
                if (!isOpen) {
                    close();
                }
            }}
        >
            <Dropdown
                label={t("pricingForm.fuelSurchargeAction")}
                isOpen={isOpen}
                onOpen={open}
                onClose={close}
                leftIcon={"gasIndex"}
                rightContent={
                    matchingFuelSurchargeAgreement && <CountBadge value={1} ml={3} mr={-2} />
                }
                contentStyle={{
                    marginTop: 1,
                    minWidth:
                        hasAppliedManualFuelSurcharge || hasAppliedFuelSurchargeAgreement
                            ? "175%"
                            : "150%",
                    borderColor: theme.colors.neutral.lighterTransparentBlack,
                }}
                data-testid="add-fuel-surcharge-dropdown"
            >
                <Flex flexDirection={"column"}>
                    <ManualFuelSurchargeSection
                        hasAppliedManualFuelSurcharge={hasAppliedManualFuelSurcharge}
                        onAdd={() => {
                            onAddManualFuelSurcharge();
                            close();
                        }}
                    />
                    <FuelSurchargeAgreementSection
                        hasAppliedFuelSurchargeAgreement={hasAppliedFuelSurchargeAgreement}
                        matchingAgreement={matchingFuelSurchargeAgreement}
                        suggestOwnerType={suggestCreateFuelSurchargeAgreementOwnerType}
                        onApply={() => {
                            onApplyMatchingFuelSurchargeAgreement();
                            close();
                        }}
                    />
                </Flex>
            </Dropdown>
        </ClickOutside>
    );
}

function ManualFuelSurchargeSection({
    hasAppliedManualFuelSurcharge,
    onAdd,
}: {
    hasAppliedManualFuelSurcharge: boolean;
    onAdd: () => void;
}) {
    return (
        <>
            <SectionHeader
                titleKey="pricingForm.fuelSurchargeActionHeaderManual"
                borderRadius={1}
            />

            <ClickeableOption
                onClick={onAdd}
                alignItems="center"
                textAlign="right"
                data-testid="add-manual-fuel-surcharge-button"
            >
                <Flex flexGrow={1}>
                    <Text>{t("pricingForm.manualFuelSurchargeAction")}</Text>
                </Flex>
                {hasAppliedManualFuelSurcharge && <AppliedSurchargeBadge />}
            </ClickeableOption>
        </>
    );
}

function FuelSurchargeAgreementSection({
    hasAppliedFuelSurchargeAgreement,
    matchingAgreement,
    suggestOwnerType,
    onApply,
}: {
    hasAppliedFuelSurchargeAgreement: boolean;
    matchingAgreement: Props["matchingFuelSurchargeAgreement"];
    suggestOwnerType: Props["suggestCreateFuelSurchargeAgreementOwnerType"];
    onApply: Props["onApplyMatchingFuelSurchargeAgreement"];
}) {
    return (
        <>
            <SectionHeader titleKey="pricingForm.fuelSurchargeActionHeaderAutomatic" />

            {matchingAgreement ? (
                <ClickeableOption
                    onClick={onApply}
                    alignItems="start"
                    data-testid="add-fuel-surcharge-agreement-button"
                >
                    <Flex flexDirection="column" flexGrow={1}>
                        <Text>{matchingAgreement.fuel_surcharge_agreement.name}</Text>
                        <Text variant="caption" color={theme.colors.grey.dark}>
                            {matchingAgreement.fuel_surcharge_agreement.fuel_price_index.name}
                        </Text>
                    </Flex>
                    {hasAppliedFuelSurchargeAgreement && (
                        <Flex mr={3}>
                            <AppliedSurchargeBadge />
                        </Flex>
                    )}

                    <Flex flexDirection="column" textAlign={"right"}>
                        <Text fontWeight="bold">
                            {formatNumber(
                                matchingAgreement.fuel_surcharge_item.computed_rate / 100,
                                {
                                    style: "percent",
                                    minimumFractionDigits: 2,
                                }
                            )}
                        </Text>
                        <Text variant={"caption"} color={theme.colors.grey.dark}>
                            {formatDate(
                                parseDate(matchingAgreement.fuel_surcharge_item.start_date),
                                "dd/MM/yyyy"
                            )}
                        </Text>
                    </Flex>
                </ClickeableOption>
            ) : (
                <Flex flexDirection={"column"} p={3} alignItems="start">
                    <Text color={theme.colors.grey.dark}>
                        {t("pricingForm.noMatchingFuelSurchargeAgreement")}
                    </Text>
                    {suggestOwnerType && (
                        <FuelSurchargeAgreementCreateActionButton ownerType={suggestOwnerType} />
                    )}
                </Flex>
            )}
        </>
    );
}

const AppliedSurchargeBadge = () => (
    <Text borderRadius={1} p={1} backgroundColor="blue.ultralight" color={"blue.dark"}>
        {t("pricingForm.appliedFuelSurcharge")}
    </Text>
);

function SectionHeader({
    titleKey,
    borderRadius,
}: {
    titleKey: TranslationKeys;
    borderRadius?: number;
}) {
    return (
        <Flex
            backgroundColor={theme.colors.grey.lighter}
            pl={2}
            py={1}
            borderRadius={borderRadius}
        >
            <Text variant={"caption"}>{t(titleKey)}</Text>
        </Flex>
    );
}

function ClickeableOption({
    onClick,
    children,
    ...flexProps
}: {onClick: () => void; children: React.ReactNode} & FlexProps) {
    return (
        <ClickableFlex
            p={3}
            hoverStyle={{backgroundColor: "grey.light"}}
            onClick={onClick}
            {...flexProps}
        >
            {children}
        </ClickableFlex>
    );
}
