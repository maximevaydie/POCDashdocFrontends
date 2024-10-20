import {Box, Flex} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import {Tag as TagData} from "dashdoc-utils";
import React from "react";

type Props = {
    tags: TagData[];
};

export const TagTooltip: React.VFC<Props> = ({tags}) => {
    return (
        <Box my={1}>
            <Flex flexWrap="wrap" maxWidth="250px" style={{gap: "4px"}}>
                {tags.map((tag, index) => (
                    <Tag key={index} tag={tag} />
                ))}
            </Flex>
        </Box>
    );
};
