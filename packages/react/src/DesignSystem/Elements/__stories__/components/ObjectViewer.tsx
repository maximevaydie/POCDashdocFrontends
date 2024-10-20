import {Box, Card, Flex, Text} from "@dashdoc/web-ui";
import React, {ElementType} from "react";

import {ThemeProps} from "./Property";

const RecursivePropertyViewer = ({
    name,
    value,
    PropertyComponent,
}: ThemeProps & {
    PropertyComponent: ElementType<ThemeProps>;
}) => {
    if (typeof value === "string") {
        return <PropertyComponent name={name} value={value as string} />;
    } else if (typeof value === "object") {
        return (
            <Card width="460px">
                <Flex flexDirection="column" p={2}>
                    <Text variant="h1">{name}</Text>
                    <Box
                        m={2}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            columnGap: "2px",
                            rowGap: "8px",
                        }}
                    >
                        {Object.keys(value).map((colorKey: string) => (
                            <RecursivePropertyViewer
                                key={colorKey}
                                name={`${name}.${colorKey}`}
                                value={value[colorKey] as any}
                                PropertyComponent={PropertyComponent}
                            />
                        ))}
                    </Box>
                </Flex>
            </Card>
        );
    }
    return null;
};

export const ObjectViewer = ({
    title,
    object,
    PropertyComponent,
}: {
    title: string;
    object: any;
    PropertyComponent: ElementType<ThemeProps>;
}) => (
    <Flex flexDirection="column">
        <Text variant="h1">{title}</Text>
        <Card width="400px" m={4} p={4}>
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    columnGap: "5px",
                    rowGap: "20px",
                }}
            >
                {Object.keys(object)
                    .filter((aKey: string) => typeof object[aKey] === "string")
                    .map((aKey: string) => (
                        <RecursivePropertyViewer
                            key={aKey}
                            name={aKey}
                            value={object[aKey]}
                            PropertyComponent={PropertyComponent}
                        />
                    ))}
            </Box>
        </Card>
        <Flex
            m={4}
            flexWrap="wrap"
            style={{
                columnGap: "20px",
                rowGap: "20px",
            }}
        >
            {Object.keys(object)
                .filter((aKey: string) => typeof object[aKey] !== "string")
                .map((aKey: string) => (
                    <RecursivePropertyViewer
                        key={aKey}
                        name={aKey}
                        value={object[aKey]}
                        PropertyComponent={PropertyComponent}
                    />
                ))}
        </Flex>
    </Flex>
);

const RecursiveColorViewer = ({
    name,
    value,
    PropertyComponent,
}: ThemeProps & {
    PropertyComponent: ElementType<ThemeProps>;
}) => {
    if (typeof value === "string") {
        return <PropertyComponent name={name} value={value as string} />;
    } else if (typeof value === "object") {
        return (
            <Flex flexDirection="column" p={2}>
                <Text variant="h1">{name}</Text>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                    }}
                >
                    {Object.keys(value).map((colorKey: string) => (
                        <RecursiveColorViewer
                            key={colorKey}
                            name={`${name}.${colorKey}`}
                            value={value[colorKey] as any}
                            PropertyComponent={PropertyComponent}
                        />
                    ))}
                </Box>
            </Flex>
        );
    }
    return null;
};

export const ColorViewer = ({
    object,
    PropertyComponent,
}: {
    object: any;
    PropertyComponent: ElementType<ThemeProps>;
}) => (
    <Flex flexDirection="column">
        <Flex flexWrap="wrap" style={{}}>
            {Object.keys(object)
                .filter((aKey: string) => typeof object[aKey] !== "string")
                .map((aKey: string) => (
                    <RecursiveColorViewer
                        key={aKey}
                        name={aKey}
                        value={object[aKey]}
                        PropertyComponent={PropertyComponent}
                    />
                ))}
        </Flex>
    </Flex>
);
