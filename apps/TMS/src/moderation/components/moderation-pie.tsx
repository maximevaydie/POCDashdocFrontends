import {Box} from "@dashdoc/web-ui";
import {PieChart, PieChartProps} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent, useEffect, useState} from "react";

import {Api} from "../Api";

export type ModerationPieProps = Omit<PieChartProps, "data"> & {
    dataUrl: string;
};

const ModerationPie: FunctionComponent<ModerationPieProps> = ({dataUrl, ...pieProps}) => {
    const [data, setData] = useState<PieChartProps["data"]>();

    useEffect(() => {
        Api.get(dataUrl, {apiVersion: "v4"}).then(({data}) => {
            const pieData = Object.keys(data).map((key) => ({name: key, value: data[key]}));
            setData(pieData);
        });
    }, [dataUrl]);

    if (!data) {
        return <Box>Loading...</Box>;
    }

    const total = data.reduce((sum, currentValue) => sum + currentValue.value, 0);

    const formatTooltipValue = (value: number) => {
        return `${formatNumber(value)} (${formatNumber(value / total, {
            style: "percent",
            maximumFractionDigits: 2,
        })})`;
    };

    return (
        <Box height={250}>
            <PieChart
                {...pieProps}
                tooltip={{
                    valueFormatter: formatTooltipValue,
                }}
                data={data}
            />
        </Box>
    );
};

export default ModerationPie;
