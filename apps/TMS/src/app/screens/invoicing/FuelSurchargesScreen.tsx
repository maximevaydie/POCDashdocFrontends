import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Flex,
    FloatingPanel,
    FullHeightMinWidthScreen,
    ScrollableTableFixedHeader,
    Table,
    TabTitle,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    FuelSurchargeAgreement as BaseFuelSurchargeAgreement,
    formatDate,
    formatNumber,
    FuelSurchargeAgreementOwnerType,
    FuelSurchargeItem,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback} from "react";
import {RouteComponentProps} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {FuelPriceIndexesUpdate} from "app/features/pricing/fuel-surcharges/actions/FuelPriceIndexesUpdate";
import {FuelSurchargeAgreementActions} from "app/features/pricing/fuel-surcharges/actions/FuelSurchargeAgreementActions";
import {FuelSurchargeAgreementCreateActionDropdown} from "app/features/pricing/fuel-surcharges/actions/FuelSurchargeAgreementCreateActionDropdown";
import {FuelPriceIndexesPanel} from "app/features/pricing/fuel-surcharges/FuelPriceIndexesPanel";
import {FuelSurchargeAgreementClientTooltip} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementClientTooltip";
import {SidebarTabNames} from "app/types/constants";

type FuelSurchargeAgreementProps = RouteComponentProps;

type FuelSurchargeAgreementColumnName =
    | "name"
    | "owner_type"
    | "index"
    | "reference_date"
    | "reference_price"
    | "last_update_date"
    | "last_update_price"
    | "computed_rate"
    | "clients"
    | "actions";

type FuelSurchargeAgreementColumn = {
    name: FuelSurchargeAgreementColumnName;
    width: string;
    getLabel: () => string;
};

export type FuelSurchargeAgreement = BaseFuelSurchargeAgreement & {
    last_fuel_surcharge_item: FuelSurchargeItem;
};

