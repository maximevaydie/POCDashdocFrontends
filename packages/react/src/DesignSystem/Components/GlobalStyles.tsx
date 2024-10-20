import {css, Global} from "@emotion/react";
import React from "react";

export function GlobalStyles() {
    return (
        <Global
            styles={css`
                html {
                    height: 100%;
                }

                body,
                #react-app {
                    height: 100%;
                    overflow: hidden; /* makes the body non-scrollable */
                    margin: 0px;
                }

                .app-container-fluid {
                    max-width: 1170px;
                }
            `}
        />
    );
}
