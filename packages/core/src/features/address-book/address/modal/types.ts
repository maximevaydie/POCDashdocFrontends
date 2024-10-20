import {AddressPayload} from "dashdoc-utils";

import type {AddressTypesOptions} from "../types";

export type AddressForm = AddressPayload & {
    securityProtocolFile?: File | null;
    flowUrl?: string;
    addressTypes: AddressTypesOptions;
};
