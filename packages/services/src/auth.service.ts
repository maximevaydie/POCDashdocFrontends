import {Logger} from "@dashdoc/web-core";
import {Token} from "dashdoc-utils/dist/api/scopes/authentification";
import decodeToken, {JwtPayload} from "jwt-decode";
import isEqual from "lodash.isequal";

import {resetReduxState} from "../redux/actions/reset";
import {loadAccount} from "../redux/reducers/accountReducer";
import {setToken} from "../redux/reducers/authReducer";
import {analyticsService} from "../services/analytics/analytics.service";
import {apiService} from "../services/api.service";
import {helpService} from "../services/help.service";
import {monitoringService} from "../services/monitoring.service";

import {storeService} from "./store.service";
import {tokenService} from "./token.service";

import type {PerishableToken} from "../types/auth";

function toPerishableToken(token: Token): PerishableToken | null {
    try {
        const {access, refresh} = token;
        if (access && refresh) {
            const payload = decodeToken<JwtPayload>(access);
            const exp = payload.exp;
            if (exp) {
                const result: PerishableToken = {access, refresh, exp};
                return result;
            }
        }
    } catch (e) {
        Logger.error("Error while converting token in perishableToken", e);
    }
    return null;
}

function setAuthToken(token: Token) {
    const perishableToken = toPerishableToken(token);
    if (perishableToken) {
        tokenService.persistToken(token);
        const dispatch = storeService.getDispatch();
        dispatch(setToken(perishableToken));
    } else {
        tokenService.persistToken(null);
    }
}

/**
 * @guidedtour[epic=auth] Login by form
 * User login from the standard form.
 */
async function loginByForm(data: {username: string; password: string}) {
    const token = await apiService.Auth.login({data});
    setAuthToken(token);
    const dispatch = storeService.getDispatch();
    dispatch(loadAccount() as any);
}

/**
 * @guidedtour[epic=auth] Login by code
 * From an temporary_auth_token.
 */
async function loginByCode(code: string | null) {
    if (code) {
        const token = await apiService.Auth.loginByCode({
            data: {code, type: "manager-code"},
        });
        setAuthToken(token);
        const dispatch = storeService.getDispatch();
        dispatch(loadAccount() as any);
    }
}

/**
 * @guidedtour[epic=auth] Login by moderation token
 * When a staff user want to log in a company account.
 */
async function loginByModerationToken(moderationToken: string | null) {
    if (moderationToken) {
        const token = await apiService.Auth.loginByModerationToken({
            data: {moderation_token: moderationToken},
        });
        setAuthToken(token);
        const dispatch = storeService.getDispatch();
        dispatch(loadAccount() as any);
    }
}

/**
 * @guidedtour[epic=auth] Another browser tab refresh the token
 * updates the token from the new local storage value.
 * Potentially, we could logout the user!
 */
async function localStorageSync() {
    const token = tokenService.getPersistedToken();
    const storeToken = storeService.getState().auth.token;
    if (!isEqual(token?.access, storeToken?.access)) {
        // The local storage changed!
        if (token) {
            setAuthToken(token);
        } else {
            authService.logout();
        }
    }
}

/**
 * @guidedtour[epic=auth] Logout.
 * We clear the local storage and reset the redux state!
 */
function logout() {
    tokenService.persistToken(null);
    //realtimeService.cleanup(); //TODO the realtime service is not yet generic enough to be used here
    monitoringService.cleanup();
    helpService.cleanup();
    analyticsService.cleanup();
    if (storeService.getState().auth.token?.access) {
        const dispatch = storeService.getDispatch();
        // Reset redux state to its initial state
        // (else we still have entities in state at next login
        // and they may be related to another account)
        dispatch(resetReduxState());
    }
}

function setPublicTokenForRestrictedDashdocAPIAccess(publicToken: string) {
    apiService.options.tokenPrefix = "PublicToken ";
    apiService.options.getToken = () => {
        return {access: publicToken, refresh: ""};
    };
}

export const authService = {
    setAuthToken,
    loginByForm,
    loginByCode,
    loginByModerationToken,
    logout,
    localStorageSync,
    setPublicTokenForRestrictedDashdocAPIAccess,
};
