import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import omit from "lodash.omit";
import React, {FC, useState} from "react";

import {EditDistanceStepPopover} from "app/features/pricing/tariff-grids/table/actions/components/DistanceRangePopover";
import {ExtendedZonePopover} from "app/features/pricing/tariff-grids/table/actions/components/ExtendedZonePopover";
import {RightArrow} from "app/features/pricing/tariff-grids/table/actions/components/RightArrow";
import {
    displayZone,
    getZoneIconProps,
} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";

import {TariffGridVersion, TariffGridZone, TariffGridZonesLineHeaders} from "../../types";
import {TdHeader} from "../body/TdHeader";

type EditLineHeaderActionProps = {
    dataTestId?: string;
    tariffGridVersion: TariffGridVersion;
    zoneIndex: number;
    onDelete: (zoneIndex: number) => unknown;
    onChangeZoneLine: (zone: TariffGridZone) => unknown;
    onChangeDistanceStep: (distanceStep: string, stepIndex: number) => unknown;
};

export const EditLineHeaderAction: FC<EditLineHeaderActionProps> = ({
    dataTestId,
    zoneIndex,
    tariffGridVersion,
    onDelete,
    onChangeZoneLine,
    onChangeDistanceStep,
}) => {
    const [isOpen, open, close] = useToggle();
    const label =
        tariffGridVersion.line_headers.lines_type === "zones"
            ? displayZone(tariffGridVersion.line_headers.zones[zoneIndex])
            : parseFloat(tariffGridVersion.line_headers.distances[zoneIndex]).toLocaleString() +
              " km";

    const iconProps =
        tariffGridVersion.line_headers.lines_type === "zones"
            ? getZoneIconProps(tariffGridVersion.line_headers.zones[zoneIndex])
            : null;

    // This is used to eventually re-render the popover
    const [zonePopoverKey, setZonePopoverKey] = useState(0);

    const handleClosePopover = () => {
        close();
        setZonePopoverKey((key) => key + 1);
    };

    return (
        <TdHeader
            scope="row"
            isClickable
            isSelected={isOpen}
            onClick={open}
            data-testid={
                dataTestId
                    ? `${dataTestId}-tariff-grid-line-header-${zoneIndex}`
                    : `tariff-grid-line-header-${zoneIndex}`
            }
        >
            {tariffGridVersion.line_headers.lines_type === "zones" ? (
                <ExtendedZonePopover
                    key={zonePopoverKey}
                    isOpen={isOpen}
                    onClose={handleClosePopover}
                    onSubmit={(zone) => {
                        const zoneWithoutId = omit(zone, ["id"]);
                        const selectedZoneWithoutId = omit(
                            (tariffGridVersion.line_headers as TariffGridZonesLineHeaders).zones[
                                zoneIndex
                            ],
                            ["id"]
                        );
                        if (isEqual(zoneWithoutId, selectedZoneWithoutId)) {
                            handleClosePopover();
                            return;
                        }

                        onChangeZoneLine(zone);
                        handleClosePopover();
                    }}
                    zone={tariffGridVersion.line_headers.zones[zoneIndex]}
                    onDelete={() => onDelete(zoneIndex)}
                    getErrorMessage={(newZone) => {
                        const tariffGridZones = (
                            tariffGridVersion.line_headers as TariffGridZonesLineHeaders
                        ).zones;
                        const currentZoneWithoutId = omit(tariffGridZones[zoneIndex], ["id"]);
                        const newZoneWithoutId = omit(newZone, ["id"]);

                        if (
                            !isEqual(currentZoneWithoutId, newZoneWithoutId) &&
                            tariffGridZones.some((zone) => {
                                const zoneWithoutId = omit(zone, ["id"]);
                                return isEqual(newZoneWithoutId, zoneWithoutId);
                            })
                        ) {
                            return t("tariffGrids.zoneAlreadySelected");
                        }

                        return;
                    }}
                >
                    <Flex alignItems="center">
                        {iconProps && (
                            <Flex
                                width={24}
                                height={24}
                                mr={2}
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="100%"
                                border="1px solid"
                                backgroundColor={iconProps.backgroundColor}
                                borderColor={iconProps.borderColor}
                            >
                                <Icon
                                    scale={0.8}
                                    name={iconProps.name}
                                    color={iconProps.color}
                                    backgroundColor={iconProps.backgroundColor}
                                />
                            </Flex>
                        )}
                        <Text>{label}</Text>
                    </Flex>
                </ExtendedZonePopover>
            ) : (
                <EditDistanceStepPopover
                    distanceSteps={tariffGridVersion.line_headers.distances}
                    isOpen={isOpen}
                    onClose={close}
                    stepIndex={zoneIndex}
                    onChange={onChangeDistanceStep}
                    onDelete={onDelete}
                >
                    <Flex flexDirection={"row"}>
                        <RightArrow />
                        <Text>{label}</Text>
                    </Flex>
                </EditDistanceStepPopover>
            )}
        </TdHeader>
    );
};
