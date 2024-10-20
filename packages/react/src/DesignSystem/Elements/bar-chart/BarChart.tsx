import React, {FunctionComponent} from "react";
import {
    Bar,
    BarProps,
    CartesianGrid,
    Legend,
    BarChart as RCBarChart,
    Tooltip,
    XAxis,
    XAxisProps,
    YAxis,
} from "recharts";

import {NoDataPlaceholder} from "./NoDataPlaceholder";
import {renderTooltip, TooltipProps} from "./renderTooltip";
import {ResponsiveChartContainer, ResponsiveChartContainerProps} from "./ResponsiveChartContainer";
import {categoricalColors} from "./utils";

type RCBarChartProps = (typeof RCBarChart)["defaultProps"];

export type BarChartProps = RCBarChartProps & {
    containerProps?: ResponsiveChartContainerProps;
    data: Record<string, unknown>[];
    xAxis: XAxisProps;
    bars: Omit<BarProps, "ref">[];
    tooltip?: TooltipProps;
};

export const BarChart: FunctionComponent<BarChartProps> = ({
    containerProps = {},
    data,
    xAxis,
    bars,
    tooltip = {},
    ...props
}) => {
    const {
        render: customTooltipRender,
        labelFormatter,
        nameFormatter,
        valueFormatter,
        ...tooltipProps
    } = tooltip;

    return (
        <ResponsiveChartContainer {...containerProps}>
            {!Object.keys(data).length ? (
                <NoDataPlaceholder />
            ) : (
                <RCBarChart {...props} data={data}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis {...xAxis} />
                    <YAxis />
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
                    <Legend />
                    {bars.map(({dataKey, fill, ...bar}, i) => (
                        <Bar
                            key={dataKey as string}
                            dataKey={dataKey}
                            fill={fill || categoricalColors[i]}
                            {...bar}
                        />
                    ))}
                </RCBarChart>
            )}
        </ResponsiveChartContainer>
    );
};
