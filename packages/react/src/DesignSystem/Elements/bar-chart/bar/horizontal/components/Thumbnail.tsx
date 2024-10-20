import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {HorizontalChart} from "../types";

import {GenericChart} from "./GenericChart";

const Header: FunctionComponent<{title: string; subtitle: string}> = ({title, subtitle}) => {
    return (
        <Flex>
            <Text variant="title" color="grey.dark" textAlign="right">
                {title}
            </Text>
            <Text variant="h2" ml={4}>
                {subtitle}
            </Text>
        </Flex>
    );
};

type ThumbnailProps = HorizontalChart & {
    count: number;
};
export const Thumbnail: FunctionComponent<ThumbnailProps> = ({
    titleValue: title,
    titleLabel: subtitle,
    results,
    count,
    ...others
}) => {
    const remainingRows = count - results.length;
    return (
        <Box minHeight={310}>
            <Header title={title} subtitle={subtitle} />
            <Box height={`${(25 + 10) * results.length}px`} mt={6}>
                <GenericChart results={results} {...others} />
            </Box>
            <Text color="grey.dark" ml={175} mt={2}>
                {remainingRows > 0 && t("common.seeMore", {smart_count: remainingRows})}
            </Text>
        </Box>
    );
};
