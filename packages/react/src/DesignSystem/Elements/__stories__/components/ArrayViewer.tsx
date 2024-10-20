import {Box, Card, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

export const ArrayViewer = ({title, array}: {title: string; array: any[]}) => (
    <Box width="150px">
        <Text variant="h1">{title}</Text>
        <Card
            mt={4}
            ml={4}
            p={4}
            style={{
                display: "grid",
                gridTemplateRows: `repeat(${array.length}, 1fr)`,
                columnGap: "5px",
                rowGap: "5px",
            }}
        >
            {array.map((item, index) => (
                <Flex key={index}>
                    <Text mr={2}>[{index}]</Text>
                    <Text>{item}</Text>
                </Flex>
            ))}
        </Card>
    </Box>
);
