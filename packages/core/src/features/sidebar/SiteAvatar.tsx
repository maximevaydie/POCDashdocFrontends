import {Box, CompanyAvatar, Flex, Text} from "@dashdoc/web-ui";
import React from "react";
import {Site} from "types";

type Props = {site: Site};

export function SiteAvatar({site}: Props) {
    return (
        <Flex alignItems="center" style={{gap: "8px"}}>
            <Box width="40px" height="40px" minWidth="auto" flexShrink={2}>
                <CompanyAvatar name={site.name} />
            </Box>
            <Text ml={2} variant="h1">
                {site.name}
            </Text>
        </Flex>
    );
}
