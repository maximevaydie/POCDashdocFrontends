import {BuildConstants} from "@dashdoc/web-core";
import {Image} from "@dashdoc/web-ui";
import React from "react";

interface Props {
    [key: string]: any;
    src: string;
}

export function StaticImage({src, ...props}: Props) {
    return <Image {...props} src={`${BuildConstants.staticUrl}img/${src}`} />;
}
