import {FeatureFlags} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router";

import {useFeatureFlags} from "../../hooks/useFeatureFlag";
import {NotFoundScreen} from "../screen/NotFoundScreen";

interface FeatureFlagProps {
    children: React.ReactNode;
    // The feature flags (FF) identifier
    flagName: FeatureFlags | FeatureFlags[];
    anyFF?: boolean;
}

/**
 * Wrapper to show children according to the feature flags enable.
 */
export function HasFeatureFlag({children, flagName, anyFF}: FeatureFlagProps) {
    const hasFeatureFlags = useFeatureFlags(flagName, anyFF);
    if (hasFeatureFlags) {
        return <>{children}</>;
    }
    return null;
}

/**
 * Wrapper to show children according to the feature flags disable.
 */
export function HasNotFeatureFlag({children, flagName, anyFF}: FeatureFlagProps) {
    const hasFeatureFlags = useFeatureFlags(flagName, anyFF);
    if (!hasFeatureFlags) {
        return <>{children}</>;
    }
    return null;
}

type RouteFeatureFlagProps = RouteProps & {
    // The feature flags (FF) identifier
    flagName: FeatureFlags | FeatureFlags[];
    anyFF?: boolean;
} & (
        | {component: NonNullable<RouteProps["component"]>}
        | {render: NonNullable<RouteProps["render"]>}
    );

/**
 * Route when the feature flag is enabled or NotFound otherwise.
 * Redirect to `redirect` if not undefined.
 */
export const RouteFeatureFlag: FunctionComponent<
    RouteFeatureFlagProps & {redirectIfFFDisabled?: string}
> = ({flagName, redirectIfFFDisabled, component, render, anyFF, ...others}) => {
    const hasFeatureFlags = useFeatureFlags(flagName, anyFF);
    const renderOverride = (props: RouteComponentProps) => {
        if (hasFeatureFlags) {
            if (component) {
                const PropComponent = component;
                return <PropComponent {...props} />;
            } else if (render) {
                return render(props);
            } else {
                throw new Error("RouteFeatureFlag: component or render must be defined"); // shouldn't happen because of typing
            }
        } else if (redirectIfFFDisabled !== undefined) {
            return <Redirect to={redirectIfFFDisabled} />;
        } else {
            return <NotFoundScreen />;
        }
    };
    return <Route {...others} render={renderOverride} />;
};

/**
 * Route when the feature flag is disabled or NotFound otherwise.
 * Redirect to `redirect` if not undefined.
 */
export const RouteNotFeatureFlag: FunctionComponent<
    RouteFeatureFlagProps & {redirectIfFFEnabled?: string}
> = ({flagName, redirectIfFFEnabled, component, ...others}) => {
    const PropComponent = component;
    const hasFeatureFlags = useFeatureFlags(flagName);
    const render = (props: RouteComponentProps) => {
        if (!hasFeatureFlags) {
            // @ts-ignore
            return <PropComponent {...props} />;
        } else if (redirectIfFFEnabled !== undefined) {
            return <Redirect to={redirectIfFFEnabled} />;
        } else {
            return <NotFoundScreen />;
        }
    };

    return <Route {...others} render={render} />;
};
