import React, {FunctionComponent, useMemo} from "react";
import {Cell, Legend, LegendProps, Pie, PieProps, PieChart as RCPieChart, Tooltip} from "recharts";

import {NoDataPlaceholder} from "./NoDataPlaceholder";
import {renderTooltip, TooltipProps} from "./renderTooltip";
import {ResponsiveChartContainer, ResponsiveChartContainerProps} from "./ResponsiveChartContainer";
import {categoricalColors} from "./utils";

export type PieChartProps = Omit<PieProps, "ref" | "data" | "cells" | "dataKey"> & {
    containerProps?: ResponsiveChartContainerProps;
    data: {
        dataKey?: string;
        name: string;
        value: number;
        fill?: string;
        [key: string]: unknown;
    }[];
    tooltip?: TooltipProps;
    legend?: Omit<LegendProps, "ref">;
};

export const PieChart: FunctionComponent<PieChartProps> = ({
    containerProps = {},
    data,
    tooltip = {},
    legend = {},
    ...props
}) => {
    // check that all values are not 0 to not display an invisible pie
    const canBeRendered = useMemo(() => data.some(({value}) => value), [data]);
    const {
        render: customTooltipRender,
        labelFormatter,
        nameFormatter,
        valueFormatter,
        ...tooltipProps
    } = tooltip;

    return (
        <ResponsiveChartContainer {...containerProps}>
            {!canBeRendered ? (
                <NoDataPlaceholder />
            ) : (
                <RCPieChart>
                    <Pie dataKey="value" data={data} innerRadius={"50%"} {...props}>
                        {data.map(({dataKey, name, fill}, i) => (
                            <Cell key={dataKey || name} fill={fill || categoricalColors[i]} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={(props) =>
                            renderTooltip(props, {
                                render: customTooltipRender,
                                labelFormatter,
                                nameFormatter,
                                valueFormatter,
                            })
                        }
                        {...tooltipProps}
                    />
                    <Legend iconType="circle" iconSize={10} {...legend} />
                </RCPieChart>
            )}
        </ResponsiveChartContainer>
    );
};
