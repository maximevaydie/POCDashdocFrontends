import {themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

import {Box} from "../Box";

export const ScrollableTableFixedHeader = styled(Box)(
    themeAwareCss({
        marginTop: 2,
        marginLeft: 3,
        marginRight: 3,
    })
);
