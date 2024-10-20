import React from "react";

import {Text} from "@dashdoc/web-ui";

/**
 * Reusable span with an asterisk to indicate a required thing.
 */
export const Required = () => (
    <Text color="blue.default" as="span" ml={1}>
        {"*"}
    </Text>
);
