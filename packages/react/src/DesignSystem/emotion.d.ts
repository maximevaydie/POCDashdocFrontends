import "@emotion/react";
import {theme} from "./theme";

type DashdocTheme = typeof theme;
declare module "@emotion/react" {
    export interface Theme extends DashdocTheme {}
}
