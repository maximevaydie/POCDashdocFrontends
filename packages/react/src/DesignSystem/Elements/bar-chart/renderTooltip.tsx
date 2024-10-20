import {Card, CardProps, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent, ReactNode} from "react";
import {TooltipProps as RechartTooltipProps} from "recharts";

export type TooltipOptions = {
    render?: (
        props: RechartTooltipProps<number, string>,
        options?: Omit<TooltipOptions, "render">
    ) => ReactNode;
    labelFormatter?: (label: string) => string;
    nameFormatter?: (name: string) => string;
    valueFormatter?: (value: number) => string;
};

export type TooltipProps = Pick<
    RechartTooltipProps<number, string>,
    | "offset"
    | "cursor"
    | "viewBox"
    | "allowEscapeViewBox"
    | "active"
    | "coordinate"
    | "payload"
    | "isAnimationActive"
    | "animationDuration"
    | "animationEasing"
> &
    TooltipOptions;

const TooltipContainer: FunctionComponent<CardProps> = (props) => (
    <Card px={2} py={1} {...props} />
);

const TooltipItem: FunctionComponent<
    // @ts-ignore
    TooltipProps<number, string>["payload"][0] & {options: TooltipOptions}
> = ({options, ...payload}) => {
    // @ts-ignore
    const {nameFormatter = (name) => name, valueFormatter = (value) => formatNumber(value)} =
        options;

    const {dataKey, color, name, value} = payload;

    return (
        <Text key={dataKey} color={color}>
            {`${nameFormatter(name)} : ${valueFormatter(value)}`}
        </Text>
    );
};

const defaultTooltipRender: TooltipOptions["render"] = (props, options) => {
    const {active, payload: payloads = [], label} = props;
    // @ts-ignore
    const {labelFormatter = (label) => label} = options;

    if (active) {
        return (
            <>
                {label && <Text>{labelFormatter(label)}</Text>}
                {payloads.map((payload) => (
                    <TooltipItem key={payload.dataKey} options={options} {...payload} />
                ))}
            </>
        );
    }
    return null;
};

export const renderTooltip = (
    // @ts-ignore
    props: Parameters<TooltipOptions["render"]>[0],
    {render = defaultTooltipRender, ...options}: TooltipOptions
) => <TooltipContainer>{render(props, options)}</TooltipContainer>;
