import {Box} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

function TrackingContactsPanel({children}: {children: ReactNode}) {
    return (
        <Box borderWidth={1} paddingX={3} mb={3} borderStyle="solid" borderColor="grey.light">
            {children}
        </Box>
    );
}

export default TrackingContactsPanel;
