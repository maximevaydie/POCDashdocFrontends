import {NewFeatureHelpBanner} from "@dashdoc/web-common";
import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {
    Badge,
    Flex,
    FullHeightMinWidthScreen,
    ScrollableTableFixedHeader,
    Table,
    TabTitle,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {getTabTranslations} from "app/common/tabs";
import {TariffGridActions} from "app/features/pricing/tariff-grids/TariffGridActions";
import {TariffGridCreateAction} from "app/features/pricing/tariff-grids/TariffGridCreateAction";
import {displayZone} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";
import {
    TariffGrid,
    TariffGridOwnerType,
    TariffGridVersion,
} from "app/features/pricing/tariff-grids/types";
import {TariffGridsScreenProps} from "app/screens/invoicing/TariffGridsScreen";
import {SidebarTabNames} from "app/types/constants";

type TariffGridsColumnName =
    | "name"
    | "load"
    | "origins"
    | "destinations"
    | "clients"
    | "status"
    | "actions";

type TariffGridsSortableColumnName = "name";

type TariffGridsColumn = {name: TariffGridsColumnName; width: string; getLabel: () => string};

const TOOLTIP_DELAY = 300;

export const TariffGridsScreenLegacy: FunctionComponent<TariffGridsScreenProps> = ({history}) => {
    const [selectedTariffGrids, setSelectedTariffGrids] = useState<Record<string, boolean>>({});
    const [allTariffGridsSelected, selectAllTariffGrids, unselectAllTariffGrids] = useToggle();
    const {
        items: tariffGrids = [],
        hasNext: hasNextTariffGrids,
        isLoading: isLoadingTariffGrids,
        loadNext: onTariffGridsEndReached,
        reload: refresh,
    } = usePaginatedFetch<TariffGrid>("tariff-grids/", {}, {apiVersion: "web"});

    const tariffGridsColumns: TariffGridsColumn[] = [
        {width: "10em", name: "name", getLabel: () => t("tariffGrids.Name")},
        {width: "10em", name: "load", getLabel: () => t("tariffGrids.Load")},
        {width: "10em", name: "origins", getLabel: () => t("tariffGrids.Origins")},
        {width: "10em", name: "destinations", getLabel: () => t("tariffGrids.Destinations")},
        {
            width: "10em",
            name: "clients",
            getLabel: () => t("common.shippers"),
        },
        {width: "10em", name: "status", getLabel: () => t("tariffGrids.Status")},
        {width: "10em", name: "actions", getLabel: () => ""},
    ];

    const selectAllVisibleTariffGrids = (selected: boolean) => {
        unselectAllTariffGrids();
        const selectedTariffGrids = tariffGrids.reduce((acc: Record<string, boolean>, {uid}) => {
            acc[uid] = selected;
            return acc;
        }, {});
        setSelectedTariffGrids(selectedTariffGrids);
    };

    const sortableColumns: {[column in TariffGridsSortableColumnName]?: boolean} = {};

    const getZonesString = (tariffGridVersion: TariffGridVersion): string => {
        if (tariffGridVersion.line_headers.lines_type === "zones") {
            return tariffGridVersion.line_headers.zones.map(displayZone).join(", ");
        }
        return " – ";
    };

    const getRowCellContent = (tariffGrid: TariffGrid, columnName: TariffGridsColumnName) => {
        switch (columnName) {
            case "name":
                return (
                    <Flex>
                        <TooltipWrapper content={tariffGrid.name} delayShow={TOOLTIP_DELAY}>
                            <Text data-testid="tariff-grids-name" ellipsis>
                                {tariffGrid.name}
                            </Text>
                        </TooltipWrapper>
                    </Flex>
                );
            case "load":
                return (
                    <Flex>
                        <Text>{getLoadCategoryLabel(tariffGrid.load_category)}</Text>
                    </Flex>
                );
            case "clients": {
                const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;
                const content = tariffGrid.is_all_customers
                    ? t(
                          isPurchaseTariffGrid
                              ? "tariffGrids.appliedToAllCarriers"
                              : "tariffGrids.appliedToAllShippers"
                      )
                    : tariffGrid.customers.map((client) => client.name).join(", ");

                return (
                    <Flex>
                        <TooltipWrapper content={content} delayShow={TOOLTIP_DELAY}>
                            <Text textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
                                {content}
                            </Text>
                        </TooltipWrapper>
                    </Flex>
                );
            }
            case "origins":
                if (tariffGrid.is_origin_or_destination === "origin") {
                    const content =
                        tariffGrid.origin_or_destination === null
                            ? ""
                            : displayZone(tariffGrid.origin_or_destination);
                    return (
                        <Flex>
                            <TooltipWrapper content={content} delayShow={TOOLTIP_DELAY}>
                                <Text ellipsis>{content}</Text>
                            </TooltipWrapper>
                        </Flex>
                    );
                } else {
                    const content = getZonesString(tariffGrid.current_version);
                    return (
                        <Flex>
                            <TooltipWrapper content={content} delayShow={TOOLTIP_DELAY}>
                                <Text
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                >
                                    {content}
                                </Text>
                            </TooltipWrapper>
                        </Flex>
                    );
                }

            case "destinations":
                if (tariffGrid.is_origin_or_destination === "destination") {
                    const content =
                        tariffGrid.origin_or_destination === null
                            ? ""
                            : displayZone(tariffGrid.origin_or_destination);
                    return (
                        <Flex>
                            <TooltipWrapper content={content} delayShow={TOOLTIP_DELAY}>
                                <Text
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                >
                                    {content}
                                </Text>
                            </TooltipWrapper>
                        </Flex>
                    );
                } else {
                    const content = getZonesString(tariffGrid.current_version);
                    return (
                        <Flex>
                            <TooltipWrapper content={content} delayShow={TOOLTIP_DELAY}>
                                <Text
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                >
                                    {content}
                                </Text>
                            </TooltipWrapper>
                        </Flex>
                    );
                }
            case "status":
                return (
                    <Flex>
                        {tariffGrid.status === "active" ? (
                            <Badge
                                display="inline-block"
                                mr={1}
                                mb={1}
                                variant="success"
                                shape="squared"
                            >
                                {t("common.enabled.female")}
                            </Badge>
                        ) : (
                            <Badge
                                display="inline-block"
                                mr={1}
                                mb={1}
                                variant="neutral"
                                shape="squared"
                            >
                                {t("common.disabled.female")}
                            </Badge>
                        )}
                    </Flex>
                );
            case "actions":
                return <TariffGridActions tariffGrid={tariffGrid} onRefresh={refresh} />;
        }
    };

    return (
        <FullHeightMinWidthScreen pt={3}>
            <NewFeatureHelpBanner
                preferenceSessionStorageKey="tariffGridHelpdesk"
                text={t("tariffGrid.helpdeskText")}
                learnMoreLink={t("tariffGrid.helpdeskLink")}
                expirationDate={new Date(2023, 2, 1)}
            />
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={"2"}>
                    <TabTitle title={getTabTranslations(SidebarTabNames.TARIFF_GRIDS)} />
                    <TariffGridCreateAction ownerType={TariffGridOwnerType.CARRIER} />
                </Flex>
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" px={3} pb={3} flexDirection="column" flexGrow={1}>
                <Table
                    onSelectRow={({uid}, selected) => {
                        unselectAllTariffGrids();
                        setSelectedTariffGrids({...selectedTariffGrids, [uid]: selected});
                    }}
                    onSelectAllVisibleRows={selectAllVisibleTariffGrids}
                    onSelectAllRows={selectAllTariffGrids}
                    allRowsSelected={allTariffGridsSelected}
                    selectedRows={selectedTariffGrids}
                    height="auto"
                    flexGrow={1}
                    columns={tariffGridsColumns}
                    sortableColumns={sortableColumns}
                    onClickOnRow={(tariffGrid) => {
                        history.push(`/app/tariff-grids/${tariffGrid.uid}`);
                    }}
                    rows={tariffGrids}
                    getRowId={(tariffGrid) => tariffGrid.uid}
                    getRowKey={(tariffGrid) => tariffGrid.uid}
                    getRowCellContent={getRowCellContent}
                    isLoading={isLoadingTariffGrids}
                    hasNextPage={hasNextTariffGrids}
                    getRowCellIsClickable={(_, columnName) => {
                        return columnName !== "actions";
                    }}
                    onEndReached={() => {
                        hasNextTariffGrids && onTariffGridsEndReached();
                    }}
                    data-testid="tariffGrid-table"
                />
            </Flex>
        </FullHeightMinWidthScreen>
    );
};