export const FuelSurchargesScreen: React.FC<FuelSurchargeAgreementProps> = ({history}) => {
    const [isFuelPriceIndexesPanel, openFuelPriceIndexesPanel, closeFuelPriceIndexesPanel] =
        useToggle();
    const {
        items: fuelSurchargeAgreements = [],
        hasNext: hasNextPage,
        loadNext: loadNextPage,
        isLoading,
        reload,
    } = usePaginatedFetch<FuelSurchargeAgreement>("fuel-surcharge-agreements/", {});

    const onNextPage = useCallback(() => {
        if (hasNextPage) {
            loadNextPage();
        }
    }, [hasNextPage, loadNextPage]);

    const fuelPriceIndexColumns: FuelSurchargeAgreementColumn[] = [
        {width: "10em", name: "name", getLabel: () => t("common.name")},
        {width: "10em", name: "owner_type", getLabel: () => t("fuelSurcharges.ownerType")},
        {width: "10em", name: "index", getLabel: () => t("fuelSurcharges.index")},
        {width: "10em", name: "reference_date", getLabel: () => t("fuelSurcharges.referenceDate")},
        {
            width: "10em",
            name: "reference_price",
            getLabel: () => t("fuelSurcharges.referencePrice"),
        },
        {
            width: "10em",
            name: "last_update_date",
            getLabel: () => t("fuelSurcharges.lastUpdateDate"),
        },
        {
            width: "10em",
            name: "last_update_price",
            getLabel: () => t("fuelSurcharges.lastUpdatePrice"),
        },
        {
            width: "10em",
            name: "computed_rate",
            getLabel: () => t("fuelSurcharges.lastComputedRate"),
        },
        {
            width: "15em",
            name: "clients",
            getLabel: () => t("fuelSurcharges.shippersOrCarriers"),
        },
        {width: "5em", getLabel: () => "", name: "actions"},
    ];

    const getRowCellContent = (
        fuelSurchargeAgreement: FuelSurchargeAgreement,
        columnName: FuelSurchargeAgreementColumnName
    ) => {
        switch (columnName) {
            case "name":
                return <Text>{fuelSurchargeAgreement[columnName]}</Text>;
            case "owner_type":
                return fuelSurchargeAgreement.owner_type ===
                    FuelSurchargeAgreementOwnerType.SHIPPER ? (
                    <Badge variant="pink" shape="squared">
                        {t("fuelSurcharges.ownerTypeShipper")}
                    </Badge>
                ) : (
                    <Badge variant="turquoise" shape="squared">
                        {t("fuelSurcharges.ownerTypeCarrier")}
                    </Badge>
                );
            case "index":
                return <Text>{fuelSurchargeAgreement.fuel_price_index.name}</Text>;
            case "reference_date":
                return <Text>{formatDate(fuelSurchargeAgreement[columnName], "dd/MM/yyyy")}</Text>;
            case "reference_price":
                return (
                    <Text>
                        {formatNumber(fuelSurchargeAgreement[columnName], {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 4,
                        })}
                    </Text>
                );
            case "last_update_date":
                return (
                    <Text>
                        {formatDate(
                            fuelSurchargeAgreement.fuel_price_index.last_update_date,
                            "dd/MM/yyyy"
                        )}
                    </Text>
                );
            case "last_update_price":
                return (
                    <Text>
                        {formatNumber(fuelSurchargeAgreement.fuel_price_index.last_update_price, {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 4,
                        })}
                    </Text>
                );
            case "computed_rate": {
                const computedRated =
                    fuelSurchargeAgreement.last_fuel_surcharge_item?.computed_rate;
                return computedRated ? (
                    <Text>
                        {formatNumber(+computedRated / 100, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                    </Text>
                ) : null;
            }
            case "clients": {
                const totalClients = fuelSurchargeAgreement.clients.length;
                return (
                    <Flex alignItems="center" style={{columnGap: "8px"}}>
                        <Text>
                            {fuelSurchargeAgreement.clients
                                .slice(0, 2)
                                .map((client) => client.name)
                                .join(", ")}
                        </Text>
                        {totalClients > 2 && (
                            <Flex
                                px={1}
                                flexShrink={0}
                                backgroundColor="grey.light"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <TooltipWrapper
                                    content={
                                        <FuelSurchargeAgreementClientTooltip
                                            clients={fuelSurchargeAgreement.clients}
                                        />
                                    }
                                >
                                    <Text>+{totalClients - 2}</Text>
                                </TooltipWrapper>
                            </Flex>
                        )}
                    </Flex>
                );
            }
            case "actions":
                return (
                    <FuelSurchargeAgreementActions
                        onSuccess={reload}
                        fuelSurchargeAgreement={fuelSurchargeAgreement}
                    />
                );
        }
    };

    return (
        <FullHeightMinWidthScreen pt={3}>
            <ScrollableTableFixedHeader>
                <Flex mb={"2"} style={{columnGap: "12px"}}>
                    <TabTitle title={getTabTranslations(SidebarTabNames.FUEL_SURCHARGES)} />
                    <FuelPriceIndexesUpdate
                        onUpdateSuccess={reload}
                        onOpenPanel={openFuelPriceIndexesPanel}
                    />
                    <FuelSurchargeAgreementCreateActionDropdown
                        onAfterCreation={({uid}) => {
                            history.push(`/app/fuel-surcharges/${uid}`);
                        }}
                    />
                </Flex>
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" px={3} pb={3} flexDirection="column" flexGrow={1}>
                <Table
                    height="auto"
                    flexGrow={1}
                    columns={fuelPriceIndexColumns}
                    rows={fuelSurchargeAgreements}
                    getRowCellContent={getRowCellContent}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onEndReached={onNextPage}
                    onClickOnRow={({uid}) => {
                        history.push(`/app/fuel-surcharges/${uid}`);
                    }}
                    getRowCellIsClickable={(_, columnName) => {
                        return columnName !== "actions";
                    }}
                />
            </Flex>
            {isFuelPriceIndexesPanel && (
                <FloatingPanel width={0.33} onClose={closeFuelPriceIndexesPanel}>
                    <FuelPriceIndexesPanel />
                </FloatingPanel>
            )}
        </FullHeightMinWidthScreen>
    );
};
