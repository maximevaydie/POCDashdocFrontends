import {Box, Card, Flex, Text, ToastContainer, theme} from "@dashdoc/web-ui";
import {Meta} from "@storybook/react/types-6-0";
import React from "react";

import {ArrayViewer} from "./components/ArrayViewer";
import {ColorViewer, ObjectViewer} from "./components/ObjectViewer";
import {ColorProperty, DefaultProperty} from "./components/Property";

export const Theme = () => {
    const {colors, fontSizes, fonts, lineHeights, space, shadows, radii} = theme;
    return (
        <>
            <Text variant="h1">Colors</Text>
            <Card>
                <Box>
                    <ColorViewer PropertyComponent={ColorProperty} object={colors} />
                </Box>
            </Card>
            <Flex mt={4} style={{gap: "20px"}}>
                <ObjectViewer title="Fonts" PropertyComponent={DefaultProperty} object={fonts} />
                <ObjectViewer
                    title="Shadows"
                    PropertyComponent={DefaultProperty}
                    object={shadows}
                />
                <Flex style={{gap: "20px"}}>
                    <ArrayViewer title="fontSizes" array={fontSizes} />
                    <ArrayViewer title="lineHeights" array={lineHeights} />
                    <ArrayViewer title="space" array={space} />
                    <ArrayViewer title="borderRadiuses" array={radii} />
                </Flex>
            </Flex>
            <ToastContainer />
        </>
    );
};

export default {
    title: "Web UI/Theme",
    component: Theme,
} as Meta;
