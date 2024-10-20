import {NotFoundScreen, useBaseUrl} from "@dashdoc/web-common";
import {FullHeightMinWidthScreen, LoadingWheel} from "@dashdoc/web-ui";
import React from "react";
import {RouteComponentProps, useHistory, useLocation, useParams} from "react-router";

import {PartnerDetails} from "app/features/address-book/partner/PartnerDetails";
import {LINK_PARTNERS} from "app/features/sidebar/constants";

import {usePartner} from "./hooks/usePartner";

export type CompanyScreenProps = Partial<RouteComponentProps<{pk: string}>>;

type Params = {
    pk: string;
};

export function PartnerScreen() {
    const {pk} = useParams<Params>();
    const location = useLocation();
    const history = useHistory();
    const baseUrl = useBaseUrl();
    const tab = new URLSearchParams(location.search).get("tab");
    const tabTemplateSelected = tab === "shipper-template";
    const {loading, partner} = usePartner(parseInt(pk));

    if (loading) {
        return <LoadingWheel />;
    }
    if (!partner) {
        return <NotFoundScreen />;
    }
    return (
        <FullHeightMinWidthScreen>
            <PartnerDetails
                partner={partner}
                tabTemplateSelected={tabTemplateSelected}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />
        </FullHeightMinWidthScreen>
    );

    function handleDelete() {
        history.push({
            pathname: baseUrl + LINK_PARTNERS,
        });
    }

    function handleUpdate() {
        // nothing to do
    }
}
