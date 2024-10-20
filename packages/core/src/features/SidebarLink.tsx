import {IconProps} from "@dashdoc/web-ui";
import {PaneButtonGroupItem} from "@dashdoc/web-ui";
import React from "react";
import {useLocation} from "react-router";

type SidebarLinkProps = {
    id: string;
    icon: IconProps["name"];
    path: string;
    onLinkClick: (path: string) => void;
    label: string;
    "data-testid"?: string;
};

export const SidebarLink = ({
    id,
    icon,
    onLinkClick,
    path,
    label,
    ...otherProps
}: SidebarLinkProps) => {
    const location = useLocation();
    const isActive = location.pathname.includes(path.split("/")[0]);

    return (
        <PaneButtonGroupItem
            id={id}
            onClick={onLinkClick.bind(null, path)}
            active={isActive}
            data-testid={otherProps["data-testid"]}
            icon={icon}
            label={label}
        />
    );
};
