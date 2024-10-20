import {TestProps} from "@dashdoc/web-core";

import {BoxProps} from "../../Elements/layout/Box";
import {IconNames} from "../icon";

export type LinkProps = BoxProps;

export interface IconLinkProps extends TestProps {
    text: string;
    iconName: IconNames;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}
