import {Box, BoxProps} from "@dashdoc/web-ui";
import React, {FunctionComponent, ReactElement} from "react";
import {SizeMeProps, withSize} from "react-sizeme";

export type ResponsiveChartContainerProps = BoxProps & {children: ReactElement};

export type ResponsiveChartContainerChildrenProps = {width: number; height: number};

const ResponsiveChartContainerComponent: FunctionComponent<
    ResponsiveChartContainerProps & SizeMeProps
> = ({size: {width, height}, children, ...boxProps}) => (
    <Box height="100%" {...boxProps}>
        {width && height && children
            ? React.cloneElement(children, {
                  width,
                  height,
              })
            : null}
    </Box>
);
export const ResponsiveChartContainer = withSize({monitorHeight: true})(
    ResponsiveChartContainerComponent
);
