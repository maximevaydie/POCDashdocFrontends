import {BackgroundProps, BorderProps, BackgroundColorProps} from "styled-system";

export type SupportedStyles = Pick<BorderProps, "border" | "borderRadius"> &
    Pick<BackgroundProps, "background"> &
    Pick<BackgroundColorProps, "backgroundColor">;
