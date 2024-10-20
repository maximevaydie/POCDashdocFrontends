import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {Badge, Flex, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatDate, parseDate} from "dashdoc-utils";
import React from "react";
import Highlighter from "react-highlight-words";

import {TariffGridActions} from "app/features/pricing/tariff-grids/TariffGridActions";
import {displayZone} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";
import {TariffGrid, TariffGridOwnerType} from "app/features/pricing/tariff-grids/types";

export type TariffGridsScreenColumnName =
    | "name"
    | "owner_type"
    | "load_category"
    | "origin"
    | "destination"
    | "clients"
    | "next_version"
    | "status"
    | "actions";

// Update getQueryParamsFromFiltersQuery along with this
export const TARIFF_GRID_SCREEN_SORTABLE_COLUMNS: TariffGridsScreenColumnName[] = [
    "name",
    "owner_type",
    "load_category",
    "origin",
    "destination",
    "clients",
    "next_version",
    "status",
];

export type TariffGridsScreenColumn = {
    name: TariffGridsScreenColumnName;
    width: string;
    getLabel: () => string;
    getCellContent: (
        tariffGrid: TariffGrid,
        searchWords: string[],
        refreshList: () => void
    ) => React.ReactNode;
};

export const TARIFF_GRID_SCREEN_COLUMNS: Record<
    TariffGridsScreenColumnName,
    TariffGridsScreenColumn
> = {
    name: {
        width: "10em",
        name: "name",
        getLabel: () => t("tariffGrids.Name"),
        getCellContent: (tariffGrid, searchWords) => (
            <FlexTooltipContent content={tariffGrid.name} searchWords={searchWords} />
        ),
    },
    owner_type: {
        width: "10em",
        name: "owner_type",
        getLabel: () => t("tariffGrids.ownerType"),
        getCellContent: (tariffGrid) => {
            const isShipper = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;
            return (
                <Badge variant={isShipper ? "pink" : "turquoise"} shape="squared">
                    {t(
                        isShipper ? "tariffGrids.ownerTypeShipper" : "tariffGrids.ownerTypeCarrier"
                    )}
                </Badge>
            );
        },
    },
    load_category: {
        width: "10em",
        name: "load_category",
        getLabel: () => t("tariffGrids.Load"),
        getCellContent: (tariffGrid) => (
            <Flex>
                <Text>{getLoadCategoryLabel(tariffGrid.load_category)}</Text>
            </Flex>
        ),
    },
    origin: {
        width: "10em",
        name: "origin",
        getLabel: () => t("tariffGrids.Origins"),
        getCellContent: (tariffGrid) => (
            <OriginOrDestinationCellContent
                tariffGrid={tariffGrid}
                useOriginOrDestination={tariffGrid.is_origin_or_destination === "origin"}
            />
        ),
    },
    destination: {
        width: "10em",
        name: "destination",
        getLabel: () => t("tariffGrids.Destinations"),
        getCellContent: (tariffGrid) => (
            <OriginOrDestinationCellContent
                tariffGrid={tariffGrid}
                useOriginOrDestination={tariffGrid.is_origin_or_destination === "destination"}
            />
        ),
    },
    clients: {
        width: "10em",
        name: "clients",
        getLabel: () => t("tariffGrids.shippersOrCarriers"),
        getCellContent: (tariffGrid, searchWords) => {
            const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;
            const content = tariffGrid.is_all_customers
                ? t(
                      isPurchaseTariffGrid
                          ? "tariffGrids.appliedToAllCarriers"
                          : "tariffGrids.appliedToAllShippers"
                  )
                : tariffGrid.customers.map((client) => client.name).join(", ");

            return <FlexTooltipContent content={content} searchWords={searchWords} />;
        },
    },
    status: {
        width: "10em",
        name: "status",
        getLabel: () => t("tariffGrids.Status"),
        getCellContent: (tariffGrid) => (
            <Badge
                display="inline-block"
                mr={1}
                mb={1}
                variant={tariffGrid.status === "active" ? "success" : "neutral"}
                shape="squared"
            >
                {t(
                    tariffGrid.status === "active"
                        ? "common.enabled.female"
                        : "common.disabled.female"
                )}
            </Badge>
        ),
    },
    next_version: {
        width: "10em",
        name: "next_version",
        getLabel: () => t("tariffGrids.nextVersion"),
        getCellContent: (tariffGrid) => {
            const nextVersionDate = tariffGrid.future_versions.reduce(
                (acc: Date | null, futureVersion) => {
                    const futureVersionDate = parseDate(futureVersion.start_date);
                    return acc === null || futureVersionDate === null || futureVersionDate < acc
                        ? futureVersionDate
                        : acc;
                },
                null
            );
            return nextVersionDate ? formatDate(nextVersionDate, "P") : "";
        },
    },
    actions: {
        width: "10em",
        name: "actions",
        getLabel: () => "",
        getCellContent: (tariffGrid, _, refreshList) => (
            <TariffGridActions tariffGrid={tariffGrid} onRefresh={refreshList} />
        ),
    },
};

// Synchronize with backend/dashdoc/tariffs/views/tariff_grid_filters.py
function OriginOrDestinationCellContent({
    tariffGrid,
    useOriginOrDestination,
}: {
    tariffGrid: TariffGrid;
    useOriginOrDestination: boolean;
}) {
    let content;
    if (useOriginOrDestination) {
        content = tariffGrid.origin_or_destination
            ? displayZone(tariffGrid.origin_or_destination)
            : "";
    } else {
        content =
            tariffGrid.current_version.line_headers.lines_type === "zones"
                ? tariffGrid.current_version.line_headers.zones.map(displayZone).join(", ")
                : " – ";
    }

    return <FlexTooltipContent content={content} />;
}

function FlexTooltipContent({content, searchWords}: {content: string; searchWords?: string[]}) {
    return (
        <Flex>
            <TooltipWrapper content={content} delayShow={400}>
                <Text ellipsis>
                    {searchWords ? (
                        <Highlighter
                            autoEscape={true}
                            searchWords={searchWords}
                            textToHighlight={content}
                        />
                    ) : (
                        content
                    )}
                </Text>
            </TooltipWrapper>
        </Flex>
    );
}
