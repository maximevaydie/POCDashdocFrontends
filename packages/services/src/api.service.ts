import {Api as API} from "dashdoc-utils";
import {Token} from "dashdoc-utils/dist/api/scopes/authentification";

import {Reports} from "./api-scopes/reportsApiScope";
import {authService} from "./auth.service";
import {storeService} from "./store.service";

/**
 * @guidedtour[epic=auth] Refresh triggered by the API
 * When the expiration date is reached, the API will refresh the token.
 */
function setToken(token: Token) {
    authService.setAuthToken(token);
}

/**
 * Boilerplate to give the token to the API from the redux store.
 */
function getToken(): Partial<Token> & {exp?: number} {
    const token = storeService.getState().auth.token;
    return token ?? {};
}

/**
 * @guidedtour[epic=auth] Logout triggered by the API
 * When the refresh token is invalid, the API will throw an error,
 * we decide to logout when a 401 happen.
 */
function onError(error: any) {
    if (error?.status === 401) {
        authService.logout();
    }
    // throw for the call to handle the error locally
    throw error;
}

const Api = new API({
    host: import.meta.env.VITE_API_HOST || window.location.origin,
    tokenPrefix: "JWT ",
    getToken,
    setToken,
    onError,
});

export const apiService = {
    ...Api,
    Reports: new Reports(Api.options),
};
