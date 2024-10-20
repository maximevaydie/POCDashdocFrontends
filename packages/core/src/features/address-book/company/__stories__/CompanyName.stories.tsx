import React from "react";

import {CompanyName} from "../CompanyName";

export default {
    title: "app/features/company/CompanyName", // TODO rename to common/features/company/CompanyName
    component: CompanyName,
};

export const NotVerifiedCompany = () => (
    <CompanyName company={{name: "Dashdoc", is_verified: false}} />
);

export const VerifiedCompany = () => (
    <CompanyName company={{name: "Dashdoc", is_verified: true}} />
);

export const NotVerifiedCompanyHighlighted = () => (
    <CompanyName company={{name: "Dashdoc", is_verified: false}} highlight={["Dash"]} />
);

export const VerifiedCompanyHighlighted = () => (
    <CompanyName company={{name: "Dashdoc", is_verified: true}} highlight={["doc"]} />
);

export const VerifiedCompanyWithTooltip = () => (
    <CompanyName company={{name: "Dashdoc", is_verified: true}} tooltip />
);

export const NotVerifiedCompanyWithTooltip = () => (
    <CompanyName company={{name: "Dashdoc", is_verified: false}} tooltip />
);

export const VerifiedCompanyInHeader = () => (
    <h5>
        <CompanyName company={{name: "Dashdoc", is_verified: true}} />
    </h5>
);

export const VerifiedCompanyInBold = () => (
    <b>
        <CompanyName company={{name: "Dashdoc", is_verified: true}} />
    </b>
);
