import {Box, BoxProps} from "@dashdoc/web-ui";
import React from "react";

function EventCircle(props: BoxProps) {
    return (
        <Box
            backgroundColor="green.default"
            borderRadius="50%"
            width={20}
            height={20}
            {...props}
        />
    );
}

export {EventCircle};
