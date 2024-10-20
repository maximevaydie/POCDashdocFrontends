import {apiService} from "@dashdoc/web-common";
import type {
    CarrierInListOutput,
    CarrierInTransport,
    PartnerCategory,
    PartnerInListOutput,
    ShipperInTransport,
} from "@dashdoc/web-common/src/types/partnerTypes";
import {queryService} from "@dashdoc/web-core";

import type {Company} from "dashdoc-utils";
import type {Response} from "react-select-async-paginate";

export async function searchCarriers(
    input: string,
    page: number
): Promise<Response<CarrierInListOutput, {page: number}>> {
    const params: {
        [key: string]: any;
    } = {
        query: input,
        ordering: "-last_used_carrier",
        page: page,
    };

    const queryString = `?${queryService.toQueryString(params)}`;

    const response: {results: CarrierInListOutput[]; next: string | null} = await apiService.get(
        `/carrier-partners/${queryString}`,
        {apiVersion: "web"}
    );
    return {
        options: response.results,
        hasMore: !!response.next,
        additional: {page: page + 1},
    };
}

export async function searchShippers(
    input: string,
    page: number
): Promise<Response<PartnerInListOutput, {page: number}>> {
    const params: {
        [key: string]: any;
    } = {
        query: input,
        ordering: "-last_used_shipper",
        page: page,
    };
    const categories: PartnerCategory[] = ["shipper"];
    if (categories.length >= 1) {
        params["role__in"] = categories.join(",");
    }

    const queryString = `?${queryService.toQueryString(params)}`;

    const response: {results: PartnerInListOutput[]; next: string | null} = await apiService.get(
        `/partners/${queryString}`,
        {apiVersion: "web"}
    );
    return {
        options: response.results,
        hasMore: !!response.next,
        additional: {page: page + 1},
    };
}

export function fromCompanyToCarrierInTransport(company: Company): CarrierInTransport {
    let invitation_status: "invited" | "not_invited" | "registered" = "not_invited";
    if (company.has_loggable_managers) {
        invitation_status = "registered";
    } else if (company.has_pending_invites) {
        invitation_status = "invited";
    }
    const {
        pk,
        name,
        primary_address,
        notes,
        is_verified,
        vat_number,
        account_code,
        invoicing_remote_id,
        remote_id,
        side_account_code,
        can_invite_to,
        settings,
    } = company;
    return {
        pk: pk,
        name: name,
        administrative_address: {
            pk: primary_address?.pk ?? -1,
            address: primary_address?.address ?? "",
            city: primary_address?.city ?? "",
            postcode: primary_address?.postcode ?? "",
            country: primary_address?.country ?? "",
            latitude: primary_address?.latitude ?? 0,
            longitude: primary_address?.longitude ?? 0,
        },
        notes: notes,
        is_verified: is_verified ?? false,
        vat_number: vat_number ?? "",
        account_code: account_code ?? "",
        invitation_status,
        invoicing_remote_id: invoicing_remote_id ?? "",
        remote_id: remote_id ?? "",
        side_account_code: side_account_code ?? "",
        can_invite_to: can_invite_to ?? false,
        enforce_qualimat_standard: settings?.enforce_qualimat_standard ?? false,
    };
}

export function fromCompanyToShipperInTransport(company: Company): ShipperInTransport {
    let invitation_status: "invited" | "not_invited" | "registered" = "not_invited";
    if (company.has_loggable_managers) {
        invitation_status = "registered";
    } else if (company.has_pending_invites) {
        invitation_status = "invited";
    }
    const {
        pk,
        name,
        primary_address,
        notes,
        is_verified,
        vat_number,
        account_code,
        invoicing_remote_id,
        remote_id,
        side_account_code,
        can_invite_to,
    } = company;
    return {
        pk: pk,
        name: name,
        administrative_address: {
            pk: primary_address?.pk ?? -1,
            address: primary_address?.address ?? "",
            city: primary_address?.city ?? "",
            postcode: primary_address?.postcode ?? "",
            country: primary_address?.country ?? "",
            latitude: primary_address?.latitude ?? 0,
            longitude: primary_address?.longitude ?? 0,
        },
        notes: notes,
        is_verified: is_verified ?? false,
        vat_number: vat_number ?? "",
        account_code: account_code ?? "",
        invitation_status,
        invoicing_remote_id: invoicing_remote_id ?? "",
        remote_id: remote_id ?? "",
        side_account_code: side_account_code ?? "",
        can_invite_to: can_invite_to ?? false,
    };
}

export const partnerService = {
    searchCarriers,
    searchShippers,
    fromCompanyToCarrierInTransport,
    fromCompanyToShipperInTransport,
};
