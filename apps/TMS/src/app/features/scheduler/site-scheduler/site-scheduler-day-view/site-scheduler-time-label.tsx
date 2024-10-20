import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

type SiteSchedulerTimeLabelProps = {
    hourLabel: string;
    index: number;
};

export default function SiteSchedulerTimeLabel(props: SiteSchedulerTimeLabelProps) {
    return (
        <Box height={"72px"} position={"relative"} top={"-6px"}>
            <Text
                color="grey.dark"
                variant="caption"
                textAlign={"right"}
                display={props.index === 0 ? "none" : ""}
            >
                {props.hourLabel}
            </Text>
        </Box>
    );
}
