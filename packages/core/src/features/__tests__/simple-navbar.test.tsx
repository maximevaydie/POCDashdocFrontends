import {itRendersCorrectlyWith} from "@dashdoc/web-core/src/testing";
import React from "react";
import {Provider} from "react-redux";
import {createStore, combineReducers} from "redux";

import {accountReducer} from "../../../../../react/Redux/reducers/accountReducer";
import {authReducer} from "../../../../../react/Redux/reducers/authReducer";
import {realtimeReducer} from "../../../../../react/Redux/reducers/realtime.slice";
import {CommonRootState} from "../../../../../react/Redux/types";
import {SimpleNavbar} from "../navbar/SimpleNavbar";

describe("SimpleNavbar", () => {
    const appReducer = combineReducers<CommonRootState>({
        auth: authReducer,
        account: accountReducer,
        realtime: realtimeReducer,
    });
    const store = createStore(appReducer);
    itRendersCorrectlyWith(
        "default",
        <Provider store={store as any}>
            <SimpleNavbar />
        </Provider>
    );
});
