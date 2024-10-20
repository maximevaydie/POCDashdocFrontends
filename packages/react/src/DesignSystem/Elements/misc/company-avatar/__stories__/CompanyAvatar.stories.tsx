import {Flex} from "@dashdoc/web-ui";
import {Meta} from "@storybook/react/types-6-0";
import React from "react";

import {CompanyAvatarProps, CompanyAvatar as Component} from "../CompanyAvatar";

export default {
    title: "Web UI/misc/CompanyAvatar",
    component: Component,
    args: {
        title: "Chuck Transport",
        logo: "https://www.seekpng.com/png/full/110-1104356_chuck-norris-wall-sticker-chuck-norris-png.png",
    },
    backgrounds: {default: "white"},
} as Meta;

export const TextAvatars = () => {
    const propsArray: CompanyAvatarProps[] = [
        {
            name: "JPB",
            size: "medium",
        },
        {
            name: "DSD Fret",
            size: "large",
        },
        {
            name: "Transport Johnny",
            size: "xlarge",
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

export const LogoAvatars = () => {
    const propsArray: CompanyAvatarProps[] = [
        {
            name: "JPB",
            logo: "https://placekitten.com/200/150",
        },
        {
            name: "DSD Fret",
            logo: "https://placekitten.com/100/400",
            size: "large",
        },
        {
            name: "Transport Johnny",
            logo: "https://placekitten.com/400/400",
            size: "xlarge",
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
