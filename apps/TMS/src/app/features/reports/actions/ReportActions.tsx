import {
    ReportFiltersData,
    REPORTS_TYPES_WITH_PRICES,
    ReportCalculationMode,
    ReportWidgetFull,
} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {Badge, Box, Dropdown, Flex, GroupedSelectMenuProps, Text} from "@dashdoc/web-ui";
import {ClickOutside, GroupedSelectMenu} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useMemo} from "react";

type ReportActionsProps = {
    widget: ReportWidgetFull;
    onChange: (newArgs: {
        calculation_mode?: ReportCalculationMode;
        parameters?: ReportFiltersData;
    }) => void;
};

export const ReportActions: FunctionComponent<ReportActionsProps> = ({widget, onChange}) => {
    const [isChartTypeMenuOpen, openChartTypeMenu, closeChartTypeMenu] = useToggle();

    const calculationMode = useMemo(() => {
        if (widget.type === "TRANSPORT_SUM_PRICING") {
            return "SUM";
        } else if (widget.type === "TRANSPORT_AVG_PRICING") {
            return "AVERAGE";
        }
        return null;
    }, [widget.type]);

    const includeFuelSurcharge = useMemo(() => {
        if (!REPORTS_TYPES_WITH_PRICES.includes(widget.type as any)) {
            return null;
        }

        // Always include FS unless explicitely disabled
        return widget.parameters?.include_fuel_surcharge !== false;
    }, [widget.type, widget.parameters?.include_fuel_surcharge]);

    const onSelectCalculationMethod = useCallback(
        (calculationMode: ReportCalculationMode) => {
            onChange({calculation_mode: calculationMode});
        },
        [onChange]
    );

    const onSelectIncludeFuelSurcharge = useCallback(
        (includeFuelSurcharge: boolean) => {
            onChange({parameters: {include_fuel_surcharge: includeFuelSurcharge}});
        },
        [onChange]
    );

    const groupedOptions = useMemo(() => {
        let options: GroupedSelectMenuProps["optionsByGroup"] = [];

        if (calculationMode !== null) {
            options.push({
                label: t("reports.calculationMode"),
                options: [
                    {
                        label: t("reports.calculationMode.sum"),
                        value: "SUM",
                        isInitiallyChecked: calculationMode === "SUM",
                    },
                    {
                        label: t("reports.calculationMode.avg"),
                        value: "AVERAGE",
                        isInitiallyChecked: calculationMode === "AVERAGE",
                    },
                ],
                onSelect: onSelectCalculationMethod,
            });
        }

        if (includeFuelSurcharge !== null) {
            options.push({
                label: t("components.gasIndex"),
                options: [
                    {
                        label: t("reports.fuelSurchargeIncluded"),
                        value: true,
                        isInitiallyChecked: includeFuelSurcharge,
                    },
                    {
                        label: t("reports.fuelSurchargeNotIncluded"),
                        value: false,
                        isInitiallyChecked: !includeFuelSurcharge,
                    },
                ],
                onSelect: onSelectIncludeFuelSurcharge,
            });
        }

        return options;
    }, [
        calculationMode,
        includeFuelSurcharge,
        onSelectCalculationMethod,
        onSelectIncludeFuelSurcharge,
    ]);

    if (groupedOptions.length === 0) {
        return null;
    }

    return (
        <Box>
            <ClickOutside onClickOutside={closeChartTypeMenu}>
                <Box position="relative">
                    <Dropdown
                        leftIcon="analyticsPie"
                        label={
                            <Flex alignItems={"center"}>
                                <Text mr={1}>{t("reports.calculationMode")}</Text>
                                {":"}
                                {calculationMode && (
                                    <Badge mx={2} variant="neutral">
                                        {calculationMode === "SUM"
                                            ? t("reports.calculationMode.sum")
                                            : t("reports.calculationMode.avg")}
                                    </Badge>
                                )}
                                {widget.parameters && (
                                    <Badge mx={2} variant="neutral">
                                        {includeFuelSurcharge === false
                                            ? t("reports.fuelSurchargeNotIncluded")
                                            : t("reports.fuelSurchargeIncluded")}
                                    </Badge>
                                )}
                            </Flex>
                        }
                        isOpen={isChartTypeMenuOpen}
                        onOpen={openChartTypeMenu}
                        onClose={closeChartTypeMenu}
                    >
                        <Box position="absolute" zIndex="level1" width="200px" right={0}>
                            <GroupedSelectMenu optionsByGroup={groupedOptions} />
                        </Box>
                    </Dropdown>
                </Box>
            </ClickOutside>
        </Box>
    );
};
