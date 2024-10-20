import React, {FunctionComponent} from "react";

import {Text} from "../../Text";
import {Box} from "../../../Elements/layout/Box";

type ErrorMessageProps = {error: string; "data-testid"?: string};

export const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({error, ...props}) => (
    <Box px={3} py={2}>
        <Text variant="caption" color="red.default" {...props}>
            {error}
        </Text>
    </Box>
);
