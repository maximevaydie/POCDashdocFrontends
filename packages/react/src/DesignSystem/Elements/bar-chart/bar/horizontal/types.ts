import {ReactNode} from "react";

export interface HorizontalChartRow {
    id: number;
    label: string;
    color: string;
    valueLabel: string;
    value: number;
    checked?: boolean;
}

export interface HorizontalChart {
    titleValue: string;
    titleLabel: string;
    results: HorizontalChartRow[];
    informationLabel?: string;
    placeholder?: ReactNode;
    type: string;
    onSelectKey?: (newKeys: number[]) => void;
}
