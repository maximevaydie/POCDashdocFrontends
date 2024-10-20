import {ReactElement, ReactNode} from "react";
import {BarChart} from "recharts";

export interface Bar {
    color: string;
    stackId?: string; // cumulate several bars (based on the stackId)
    barSize?: number; // 18px by default
}

export interface Legend {
    label: string;
    color: string;
}

export interface ChartRow {
    label: string;
    values: number[];
}

export interface VerticalChart {
    title: string | JSX.Element;
    rows: ChartRow[];
    legends: Legend[];
    bars: Bar[];
    placeholder?: ReactNode;
    renderXTick?: (props: any) => ReactElement<SVGElement>;
    renderTooltip?: (props: any) => ReactElement;
    barChartProps?: (typeof BarChart)["defaultProps"];
    height?: number;
}
