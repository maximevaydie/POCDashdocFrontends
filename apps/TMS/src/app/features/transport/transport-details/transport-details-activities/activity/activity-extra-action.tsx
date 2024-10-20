import {TestProps} from "@dashdoc/web-core";
import {Icon, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {ComponentProps} from "react";

const ActivityActionStyle = styled("div")(
    themeAwareCss({
        color: "blue.default",
        position: "relative",
        padding: 1,
        marginLeft: -1,
        marginRight: -1,
        fontSize: 1,
        cursor: "pointer",
        "&:hover": {
            backgroundColor: "grey.light",
        },
    })
);

interface ActivityActionProps extends TestProps {
    onClick?: () => void;
    children: React.ReactNode;
    iconName?: ComponentProps<typeof Icon>["name"];
    iconColor?: string;
}

const ActivityExtraAction = function (props: ActivityActionProps) {
    const iconName = props.iconName || "openInNewTab";
    return (
        <ActivityActionStyle onClick={props.onClick} data-testid={props["data-testid"]}>
            <Icon name={iconName} color={props.iconColor} />
            <span style={{marginLeft: "5px"}}>{props.children}</span>
        </ActivityActionStyle>
    );
};

export default ActivityExtraAction;
