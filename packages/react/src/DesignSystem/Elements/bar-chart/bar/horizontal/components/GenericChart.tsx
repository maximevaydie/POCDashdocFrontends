import {theme} from "@dashdoc/web-ui";
import React, {FunctionComponent, ReactNode} from "react";
import {Bar, BarChart, Cell, LabelList, XAxis, YAxis} from "recharts";

import {NoDataPlaceholder} from "../../../NoDataPlaceholder";
import {ResponsiveChartContainer} from "../../../ResponsiveChartContainer";
import {HorizontalChartRow} from "../types";

const MAX_TEXT_LENGTH = 16; // Limit to crop the line title
const RESERVED_WIDTH_BY_CHAR = 10; // Number of pixel to reserve by char to compute label width

const YLabel: FunctionComponent = (props: any) => {
    const {x, y, payload} = props;
    const {value} = payload;
    const label = value.length > MAX_TEXT_LENGTH ? value.slice(0, MAX_TEXT_LENGTH) + "..." : value;
    return (
        <>
            <g
                transform={`translate(${x},${y})`}
                fill={theme.colors.grey.ultradark}
                fontWeight="400"
                fontSize="14px"
            >
                <text x={0} y={0} dy={6} textAnchor="end">
                    {label}
                </text>
            </g>
        </>
    );
};

const ValueInBar: FunctionComponent = (props: any) => {
    const {x, y, width, value} = props;
    const labelLength = value.length;
    const computedWidth = labelLength * RESERVED_WIDTH_BY_CHAR;
    if (computedWidth < width) {
        return (
            <text
                x={x + width}
                y={y}
                dy={18}
                dx={-8}
                textAnchor="end"
                fill={theme.colors.grey.white}
                fontSize="12px"
            >
                {value}
            </text>
        );
    } else {
        return (
            <text
                x={50 + x + width}
                y={y}
                dy={18}
                textAnchor="end"
                fill={theme.colors.grey.ultradark}
                fontSize="12px"
            >
                {value}
            </text>
        );
    }
};

export const GenericChart: FunctionComponent<{
    results: HorizontalChartRow[];
    placeholder?: ReactNode;
}> = ({results, placeholder}) => {
    if (results?.length) {
        return (
            <ResponsiveChartContainer>
                <BarChart
                    layout="vertical"
                    data={results}
                    margin={{
                        right: 0,
                        left: 35,
                    }}
                >
                    <YAxis
                        dataKey="label"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={140}
                        tickMargin={15}
                        tick={<YLabel />}
                    />
                    <XAxis dataKey="value" type="number" hide />
                    <Bar dataKey="value" barSize={25} fill="purple.dark" radius={[4, 4, 4, 4]}>
                        <>
                            <LabelList dataKey="valueLabel" content={<ValueInBar />} />
                            {results.map((result, index) => {
                                return <Cell key={`cell-${index}`} fill={result.color} />;
                            })}
                        </>
                    </Bar>
                </BarChart>
            </ResponsiveChartContainer>
        );
    } else {
        return <NoDataPlaceholder content={placeholder} />;
    }
};
