import {theme} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";

import {NoDataPlaceholder} from "../../../NoDataPlaceholder";
import {ResponsiveChartContainer} from "../../../ResponsiveChartContainer";
import {VerticalChart} from "../types";

export const GenericChart: FunctionComponent<VerticalChart> = ({
    rows,
    bars,
    legends,
    placeholder,
    renderXTick,
    renderTooltip,
    barChartProps,
}) => {
    if (rows?.length) {
        return (
            <ResponsiveChartContainer>
                <BarChart
                    data={rows}
                    {...barChartProps}
                    margin={{top: 0, right: 0, bottom: 0, left: 0}}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.colors.grey.light}
                        vertical={false}
                    />
                    <Tooltip
                        cursor={{fill: theme.colors.blue.ultralight}}
                        content={renderTooltip ?? undefined}
                    />
                    {bars.map((aBar, index) => {
                        let barSize = aBar.barSize !== undefined ? aBar.barSize : 18;
                        let stackId;
                        let radius = [4, 4, 0, 0] as number | [number, number, number, number];
                        if (aBar.stackId) {
                            stackId = aBar.stackId;
                            // let the radius on the last bar
                            if (index < bars.length - 1) {
                                radius = 0;
                            }
                        }
                        let optionalBarProps = {};
                        if (legends && index < legends.length) {
                            optionalBarProps = {name: legends[index].label};
                        }
                        return (
                            <Bar
                                key={index}
                                dataKey={`values[${index}]`}
                                fill={aBar.color}
                                radius={radius}
                                barSize={barSize}
                                stackId={stackId}
                                {...optionalBarProps}
                            />
                        );
                    })}
                    <YAxis
                        type="number"
                        axisLine={false}
                        tickMargin={0}
                        tickLine={false}
                        width={40}
                        stroke={theme.colors.grey.dark}
                        tick={{fontSize: 10}}
                    />
                    <XAxis
                        dataKey="label"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                        stroke={theme.colors.grey.dark}
                        tick={renderXTick ?? {fontSize: 10}}
                    />
                </BarChart>
            </ResponsiveChartContainer>
        );
    } else {
        return <NoDataPlaceholder content={placeholder} />;
    }
};
