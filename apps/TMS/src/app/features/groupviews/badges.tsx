import {t} from "@dashdoc/web-core";
import {Badge, Icon, BadgeProps as BadgeProps} from "@dashdoc/web-ui";
import {ManagerRole} from "dashdoc-utils";
import React from "react";
import {FC} from "react";

type Props = Omit<BadgeProps, "backgroundColor"> & {
    role: ManagerRole.GroupViewAdmin | ManagerRole.Admin | ManagerRole.User | ManagerRole.ReadOnly;
    companyName?: string;
};

export const ManagerRoleBadge: FC<Props> = ({role, companyName, ...props}) => {
    switch (role) {
        case ManagerRole.GroupViewAdmin:
            return (
                <Badge variant="warning" {...props}>
                    {t("settings.groupAdminRole")} &nbsp;
                    <Icon name="crown" />
                </Badge>
            );
        case ManagerRole.Admin:
            return (
                <Badge variant="success" {...props}>
                    {companyName} &nbsp;
                    <Icon name="star" />
                </Badge>
            );
        case ManagerRole.User:
            return (
                <Badge variant="blueDark" {...props}>
                    {companyName} &nbsp;
                    <Icon name="edit" />
                </Badge>
            );
        case ManagerRole.ReadOnly:
            return (
                <Badge variant="neutral" {...props}>
                    {companyName} &nbsp;
                    <Icon name="eye" />
                </Badge>
            );
    }
};
