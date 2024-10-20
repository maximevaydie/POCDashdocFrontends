import {Box, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const PublicScreenContent = styled(Box)(
    themeAwareCss({
        maxWidth: "1170px",
        marginRight: "auto",
        marginLeft: "auto",
        paddingTop: "50px",
    })
);
