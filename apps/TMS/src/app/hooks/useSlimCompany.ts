import type {
    CarrierInTransport,
    PartnerDetailOutput,
    ShipperInTransport,
} from "@dashdoc/web-common";
import {useMemo} from "react";

import type {Company, CountryCode, SlimCompanyForInvitation} from "dashdoc-utils";

export function useSlimCompany(
    company: CarrierInTransport | ShipperInTransport | Company | PartnerDetailOutput | undefined
) {
    const result: SlimCompanyForInvitation | undefined = useMemo(() => {
        if (!company) {
            return undefined;
        }
        if ("administrative_address" in company) {
            return {
                pk: company.pk,
                name: company.name,
                country: company.administrative_address.country as CountryCode,
                can_invite_to: company.can_invite_to,
            };
        } else {
            return {
                pk: company.pk,
                name: company.name,
                country: company.country,
                can_invite_to: company.can_invite_to,
            };
        }
    }, [company]);
    return result;
}
