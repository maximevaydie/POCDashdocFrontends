import {Box, renderInModalPortal, theme} from "@dashdoc/web-ui";
import {ThemeProvider} from "@emotion/react";
import React, {ReactNode} from "react";
import {renderToStaticMarkup} from "react-dom/server";

/**
 * emotion style does not work when using renderToString or renderToStaticMarkup in React18
 * You need to insert the component in the DOM to get the styles applied (in a hidden location).
 * https://github.com/emotion-js/emotion/issues/2906
 */
export function useHackForEmotionStyle(customIcon: ReactNode) {
    const html = renderToStaticMarkup(<ThemeProvider theme={theme}>{customIcon}</ThemeProvider>);
    const hiddenJsx = renderInModalPortal(<Box display="none">{customIcon}</Box>);
    return {
        hiddenJsx,
        html,
    };
}
