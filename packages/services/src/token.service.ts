import {Logger} from "@dashdoc/web-core";
import {Token} from "dashdoc-utils/dist/api/scopes/authentification";

export const LOCAL_STORAGE_TOKEN_KEY = "token";

function getPersistedToken(): Token | null {
    let result: Token | null = null;
    let access: string | undefined, refresh: string | undefined;
    try {
        const tokenInLocalStorage = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
        if (tokenInLocalStorage) {
            const token = JSON.parse(tokenInLocalStorage);
            access = token.access;
            refresh = token.refresh;
            if (access && refresh) {
                result = {access, refresh};
            }
        }
    } catch (e) {
        Logger.error("Error while parsing token", e);
    }
    return result;
}

function persistToken(token: Token | null) {
    if (token) {
        window.localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, JSON.stringify(token));
    } else {
        window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
}

export const tokenService = {
    getPersistedToken,
    persistToken,
};
