import {TestProps} from "@dashdoc/web-core";

export type ClickableUpdateRegionStyleProps = {updateButtonLabel?: string};

export interface ClickableUpdateRegionProps extends TestProps {
    clickable: boolean;
    updateButtonLabel?: string;
    onClick?: () => void;
    children: React.ReactNode;
}
