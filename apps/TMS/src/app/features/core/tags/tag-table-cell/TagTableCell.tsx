import {Box, Flex, TooltipWrapper} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import {Tag as TagData} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {TagTooltip} from "./TagTooltip";

type TagTableCellProps = {
    tags: TagData[];
    numberOfItemsToDisplay?: number;
    wrap?: boolean;
};

const TagTableCell: FunctionComponent<TagTableCellProps> = ({
    tags,
    numberOfItemsToDisplay = 1,
    wrap = true,
}) => {
    const tagsToDisplay = tags?.slice(0, numberOfItemsToDisplay);
    const numberOfHiddenTags =
        tags?.length > numberOfItemsToDisplay ? tags?.length - numberOfItemsToDisplay : 0;
    return (
        <Flex
            height="100%"
            alignItems="center"
            style={{gap: "4px"}}
            flexWrap={wrap ? "wrap" : undefined}
        >
            {tagsToDisplay.map((tag, index) => {
                return <Tag key={index} tag={tag} data-testid={`tag-table-cell-tag-${index}`} />;
            })}
            {numberOfHiddenTags > 0 && (
                <>
                    <TooltipWrapper content={<TagTooltip tags={tags} />}>
                        <Box p={1} backgroundColor="grey.light" flexShrink={0}>
                            +{numberOfHiddenTags}
                        </Box>
                    </TooltipWrapper>
                </>
            )}
        </Flex>
    );
};

export {TagTableCell};
