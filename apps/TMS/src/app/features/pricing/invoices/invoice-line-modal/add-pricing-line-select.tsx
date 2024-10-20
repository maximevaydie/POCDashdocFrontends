import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickOutside,
    Dropdown,
    Icon,
    Select,
    SelectOption,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {PricingMetricKey, useToggle} from "dashdoc-utils";
import React, {ComponentProps, ReactNode, useMemo} from "react";
import {components, GroupTypeBase} from "react-select";
import createPersistedState from "use-persisted-state";

import {getMetricLabel, variableMetrics} from "app/services/invoicing";

const RECENT_VARIABLE_METRIC_USED_STORAGE_KEY = "recentVariableMetricUsed";
const useRecentVariableMetricUsed = createPersistedState(RECENT_VARIABLE_METRIC_USED_STORAGE_KEY);

type AddPricingLineSelect = {
    onAddPricingLine: (metric: PricingMetricKey) => void;
};

type PricingMetricOption = {label: string; value: PricingMetricKey};

export default function AddPricingLineSelect({onAddPricingLine}: AddPricingLineSelect) {
    const [isOpen, open, close] = useToggle();

    const [recentVariableMetricUsed, setRecentVariableMetricUsed] =
        useRecentVariableMetricUsed<PricingMetricKey>();

    const groupedMetricsOptions = useMemo(() => {
        let groupedMetricsOptions: Array<GroupTypeBase<PricingMetricOption>> = [];

        // Add fixed metrics group
        const fixedMetricsGroupOptions = {
            label: t("pricingMetrics.fixed"),
            options: [{label: t("pricing.flatFee"), value: "FLAT" as PricingMetricKey}],
        };
        groupedMetricsOptions.push(fixedMetricsGroupOptions);

        // Add variable metrics group
        let variableMetricsOptions = variableMetrics
            .map((metric: PricingMetricKey) => {
                return {value: metric, label: getMetricLabel(metric)};
            })
            .sort((metricOptionA, metricOptionB) =>
                // @ts-ignore
                metricOptionA.label.localeCompare(metricOptionB.label)
            );

        if (recentVariableMetricUsed) {
            const indexOfRecentVariableMetricUsed = variableMetricsOptions.findIndex(
                (option) => option.value === recentVariableMetricUsed
            );
            const recentMetricOption = variableMetricsOptions.splice(
                indexOfRecentVariableMetricUsed,
                1
            )[0];
            variableMetricsOptions.unshift(recentMetricOption);
        }

        groupedMetricsOptions.push({
            label: t("pricingMetrics.variable"),
            // @ts-ignore
            options: variableMetricsOptions,
        });

        return groupedMetricsOptions;
    }, [recentVariableMetricUsed]);

    const ValueContainer = ({
        children,
        ...props
    }: ComponentProps<typeof components.ValueContainer> & {children: ReactNode}) => {
        return (
            components.ValueContainer && (
                <components.ValueContainer {...props}>
                    {!!children && <Icon name="search" position="absolute" left={3} />}
                    {children}
                </components.ValueContainer>
            )
        );
    };

    const formatGroupLabel = (data: GroupTypeBase<PricingMetricOption>) => (
        <Box py={1}>
            <Text variant="subcaption">{data.label}</Text>
        </Box>
    );

    return (
        <ClickOutside
            // @ts-ignore
            reactRoot={document.getElementById("react-app-modal-root")}
            onClickOutside={close}
        >
            <Dropdown
                label={t("pricing.pricingLine")}
                isOpen={isOpen}
                onOpen={open}
                onClose={close}
                leftIcon={"euro"}
                data-testid={"add-price-dropdown"}
                contentStyle={{
                    marginTop: 1,
                    minWidth: "150%",
                    borderColor: theme.colors.neutral.lighterTransparentBlack,
                }}
            >
                {isOpen && (
                    <Box height={224} py={2}>
                        <Select
                            placeholder={t("common.search")}
                            autoFocus
                            menuIsOpen
                            blurInputOnSelect
                            isClearable={false}
                            options={groupedMetricsOptions}
                            components={{
                                IndicatorSeparator: () => null,
                                DropdownIndicator: () => null,
                                ValueContainer,
                            }}
                            styles={{
                                valueContainer: (base) => ({
                                    ...base,
                                    paddingLeft: theme.space[6],
                                }),
                                groupHeading: (base) => ({
                                    ...base,
                                    backgroundColor: theme.colors.grey.ultralight,
                                    marginBottom: 0,
                                }),
                                group: (base) => ({
                                    ...base,
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                }),
                                menuList: (base) => ({
                                    ...base,
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                }),
                                control: (base) => ({
                                    ...base,
                                    margin: 8,
                                    width: "auto",
                                }),
                                menu: () => ({
                                    boxShadow: "none",
                                }),
                            }}
                            controlShouldRenderValue={false}
                            maxMenuHeight={156}
                            onChange={(option: SelectOption<PricingMetricKey>) => {
                                // @ts-ignore
                                onAddPricingLine(option.value);
                                if (option.value !== "FLAT") {
                                    setRecentVariableMetricUsed(option.value);
                                }
                                close();
                            }}
                            formatGroupLabel={formatGroupLabel}
                            data-testid="add-pricing-line-select"
                        />
                    </Box>
                )}
            </Dropdown>
        </ClickOutside>
    );
}
