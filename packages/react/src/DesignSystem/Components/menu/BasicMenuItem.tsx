import React, {ReactNode} from "react";

import {Flex} from "../../Elements/layout/Flex";
import {Icon, IconNames} from "../icon";
import {Text} from "../Text";

const allSeverities = {
    danger: {
        color: "red.default",
    },
};

export type BasicMenuItemProps = {
    icon?: IconNames;
    iconColor?: string;
    label: ReactNode;
    isLink?: boolean;
    severity?: keyof typeof allSeverities;
    withSubMenuArrow?: boolean;
};

export const BasicMenuItem = ({
    label,
    icon,
    severity,
    isLink,
    iconColor,
    withSubMenuArrow,
}: BasicMenuItemProps) => {
    return (
        <Flex justifyContent={"space-between"} width="100%">
            <Flex alignItems="center" width="100%">
                {icon && (
                    <Icon
                        name={icon}
                        mr={3}
                        color={
                            severity
                                ? allSeverities[severity].color
                                : iconColor
                                  ? iconColor
                                  : "grey.dark"
                        }
                    />
                )}
                {typeof label === "string" ? (
                    <Text color={severity ? allSeverities[severity].color : undefined}>
                        {label}
                    </Text>
                ) : (
                    label
                )}
            </Flex>
            {isLink && (
                <Icon
                    name="openInNewTab"
                    color={severity ? allSeverities[severity].color : "grey.dark"}
                />
            )}
            {withSubMenuArrow && (
                <Icon
                    name="arrowRight"
                    color={severity ? allSeverities[severity].color : "grey.dark"}
                />
            )}
        </Flex>
    );
};
