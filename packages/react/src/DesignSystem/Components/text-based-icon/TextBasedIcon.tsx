import {Text, TextProps, Box, BoxProps} from "@dashdoc/web-ui";
import React from "react";

import {getShortTitle, generateColors} from "./textBasedIcon.service";

export type TextBasedIconProps = {
    title: string;
    size: string;
    boxProps?: BoxProps;
    textProps?: TextProps;
};

/**
 * Build an icon based on a title.
 *  "Atlantique Transport" => (AT)
 *  "JPB" => (JP)
 *  "" => (ND)
 */
export function TextBasedIcon({title, size, boxProps, textProps}: TextBasedIconProps) {
    const label = getShortTitle(title);
    const {background, foreground} = generateColors(title);

    return (
        <Box
            height={size ?? "40px"}
            width={size ?? "40px"}
            minWidth={size ?? "40px"}
            minHeight={size ?? "40px"}
            m={0}
            p={0}
            alignItems="center"
            justifyContent="center"
            borderRadius="100%"
            backgroundColor={background}
            boxShadow="large"
            {...boxProps}
        >
            <Text
                textAlign="center"
                fontWeight="600"
                fontSize={4}
                lineHeight={size ?? "40px"}
                color={foreground}
                {...textProps}
            >
                {label.toUpperCase()}
            </Text>
        </Box>
    );
}
