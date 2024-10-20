import {t} from "@dashdoc/web-core";
import React from "react";
import {Link} from "react-router-dom";

import {useBaseUrl} from "../../../hooks/useBaseUrl";
import {companyService} from "../company/company.service";
import {NO_COMPANY_VALUE} from "../company/constants";

type Props = {
    pk: number;
    children?: React.ReactNode;
    "data-testid"?: string;
};

/**
 * Open a new tab to the partner company page.
 */
export function PartnerLink({pk, children, ...props}: Props) {
    const baseUrl = useBaseUrl();
    if (pk === NO_COMPANY_VALUE) {
        return null;
    }
    return (
        <Link
            to={companyService.getPartnerLink(baseUrl, pk)}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        >
            {children ?? t("component.goToCompany")}
        </Link>
    );
}
