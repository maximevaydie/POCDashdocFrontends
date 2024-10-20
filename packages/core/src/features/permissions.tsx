import {Logger} from "@dashdoc/web-core";
import {LoadingWheel} from "@dashdoc/web-ui";
import {ManagerRole} from "dashdoc-utils";
import React from "react";
import {connect} from "react-redux";

import {getConnectedManager} from "../../../../react/Redux/accountSelector";
import {CommonRootState} from "../../../../react/Redux/types";

import {AccessDeniedScreen} from "./screen/AccessDeniedScreen";

const mapStateToProps = (state: CommonRootState) => {
    const connectedManager = getConnectedManager(state);
    return {
        role: connectedManager?.role,
    };
};

interface StateProps {
    role: ManagerRole | undefined;
}

function permission(allowedRoles: ManagerRole[]) {
    return <T,>(WrappedComponent: React.ComponentType<any>) => {
        function WithPermission(props: StateProps) {
            if (props.role === undefined) {
                return <LoadingWheel />;
            }

            if (allowedRoles.includes(props.role)) {
                return <WrappedComponent {...props} />;
            } else {
                Logger.warn(
                    `User tried to access forbidden page with role ${props.role} (allowed: ${allowedRoles})`
                );
                return <AccessDeniedScreen />;
            }
        }

        return connect<StateProps, undefined, T>(mapStateToProps)(WithPermission);
    };
}

const hasRoleUser = permission([ManagerRole.User, ManagerRole.Admin, ManagerRole.GroupViewAdmin]);
const hasRoleAdmin = permission([ManagerRole.Admin, ManagerRole.GroupViewAdmin]);

export {hasRoleUser, hasRoleAdmin};
