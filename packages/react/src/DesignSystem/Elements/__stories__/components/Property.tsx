import {t} from "@dashdoc/web-core";
import {ClickableFlex, Flex, Text, toast} from "@dashdoc/web-ui";
import {copyToClipboard} from "dashdoc-utils";
import React from "react";

export type ThemeProps = {name: string; value: string};

export const DefaultProperty = ({name, value}: ThemeProps) => {
    return (
        <>
            <Text>{name}</Text>
            <Text>{value}</Text>
        </>
    );
};

export const ColorProperty = ({name, value}: ThemeProps) => {
    return (
        <ClickableFlex
            width="120px"
            height="80px"
            flexDirection="column"
            mb={3}
            backgroundColor={value}
            border="1px solid"
            borderColor="grey.light"
            onClick={() => {
                handleCopy(name);
            }}
            hoverStyle={{
                bg: value,
            }}
        >
            <Flex justifyContent="end">
                <Text
                    fontSize={0}
                    textAlign="right"
                    border="1px solid"
                    borderColor={isDark(value) ? "grey.dark" : "grey.ultradark"}
                    backgroundColor="grey.ultradark"
                    color="grey.white"
                    boxShadow="medium"
                    p={1}
                    m={1}
                >
                    {value}
                </Text>
            </Flex>
            <Flex flexGrow="1" justifyContent="center" alignItems="center">
                <Text
                    textAlign="center"
                    color={isDark(value) ? "grey.white" : "grey.ultradark"}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                >
                    {name}
                </Text>
            </Flex>
        </ClickableFlex>
    );
    function handleCopy(value: string) {
        copyToClipboard(
            value,
            () => toast.success("Copied", {autoClose: 500}),
            () => toast.error(t("common.error"))
        );
    }
};

// based on https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
function isDark(color: string) {
    const c = color.substring(1); // strip #
    const rgb = parseInt(c, 16); // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff; // extract red
    const g = (rgb >> 8) & 0xff; // extract green
    const b = (rgb >> 0) & 0xff; // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return luma < 150;
}
