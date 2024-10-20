import {Box, Flex} from "@dashdoc/web-ui";
import React from "react";

type InvoiceDiagramProps = {
    highlight?: "payment-data" | "legal-mentions";
};

export const InvoiceDiagram = ({highlight}: InvoiceDiagramProps) => {
    return (
        <Flex
            ml={5}
            minWidth={"220px"}
            height={"310px"}
            border="1px solid"
            borderColor="grey.light"
            backgroundColor="grey.ultralight"
            p={3}
            flexDirection={"column"}
        >
            <Flex flexDirection={"row"} flex={2} mb={3}>
                <Flex flexDirection={"column"} flex={1}>
                    <Box flex={1} backgroundColor="grey.light" mb={1}></Box>
                    <Box flex={2} backgroundColor="grey.light"></Box>
                </Flex>
                <Box flex={2} />
                <Flex flexDirection={"column"} flex={1}>
                    <Box flex={2} backgroundColor="grey.light" mb={1}></Box>
                    <Box flex={1} />
                </Flex>
            </Flex>
            <Box flex={7} backgroundColor="grey.light" mb={2} />
            <Flex flex={1} flexDirection={"row"} mb={3}>
                <Box flex={3} />
                <Box flex={2} backgroundColor="grey.light" />
            </Flex>
            <Flex flex={1.5} flexDirection={"row"}>
                <Box
                    flex={1}
                    backgroundColor={highlight === "payment-data" ? "blue.light" : "grey.light"}
                    mr={2}
                />
                <Box
                    flex={2}
                    backgroundColor={highlight === "legal-mentions" ? "blue.light" : "grey.light"}
                />
            </Flex>
            <Box flex={1.5} />
            <Box flex={1} backgroundColor="grey.light" />
        </Flex>
    );
};
