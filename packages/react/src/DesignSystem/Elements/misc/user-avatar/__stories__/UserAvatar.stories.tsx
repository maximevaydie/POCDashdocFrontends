import {Flex} from "@dashdoc/web-ui";
import {Meta} from "@storybook/react/types-6-0";
import React from "react";

import {UserAvatar as Component, UserAvatarProps} from "../UserAvatar";

export default {
    title: "Web UI/misc/UserAvatar",
    component: Component,
    args: {
        name: "Michael Jackson",
        picture:
            "https://www.seekpng.com/png/full/110-1104356_chuck-norris-wall-sticker-chuck-norris-png.png",
    },
    backgrounds: {default: "white"},
} as Meta;

export const TextAvatars = () => {
    const propsArray: UserAvatarProps[] = [
        {
            name: "Jean Mich",
            size: "xsmall",
        },
        {
            name: "Chuck Bob",
            size: "small",
        },
        {
            name: "Johnny Ray",
            size: "medium",
        },
        {
            name: "Roy Orbison",
            size: "large",
        },
    ];

    return (
        <Flex style={{gap: "50px"}} alignItems="center">
            {propsArray.map((props, i) => (
                <Component {...props} key={i} mb={5} />
            ))}
        </Flex>
    );
};

export const PictureAvatars = () => {
    const propsArray: UserAvatarProps[] = [
        {
            name: "Jean Mich",
            size: "xsmall",
            picture: "https://placekitten.com/150/150",
        },
        {
            name: "Chuck Bob",
            picture:
                "https://www.seekpng.com/png/full/110-1104356_chuck-norris-wall-sticker-chuck-norris-png.png",
            size: "small",
        },
        {
            name: "JPB",
            picture: "https://placekitten.com/200/300",
            size: "medium",
        },
        {
            name: "JPB",
            picture: "https://placekitten.com/400/400",
            size: "large",
        },
        {
            name: "Johnny Ray",
            picture: "https://placekitten.com/200/100",
            size: "medium",
        },
        {
            name: "Perfect Size",
            picture: "https://placekitten.com/50/50",
            size: "medium",
        },

        {
            name: "Smally small",
            picture: "https://placekitten.com/20/20",
            size: "medium",
        },
    ];

    return (
        <Flex style={{gap: "50px"}} alignItems="center">
            {propsArray.map((props, i) => (
                <Component {...props} key={i} mb={5} />
            ))}
        </Flex>
    );
};
