import React, {FunctionComponent} from "react";

import {Box} from "../../layout/Box";
import {LoadingWheel} from "../loading";

export type ListLoadingComponentProps = {};

export const ListLoadingComponent: FunctionComponent<ListLoadingComponentProps> = () => (
    <Box py={3} data-testid="table-loading">
        <LoadingWheel noMargin={true} small={true} />
    </Box>
);
