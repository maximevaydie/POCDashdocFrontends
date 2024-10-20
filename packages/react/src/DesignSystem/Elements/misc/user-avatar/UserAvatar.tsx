import React, {FunctionComponent} from "react";

import {Image, ImageProps, TextProps, TextBasedIcon} from "@dashdoc/web-ui";

const sizes = {
    xsmall: {length: "24px", fontSize: 1},
    small: {length: "32px", fontSize: 2},
    medium: {length: "40px", fontSize: "17px"},
    large: {length: "70px", fontSize: "30px"},
};

export type UserAvatarProps = Omit<ImageProps, "size"> & {
    name: string;
    picture?: string | null;
    size?: keyof typeof sizes;
    fontSize?: TextProps["fontSize"];
};

export const UserAvatar: FunctionComponent<UserAvatarProps> = ({
    name,
    picture,
    size = "medium",
}) => {
    if (picture) {
        return (
            <Image
                src={picture}
                alt={name}
                width={sizes[size].length}
                height={sizes[size].length}
                verticalAlign="unset"
                boxShadow="large"
                borderRadius={"100%"}
                style={{objectFit: "cover"}}
            />
        );
    } else {
        return (
            <TextBasedIcon
                title={name}
                size={sizes[size].length}
                boxProps={{boxShadow: "large"}}
                textProps={{fontSize: sizes[size].fontSize}}
            />
        );
    }
};
