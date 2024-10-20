import {Box} from "@dashdoc/web-ui";
import {themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {FC, useRef} from "react";

import {CreateDistanceStepAction} from "app/features/pricing/tariff-grids/table/actions/components/DistanceRangePopover";
import {displayZone} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";

import {
    TariffGrid,
    TariffGridVersion,
    TariffGridZonesLineHeaders,
    TariffGridDistancesLineHeaders,
} from "../../types";
import {CreateZoneAction} from "../actions/CreateZoneAction";
import {EditLineHeaderAction} from "../actions/EditZoneAction";
import {tableService} from "../table.service";

import {TableCell} from "./TableCell";
import {TdHeader} from "./TdHeader";

const DEFAULT_CURRENCY = "€";
const Tr = styled(Box.withComponent("tr"))<{}>(() => themeAwareCss({}));

export const TableBody: FC<{
    dataTestId?: string;
    tariffGrid: TariffGrid;
    tariffGridVersion: TariffGridVersion;
    selectedCell: [number, number] | null;
    metricUnit: string | undefined;
    onSelect: (cell: [number, number] | null) => unknown;
    onChange: (newTariffGridVersion: TariffGridVersion) => void;
}> = ({
    dataTestId,
    tariffGrid,
    tariffGridVersion,
    selectedCell,
    metricUnit,
    onSelect,
    onChange,
}) => {
    const createZoneRef = useRef<HTMLDivElement | null>(null);

    const units =
        metricUnit && tariffGrid.pricing_policy !== "flat"
            ? `${DEFAULT_CURRENCY}/${metricUnit}`
            : DEFAULT_CURRENCY;

    return (
        <>
            <tbody>
                {tariffGridVersion.table.length === 0 && (
                    <Tr>
                        <TdHeader scope="row"> </TdHeader>
                    </Tr>
                )}
                {tariffGridVersion.table.map((line, zoneIndex) => {
                    const key =
                        tariffGridVersion.line_headers.lines_type === "zones"
                            ? displayZone(tariffGridVersion.line_headers.zones[zoneIndex])
                            : tariffGridVersion.line_headers.distances[zoneIndex];
                    return (
                        <Tr key={key}>
                            <EditLineHeaderAction
                                dataTestId={dataTestId}
                                tariffGridVersion={tariffGridVersion}
                                zoneIndex={zoneIndex}
                                onDelete={(index) =>
                                    onChange(tableService.deleteLine(tariffGridVersion, index))
                                }
                                onChangeZoneLine={(zone) => {
                                    if (tariffGridVersion.line_headers.lines_type === "zones") {
                                        onChange(
                                            tableService.editZoneLine(
                                                tariffGridVersion as TariffGridVersion<TariffGridZonesLineHeaders>,
                                                zone,
                                                zoneIndex
                                            )
                                        );
                                    }
                                }}
                                onChangeDistanceStep={(value, index) => {
                                    if (
                                        tariffGridVersion.line_headers.lines_type ===
                                        "distance_range_in_km"
                                    ) {
                                        onChange(
                                            tableService.editDistanceLine(
                                                tariffGridVersion as TariffGridVersion<TariffGridDistancesLineHeaders>,
                                                value,
                                                index
                                            )
                                        );
                                    }
                                }}
                            />
                            {line.map((value, colIndex) => {
                                const step = tariffGridVersion.metric_steps[colIndex];
                                const isSelected =
                                    (selectedCell || false) &&
                                    selectedCell[0] === zoneIndex &&
                                    selectedCell[1] === colIndex;
                                return (
                                    <TableCell
                                        key={"cell-" + step.toString()}
                                        dataTestId={dataTestId}
                                        line={zoneIndex}
                                        column={colIndex}
                                        value={value}
                                        units={units}
                                        isSelected={isSelected}
                                        onChange={(value) => {
                                            onChange(
                                                tableService.editCell(
                                                    tariffGridVersion,
                                                    value,
                                                    zoneIndex,
                                                    colIndex
                                                )
                                            );
                                        }}
                                        onEnter={() => onSelect([zoneIndex + 1, colIndex])}
                                        onClose={() => onSelect(null)}
                                        onClick={() => onSelect([zoneIndex, colIndex])}
                                    />
                                );
                            })}
                            <td />
                        </Tr>
                    );
                })}
                <Tr>
                    <td colSpan={tariffGridVersion.table[0]?.length ?? 1 + 2}>
                        <Box pt={2} ref={createZoneRef}>
                            {tariffGrid.lines_type === "zones" ? (
                                <CreateZoneAction
                                    dataTestId={dataTestId}
                                    tariffGrid={
                                        tariffGrid as TariffGrid<TariffGridZonesLineHeaders>
                                    }
                                    tariffGridZones={
                                        (
                                            tariffGridVersion as TariffGridVersion<TariffGridZonesLineHeaders>
                                        ).line_headers.zones
                                    }
                                    onCreate={(zone) => {
                                        onChange(
                                            tableService.addZoneLine(
                                                tariffGridVersion as TariffGridVersion<TariffGridZonesLineHeaders>,
                                                zone
                                            )
                                        );

                                        createZoneRef.current?.scrollIntoView();
                                    }}
                                />
                            ) : (
                                <CreateDistanceStepAction
                                    distanceSteps={
                                        (
                                            tariffGridVersion as TariffGridVersion<TariffGridDistancesLineHeaders>
                                        ).line_headers.distances
                                    }
                                    onCreate={(value) => {
                                        onChange(
                                            tableService.addDistanceLine(
                                                tariffGridVersion as TariffGridVersion<TariffGridDistancesLineHeaders>,
                                                value
                                            )
                                        );
                                        createZoneRef.current?.scrollIntoView();
                                    }}
                                />
                            )}
                        </Box>
                    </td>
                </Tr>
            </tbody>
        </>
    );
};
