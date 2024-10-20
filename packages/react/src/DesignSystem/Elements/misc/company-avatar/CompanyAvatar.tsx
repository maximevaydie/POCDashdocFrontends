import {TextProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {Image, ImageProps} from "@dashdoc/web-ui";

import {TextBasedIcon} from "../../base/text-based-icon";

const sizes = {
    medium: {length: "40px", fontSize: "17px"},
    large: {length: "70px", fontSize: "30px"},
    xlarge: {length: "120px", fontSize: "70px"},
};

export type CompanyAvatarProps = Omit<ImageProps, "size"> & {
    name: string;
    logo?: string;
    size?: keyof typeof sizes;
    fontSize?: TextProps["fontSize"];
};

export const CompanyAvatar: FunctionComponent<CompanyAvatarProps> = ({
    name,
    logo,
    size = "medium",
}) => {
    if (logo) {
        return (
            <Image
                src={logo}
                alt={name}
                maxWidth={sizes[size].length}
                maxHeight={sizes[size].length}
                verticalAlign="unset"
            />
        );
    } else {
        return (
            <TextBasedIcon
                title={name}
                size={sizes[size].length}
                textProps={{fontSize: sizes[size].fontSize}}
            />
        );
    }
};
