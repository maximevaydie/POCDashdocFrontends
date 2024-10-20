import {toast} from "@dashdoc/web-ui";
import {DeprecatedIcon} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {Api} from "../Api";

type ModerationLinkToHubspotProps = {
    companyPk: string;
    initialHubspotId: string;
};

export function ModerationLinkToHubspot({
    companyPk,
    initialHubspotId,
}: ModerationLinkToHubspotProps) {
    const [newHubspotId, setNewHubspotId] = useState("");
    const [hubspotId, setHubspotId] = useState(initialHubspotId);
    if (hubspotId) {
        return (
            <a
                className="btn btn-sm btn-secondary"
                href={`https://app.hubspot.com/contacts/9184177/company/${hubspotId}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                <DeprecatedIcon name="external-link-alt" /> Hubspot
            </a>
        );
    }
    return (
        <div
            className="company-form d-flex flex-row align-items-center flex-wrap"
            style={{display: "inline-block"}}
        >
            <div>
                <input
                    className="form-control-sm"
                    name="hubspot_id"
                    placeholder="Identifiant Hubspot"
                    onChange={(e) => setNewHubspotId(e.target.value)}
                />
            </div>
            <button
                className="btn btn-secondary btn-sm"
                type="submit"
                onClick={async () => {
                    try {
                        await Api.patch(
                            `/companies-admin/${companyPk}/`,
                            {
                                hubspot_id: newHubspotId,
                            },
                            {apiVersion: "web"}
                        );
                        setHubspotId(newHubspotId);
                    } catch (e) {
                        toast.error(
                            "Failed to link this company to a Hubspot account (Have you check the provided ID?)"
                        );
                    }
                }}
            >
                <i className="fa fa-link" /> Link to Hubspot
            </button>
        </div>
    );
}
