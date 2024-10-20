import {Callout, CalloutProps} from "@dashdoc/web-ui";
import React from "react";

export function CustomCallout(props: CalloutProps) {
    return (
        <Callout
            variant="neutral"
            iconDisabled
            border="1px solid"
            borderColor="grey.light"
            {...props}
        />
    );
}
