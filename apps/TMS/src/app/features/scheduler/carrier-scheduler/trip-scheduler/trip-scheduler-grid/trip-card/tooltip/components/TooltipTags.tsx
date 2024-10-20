import {Flex} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import {Tag as TagData} from "dashdoc-utils";
import React from "react";

export function TooltipTags({tags}: {tags: Array<TagData>}) {
    return tags.length > 0 ? (
        <Flex py={2} borderTop="1px solid" borderColor="grey.light" flexWrap="wrap">
            {tags.map((tag, index) => (
                <Tag tag={tag} key={index} mr={1} mb={1} />
            ))}
        </Flex>
    ) : (
        <></>
    );
}
