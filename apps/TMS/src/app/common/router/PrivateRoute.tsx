import {isAuthenticated} from "@dashdoc/web-common";
import React, {FunctionComponent} from "react";
import {Redirect, Route, RouteProps} from "react-router-dom";

import {useSelector} from "app/redux/hooks";

type Props = RouteProps & {
    children: React.ReactNode;
    ScreenWrapperComponent: FunctionComponent<React.PropsWithChildren<{}>>;
    fallbackUrl: string;
};

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export function PrivateRoute({children, ScreenWrapperComponent, fallbackUrl, ...rest}: Props) {
    const isAuth = useSelector(isAuthenticated);
    return (
        <Route
            {...rest}
            render={(props) =>
                isAuth ? (
                    <ScreenWrapperComponent>{children}</ScreenWrapperComponent>
                ) : (
                    /**
                     * @guidedtour[epic=auth] Login redirection.
                     * Auto redirect to the login screen when not authenticate.
                     */
                    <Redirect
                        to={{
                            pathname: fallbackUrl,
                            state: {from: props.location},
                        }}
                    />
                )
            }
        />
    );
}
