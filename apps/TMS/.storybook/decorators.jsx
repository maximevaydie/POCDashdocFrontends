import {default as createTmsRootReducer} from "@dashdoc/frontend/app/redux/reducers";
import {storeService} from "@dashdoc/web-common";
import {history} from "@dashdoc/web-core";
import React from "react";
import {Provider} from "react-redux";
import {applyMiddleware, compose, createStore} from "redux";
import thunkMiddleware from "redux-thunk";

export const withReduxStore = (initialState) => {
    const store = createStore(
        createTmsRootReducer(),
        initialState,
        compose(applyMiddleware(thunkMiddleware))
    );
    storeService.setStore(store);
    return (story) => <Provider store={store}>{story()}</Provider>;
};
