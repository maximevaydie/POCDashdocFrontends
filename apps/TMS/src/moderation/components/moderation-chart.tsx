import {Box} from "@dashdoc/web-ui";
import {BarChart, BarChartProps} from "@dashdoc/web-ui";
import React, {FunctionComponent, useEffect, useState} from "react";

import {Api} from "../Api";

export type ModerationChartProps = Omit<BarChartProps, "data"> & {
    dataUrl: string;
};

const ModerationChart: FunctionComponent<ModerationChartProps> = ({dataUrl, ...chartProps}) => {
    const [data, setData] = useState();

    useEffect(() => {
        Api.get(dataUrl, {apiVersion: "v4"}).then(({data}) => setData(data));
    }, [dataUrl]);

    if (!data) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box height={250}>
            <BarChart data={data} {...chartProps} />
        </Box>
    );
};

export default ModerationChart;
