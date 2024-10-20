import {Box} from "@dashdoc/web-ui";
import {Flex} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {WidgetProps} from "./Widget";

export const Widgets: FunctionComponent<{
    children: React.ReactElement<WidgetProps> | React.ReactElement<WidgetProps>[];
}> = ({children}) => {
    const childrenArray = React.Children.toArray(children);
    return (
        <Flex flexWrap="wrap">
            {childrenArray.map((child, i) => (
                <Box key={i} width="500px" mr={3} pb={3} flexGrow="1">
                    {child}
                </Box>
            ))}
            {/* hack to keep a common width on the last line. We create some fake widget locations */}
            {Array.from({length: 3}, (_, i) => (
                <Box key={`_${i}`} width="500px" mr={3} flexGrow="1"></Box>
            ))}
        </Flex>
    );
};
