import {CommonRootState} from "./types";
import {createSelector} from "./utils";

const getTokenSelector = ({auth: {token}}: CommonRootState) => token;

/**
 * @guidedtour[epic=auth] isAuthenticated state
 * We consider the user authenticated if he has an `access token`.
 * The token could be expired, but we don't care here.
 * Indeed, we have a callback to refresh the token in the API (and in the apiService wrapper).
 *
 * - When the token is expired,
 *   the API detects this state thanks to the exp props (from `PerishableToken`) and try to refresh it.
 *   Then the API calls the setToken callback with a new `access token` and we store it!
 *
 * - When the token is invalid or cannot be refreshed for any reason,
 *   the API calls the onError callback with a 401 statusCode.
 *   Then a logout action will be dispatched to clear the store and asking for a new auth flow.
 */
export const isAuthenticated = createSelector(getTokenSelector, (token) => !!token?.access);
