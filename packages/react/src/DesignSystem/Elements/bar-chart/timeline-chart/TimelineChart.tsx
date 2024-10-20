import {theme} from "@dashdoc/web-ui";
import React, {ReactElement, ReactNode} from "react";
import {Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";

import {NoDataPlaceholder} from "../NoDataPlaceholder";
import {ResponsiveChartContainer} from "../ResponsiveChartContainer";
export type ChartTimelineRow = {
    date: Date;
    values: number[];
};

type Line = {
    color: string;
    stackId?: string; // cumulate several bars (based on the stackId)
};
type Props = {
    rows: ChartTimelineRow[];
    minDate?: Date;
    maxDate?: Date;
    lines: Line[];
    placeholder?: ReactNode;
    renderTooltip?: (props: any) => ReactElement;
    height?: number;
    hideYAxis?: boolean;
};

export function TimelineChart({
    rows,
    minDate,
    maxDate,
    lines,
    placeholder,
    renderTooltip,
    height,
    hideYAxis,
}: Props) {
    if (rows?.length) {
        const domainTimeRange = [
            (dataMin: Date) => minDate ?? dataMin,
            (dataMax: Date) => maxDate ?? dataMax,
        ];
        return (
            <ResponsiveChartContainer>
                <AreaChart
                    data={rows}
                    height={height}
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
                    {lines.map((line, index) => {
                        let stackId;

                        return (
                            <Area
                                key={index}
                                type="monotone"
                                dataKey={`values[${index}]`}
                                stroke={line.color}
                                fill={line.color}
                                fillOpacity={0.5}
                                stackId={stackId}
                            />
                        );
                    })}
                    <YAxis
                        type="number"
                        axisLine={false}
                        width={40}
                        hide={hideYAxis}
                        stroke={theme.colors.grey.dark}
                    />
                    <XAxis
                        dataKey="date"
                        type="number"
                        scale="time"
                        axisLine={false}
                        tick={false}
                        /* @ts-ignore */
                        domain={domainTimeRange}
                    />
                </AreaChart>
            </ResponsiveChartContainer>
        );
    } else {
        return <NoDataPlaceholder content={placeholder} />;
    }
}
