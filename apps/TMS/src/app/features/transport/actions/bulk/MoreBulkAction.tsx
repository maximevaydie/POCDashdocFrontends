import {ClickableFlex, NoWrap, Icon, ClickableFlexProps, IconProps} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import React from "react";

export function MoreBulkAction({
    iconName,
    label,
    onClick,
    separateAbove,
    separateBelow,
    color,
    ...props
}: ClickableFlexProps & {
    iconName: IconProps["name"];
    label: string;
    onClick: () => void;
    separateAbove?: boolean;
    separateBelow?: boolean;
    color?: string;
}) {
    return (
        <>
            {separateAbove && <HorizontalLine width="80%" my={0} />}
            <ClickableFlex
                py={3}
                px={4}
                color={color ?? "grey.ultradark"}
                onClick={onClick}
                {...props}
            >
                <Icon mr={2} name={iconName} />
                <NoWrap>{label}</NoWrap>
            </ClickableFlex>
            {separateBelow && <HorizontalLine width="80%" my={0} />}
        </>
    );
}
