import type {SimpleAddress} from "../../types/address";

export type UpdatablePartner = {
    pk: number;
    name: string;
    administrative_address: SimpleAddress;
    notes?: string;
    is_verified?: boolean;
    vat_number?: string;
    invoicing_remote_id?: string;
    can_invite_to: boolean;
};
