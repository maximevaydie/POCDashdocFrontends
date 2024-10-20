import {
    LoginByTemporaryAuthTokenScreen,
    ManagerTimezoneProvider,
    storeService,
} from "@dashdoc/web-common";
import {BROWSER_TIMEZONE, BuildConstants, setupI18n} from "@dashdoc/web-core";
import {DeviceContextProvider, GlobalStyles, ToastContainer, theme} from "@dashdoc/web-ui";
import {ThemeProvider} from "@emotion/react";
import * as Sentry from "@sentry/browser";
import {createReduxSentryMiddleware} from "dashdoc-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import {Store, applyMiddleware, compose, createStore} from "redux";
import thunkMiddleware from "redux-thunk";

import {setExtendedView} from "app/redux/reducers/extended-view";
import {RootState} from "app/redux/reducers/index";
import {Screens} from "app/screens/Screens";
import {extendedViewService} from "app/services/core/extendedView.service";

import createRootReducer from "./redux/reducers";

const store = createStore(
    createRootReducer(),
    undefined,
    compose(
        import.meta.env.DEV
            ? applyMiddleware(thunkMiddleware)
            : applyMiddleware(
                  thunkMiddleware, // ANCHOR[id=redux-thunk]
                  createReduxSentryMiddleware(Sentry)
              ),
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ && import.meta.env.DEV
            ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
            : (f: any) => f
    )
) as Store<RootState>;
storeService.setStore(store);

// Sync the local storage and the redux store.
const extendedView = extendedViewService.getPersistedExtendedView();
store.dispatch(setExtendedView(extendedView));

console.log("Welcome to Dashdoc TMS"); // eslint-disable-line no-console

function App() {
    return (
        <>
            <GlobalStyles />
            <DeviceContextProvider>
                <ThemeProvider theme={theme}>
                    <Provider store={store as any}>
                        <ManagerTimezoneProvider>
                            <Router>
                                <LoginByTemporaryAuthTokenScreen>
                                    <Screens />
                                    <ToastContainer />
                                </LoginByTemporaryAuthTokenScreen>
                            </Router>
                        </ManagerTimezoneProvider>
                    </Provider>
                </ThemeProvider>
            </DeviceContextProvider>
        </>
    );
}

setupI18n(BuildConstants.language, BROWSER_TIMEZONE).then(() => {
    const dom = document.getElementById("react-app");
    if (dom === null) {
        throw new Error("No element with id 'react-app' found in the DOM.");
    }
    const root = ReactDOM.createRoot(dom);
    root.render(React.createElement(App, null));
});
