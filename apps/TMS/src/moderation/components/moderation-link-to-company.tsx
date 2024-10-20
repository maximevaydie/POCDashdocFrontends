import {LoadingWheel} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React, {useState} from "react";

import {Api} from "../Api";
import {useDebouncedFetch} from "../hooks/use-debounced-fetch";

import SearchBar from "./moderation-search-bar";

function OtherCompanyRow({
    other,
    companyPk,
    onLink,
}: {
    other: Company;
    companyPk: string;
    onLink: Function;
}) {
    const [isLoading, setLoading] = useState(false);
    return (
        <tr key={other.pk}>
            <td>
                <a href={`../${other.pk}`}>
                    {other.name} ({other.pk})
                </a>
            </td>
            <td>
                {isLoading ? (
                    <LoadingWheel small />
                ) : (
                    <button
                        className="btn btn-default btn-xs"
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await Api.post(
                                    `/companies-admin/${companyPk}/link/?other=${other.pk}`,
                                    undefined,
                                    {apiVersion: "web"}
                                );
                                $("#nav-partners ul").append(
                                    `<li><a href="/moderation/companies/${other.pk}">${other.name} (${other.pk})</a></li>`
                                );
                                onLink();
                                setLoading(false);
                            } catch (error) {
                                setLoading(false);
                                const jsonError = await error.json();
                                alert(`Error: ${JSON.stringify(jsonError)}`);
                            }
                        }}
                    >
                        <i className="fa fa-link" /> Link
                    </button>
                )}
            </td>
        </tr>
    );
}

export function ModerationLinkToCompany({companyPk}: {companyPk: string}) {
    const [searchQuery, setSearchQuery] = useState("");
    let {isLoading, data} = useDebouncedFetch("/companies/search/?query=", searchQuery);

    const onLink = () => {
        // @ts-ignore
        setSearchQuery(undefined);
    };

    return (
        <>
            <h5>Link with another company</h5>
            <SearchBar
                value={searchQuery}
                placeholder="Search for a company"
                onQueryChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(event.target.value);
                }}
                loading={isLoading}
            />
            <table className="table table-striped" style={{minHeight: "300px"}}>
                <tbody>
                    {data &&
                        data.map((other: Company) => (
                            <OtherCompanyRow
                                key={other.pk}
                                onLink={onLink}
                                other={other}
                                companyPk={companyPk}
                            />
                        ))}
                </tbody>
            </table>
        </>
    );
}
