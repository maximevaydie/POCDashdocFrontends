import {Box, Flex, Icon} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

interface NetworkMapLoaderProps {
    numberOfResults: number;
}

export const NetworkMapLoader = ({numberOfResults}: NetworkMapLoaderProps) => {
    return (
        <LoaderContainer
            backgroundColor={"grey.white"}
            padding={2}
            borderRadius={2}
            border="1px solid"
            borderColor="grey.light"
            boxShadow="small"
            style={{left: "50%", transform: "translateX(-50%)"}}
        >
            {numberOfResults > 1000 ? (
                <Flex flexDirection="row" alignItems={"center"}>
                    <Icon name="warning" scale={1.2} color="blue.default" />
                    <Box marginLeft={2} marginRight={2}>
                        <strong>{numberOfResults}</strong> results
                    </Box>
                    <Icon name="arrowRight" scale={1} color="blue.default" />
                    <Box marginLeft={2}>Zoom in to see them all</Box>
                </Flex>
            ) : (
                <Flex flexDirection="row" alignItems={"center"}>
                    <Icon name="checkCircle" scale={1.2} color="green.default" />
                    <Box marginLeft={2}>
                        <strong>{numberOfResults}</strong> results
                    </Box>
                </Flex>
            )}
        </LoaderContainer>
    );
};

const LoaderContainer = styled(Box)`
    position: absolute;
    bottom: 5px;
    margin-left: auto;
    margin-right: auto;
    width: auto;
    z-index: 1001;
    padding: 8px;
    font-size: 14px;

    @media (max-width: 768px) {
        font-size: 10px;
    }
`;
