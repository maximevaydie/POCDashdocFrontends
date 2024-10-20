import {themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

import {Box} from "../Box";

export const ScrollableTableContainer = styled(Box)(
    themeAwareCss({
        overflowY: "auto",
        overflowX: "hidden",
        paddingLeft: 3,
        paddingRight: 3,
        position: "relative",
    })
);
