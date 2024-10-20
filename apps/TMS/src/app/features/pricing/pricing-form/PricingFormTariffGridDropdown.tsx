import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {
    ClickableFlex,
    ClickOutside,
    CountBadge,
    Dropdown,
    Flex,
    FlexProps,
    Icon,
    Text,
    theme,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import {TariffGridCreateAction} from "app/features/pricing/tariff-grids/TariffGridCreateAction";
import {
    TariffGridApplicationInfo,
    TariffGridOwnerType,
} from "app/features/pricing/tariff-grids/types";
import {getMetricLabel, TariffGridLineForm} from "app/services/invoicing";

import type {Load} from "app/types/transport";

type Props = {
    isCarrierOfTransport: boolean;
    currency: string;
    appliedTariffGrid: TariffGridLineForm | null;
    matchingTariffGrids: TariffGridApplicationInfo[];
    onAddTariffGrid: (tariffGridVersionUid: string) => void;
};

export function PricingFormTariffGridDropdown({
    isCarrierOfTransport,
    currency,
    appliedTariffGrid,
    matchingTariffGrids,
    onAddTariffGrid,
}: Props) {
    const [isOpen, open, close] = useToggle();
    const [isModalOpen, setModalOpen] = useState(false);

    const sortedMatchingTariffGrids = useMemo(
        () =>
            matchingTariffGrids.sort(
                (a, b) => getMatchingGridTotalPrice(b) - getMatchingGridTotalPrice(a)
            ),
        [matchingTariffGrids]
    );

    return (
        <ClickOutside
            reactRoot={document.getElementById("react-app-modal-root")}
            onClickOutside={() => {
                if (!isModalOpen) {
                    close();
                }
            }}
        >
            <Dropdown
                label={t("pricingForm.tariffGridAction")}
                isOpen={isOpen}
                onOpen={open}
                onClose={close}
                leftIcon={"tariffGrid"}
                rightContent={
                    sortedMatchingTariffGrids.length > 0 && (
                        <CountBadge
                            data-testid={"matching-tariff-grid-count"}
                            value={sortedMatchingTariffGrids.length}
                            ml={3}
                            mr={-2}
                        />
                    )
                }
                contentStyle={{
                    marginTop: 1,
                    backgroundColor: "white",
                    width: appliedTariffGrid
                        ? "250%"
                        : sortedMatchingTariffGrids.length > 0
                          ? "200%"
                          : "150%",
                    borderColor: theme.colors.neutral.lighterTransparentBlack,
                }}
                data-testid="add-tariff-grid-dropdown"
            >
                <Flex flexDirection={"column"}>
                    {sortedMatchingTariffGrids.length > 0 ? (
                        sortedMatchingTariffGrids.map((matchingGrid) => (
                            <MatchingTariffGridOption
                                key={matchingGrid.tariff_grid_version_uid}
                                matchingGrid={matchingGrid}
                                appliedTariffGrid={appliedTariffGrid}
                                currency={currency}
                                onAdd={(tariffGridVersionUid: string) => {
                                    onAddTariffGrid(tariffGridVersionUid);
                                    close();
                                }}
                            />
                        ))
                    ) : (
                        <Flex flexDirection={"column"} m={3} mb={1} alignItems="start">
                            <Text color={theme.colors.grey.dark}>
                                {t("tariffGrids.NoTariffGridDetected")}
                            </Text>
                        </Flex>
                    )}

                    <Flex ml={3} my={1}>
                        <TariffGridCreateAction
                            ownerType={
                                isCarrierOfTransport
                                    ? TariffGridOwnerType.CARRIER
                                    : TariffGridOwnerType.SHIPPER
                            }
                            variant="plain"
                            size="xsmall"
                            onModalOpen={() => setModalOpen(true)}
                            onModalClose={() => {
                                close();
                                setModalOpen(false);
                            }}
                        />
                    </Flex>
                </Flex>
            </Dropdown>
        </ClickOutside>
    );
}

function MatchingTariffGridOption({
    currency,
    appliedTariffGrid,
    matchingGrid,
    onAdd,
}: {
    currency: Props["currency"];
    appliedTariffGrid: Props["appliedTariffGrid"];
    matchingGrid: TariffGridApplicationInfo;
    onAdd: Props["onAddTariffGrid"];
}) {
    const isApplied =
        appliedTariffGrid?.tariff_grid_version_uid === matchingGrid.tariff_grid_version_uid;
    const formattedPrice = formatNumber(getMatchingGridTotalPrice(matchingGrid), {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    });

    const matchingGridDetails = useMemo(() => {
        let originOrDestinationDetail = "";
        if (matchingGrid.origin_or_destination.zone_type === "TARIFF_GRID_AREA_ID") {
            originOrDestinationDetail = matchingGrid.origin_or_destination.area.name;
        } else if (matchingGrid.origin_or_destination.zone_type === "ADDRESS") {
            originOrDestinationDetail = `${matchingGrid.origin_or_destination.address.address}, ${matchingGrid.origin_or_destination.address.postcode} ${matchingGrid.origin_or_destination.address.city}, ${matchingGrid.origin_or_destination.address.country}`;
        } else if (matchingGrid.origin_or_destination.zone_type === "PLACE") {
            originOrDestinationDetail = `${matchingGrid.origin_or_destination.place.city} – ${matchingGrid.origin_or_destination.place.postcode_prefix}, ${matchingGrid.origin_or_destination.place.country} `;
        }

        const loadCategoryLabel = getLoadCategoryLabel(
            matchingGrid.load_category as Load["category"]
        );
        const metricLabel = getMetricLabel(matchingGrid.pricing_metric);

        return `${originOrDestinationDetail ? originOrDestinationDetail + " — " : ""}${loadCategoryLabel} (${metricLabel})`;
    }, [matchingGrid]);

    return (
        <ClickeableOption
            onClick={() => onAdd(matchingGrid.tariff_grid_version_uid)}
            alignItems="start"
            borderBottom={`1px solid ${theme.colors.grey.light}`}
            data-testid={`proposed-grid-${matchingGrid.name}`}
        >
            <Flex flexDirection="column" flexGrow={1}>
                <Flex>
                    <Text>{matchingGrid.name}</Text>
                </Flex>

                <Text variant="caption" color="grey.dark">
                    {matchingGridDetails}
                </Text>
            </Flex>
            <Flex>
                {isApplied && (
                    <Text
                        borderRadius={1}
                        p={1}
                        mr={3}
                        backgroundColor="blue.ultralight"
                        color={"blue.dark"}
                    >
                        {t("tariffGrids.AppliedGrid")}
                    </Text>
                )}
                <Flex minWidth="fit-content">
                    <Text
                        fontWeight="bold"
                        data-testid={`proposed-grid-price-${matchingGrid.name}`}
                    >
                        {formattedPrice}
                    </Text>
                    <TooltipWrapper
                        content={
                            <>
                                <Text fontSize={"16px"} fontWeight={600} marginBottom={3}>
                                    {t("tariffGrids.TariffDetails")}
                                </Text>
                                <Flex borderBottom={"1px solid #DFE3E8"} pb={2}>
                                    <Text flexGrow={1} mr={4}>
                                        {getMetricLabel(matchingGrid.pricing_metric)}
                                    </Text>
                                    <Text>
                                        {matchingGrid.pricing_policy === "flat"
                                            ? displayFlatPrice(parseFloat(matchingGrid.unit_price))
                                            : displayQuantityTimesUnitPrice(
                                                  parseFloat(matchingGrid.quantity_in_metric),
                                                  parseFloat(matchingGrid.unit_price)
                                              )}
                                    </Text>
                                </Flex>
                                <Flex flexDirection={"row"} justifyContent={"right"} mt={3}>
                                    <Text fontSize={"14px"} fontWeight={600}>
                                        {formattedPrice}
                                    </Text>
                                </Flex>
                            </>
                        }
                    >
                        <Icon mx={2} name="info" />
                    </TooltipWrapper>
                </Flex>
            </Flex>
        </ClickeableOption>
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

function getMatchingGridTotalPrice(gridInfo: TariffGridApplicationInfo): number {
    return gridInfo.pricing_policy === "flat"
        ? parseFloat(gridInfo.unit_price)
        : parseFloat(gridInfo.unit_price) * parseFloat(gridInfo.quantity_in_metric);
}

const displayQuantityTimesUnitPrice = (quantity: number, unitPrice: number) =>
    `${formatNumber(quantity)} × ${formatNumber(unitPrice, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
    })}`;

const displayFlatPrice = (flatPrice: number) =>
    formatNumber(flatPrice, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
    });
