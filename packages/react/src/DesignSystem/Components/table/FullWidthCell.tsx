import React, {FunctionComponent} from "react";

import {Box, BoxProps} from "../../layout/Box";

export type FullWidthCellProps = BoxProps & {colSpan: number};

export const FullWidthCell: FunctionComponent<FullWidthCellProps> = (props) => (
    <Box as="tr">
        <Box as="td" p={0} {...props} />
    </Box>
);
