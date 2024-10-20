import {Icon, Link} from "@dashdoc/web-ui";
import React from "react";

import {IconLinkProps} from "./types";

export function IconLink({text, iconName, onClick, "data-testid": dataTestId}: IconLinkProps) {
    return (
        <Link onClick={onClick} data-testid={dataTestId}>
            <Icon verticalAlign={"sub"} name={iconName} mr={1} scale={[0.8, 0.8]} />
            {text}
        </Link>
    );
}
