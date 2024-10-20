import {Token} from "dashdoc-utils/dist/api/scopes/authentification";

export type PerishableToken = Token & {exp: number};
