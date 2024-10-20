import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Text} from "../base";
import {theme} from "../theme";

import {Box} from "./Box";
import {Flex, FlexProps} from "./Flex";

export default {
    title: "Web UI/layout/Flex and Box",
} as Meta;

export const FlexBox: Story<FlexProps> = () => (
    <Box width={600} p={6}>
        <Text>All our Web UI components are based one two main components:</Text>
        <Text mb={4}>
            <code>{"<Flex />"}</code> and <code>{"<Box />"}</code>
        </Text>
        <Text my={4}>
            They are building blocks based on the great{" "}
            <a href="https://styled-system.com/" target="_blank" rel="noreferrer">
                styled-system
            </a>{" "}
            library.
        </Text>
        <Text>
            A <code>{"<Box />"}</code> is basically a <code>{"<div />"}</code> with
            constraint-based style props based on our theme.
        </Text>
        <Text>
            It accepts{" "}
            <a href="https://styled-system.com/api#space" target="_blank" rel="noreferrer">
                <code>{"space"}</code>
            </a>
            ,{" "}
            <a href="https://styled-system.com/api#color" target="_blank" rel="noreferrer">
                <code>{"color"}</code>
            </a>
            ,{" "}
            <a href="https://styled-system.com/api#typography" target="_blank" rel="noreferrer">
                <code>{"typography"}</code>
            </a>
            ,{" "}
            <a href="https://styled-system.com/api#layout" target="_blank" rel="noreferrer">
                <code>{"layout"}</code>
            </a>
            ,{" "}
            <a href="https://styled-system.com/api#flexbox" target="_blank" rel="noreferrer">
                <code>{"flexbox"}</code>
            </a>
            ,{" "}
            <a href="https://styled-system.com/api#background" target="_blank" rel="noreferrer">
                <code>{"background"}</code>
            </a>{" "}
            and{" "}
            <a href="https://styled-system.com/api#border" target="_blank" rel="noreferrer">
                <code>{"border"}</code>
            </a>{" "}
            utilities props.
        </Text>
        <Text my={4}>
            A <code>{"<Flex />"}</code> is a <code>{"<Box />"}</code> with{" "}
            <code>{"display: flex; flex-direction: row"}</code>
            css.
        </Text>
        <Text my={4}>
            Take a look to the{" "}
            <a href="https://styled-system.com/api" target="_blank" rel="noreferrer">
                styled-system API documentation
            </a>{" "}
            to see what props can be used with these utilities and how they will be converted to
            CSS declarations.
        </Text>
        <Text my={4}>Example:</Text>
        <pre>
            {`<Flex flex={1} p={4} backgroundColor="blue.default">
    <Box flex={1} p={6} mr={2} backgroundColor="grey.lighter">
        <Text>Box 1 content</Text>
    </Box>
    <Box flex={1} p={6} ml={2} backgroundColor="grey.lighter">
        <Text>Box 2 content</Text>
    </Box>
</Flex>`}
        </pre>
        <Flex flex={1} p={4} backgroundColor="blue.default">
            <Box flex={1} p={4} mr={2} backgroundColor="grey.lighter">
                <Text>Box 1 content</Text>
            </Box>
            <Box flex={1} p={4} ml={2} backgroundColor="grey.lighter">
                <Text>Box 2 content</Text>
            </Box>
        </Flex>
        <Text my={4}>Explanations:</Text>
        <ul>
            <li>
                <Text>
                    <code>{"<Flex />"}</code>: will stack its children horizontally
                </Text>
            </li>
            <li>
                <Text>
                    <code>{"p={4}"}</code>: p for padding, 4 for the value at index 4 in our
                    <code>theme.space</code>. That will produce the CSS declaration:{" "}
                    <code>{"padding: 16px"}</code>
                </Text>
            </li>
            <li>
                <Text>
                    <code>{'backgroundColor="blue.default"'}</code>: will look for the{" "}
                    <code>blue.default</code> color in our <code>theme.colors</code>. That will
                    produce the CSS declaration:{" "}
                    <code>{`background-color: ${theme.colors.blue.default}`}</code>
                </Text>
            </li>
            <li>
                <Text>
                    <code>{"ml={2}"}</code>: ml for margin-left, 2 for the value at index 2 in our
                    <code>theme.space</code>. That will produce the CSS declaration:{" "}
                    <code>{"margin-left: 8px"}</code>
                </Text>
            </li>
        </ul>
    </Box>
);
FlexBox.storyName = "Flex and Box";
