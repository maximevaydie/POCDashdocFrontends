import {Button} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {Company, Manager, Trucker} from "dashdoc-utils";
import React, {useState} from "react";

import {Api} from "../Api";
import {useDebouncedFetch} from "../hooks/use-debounced-fetch";

import SearchBar from "./moderation-search-bar";

type OtherCompanyRowProps = {other: Company; onClick: () => void};

function OtherCompanyRow({other, onClick}: OtherCompanyRowProps) {
    return (
        <tr key={other.pk}>
            <td>
                <a style={{cursor: "pointer"}} onClick={onClick}>
                    {other.name} ({other.pk})
                </a>
            </td>
            <td>
                <a href={`../${other.pk}`} target="blank">
                    <i className="fa fa-sign-in-alt" /> Moderation
                </a>
            </td>
        </tr>
    );
}

type ModerationCompaniesMergerProps = {
    companyPk: number;
    companyName: string;
};

export function ModerationCompaniesMerger({
    companyPk,
    companyName,
}: ModerationCompaniesMergerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const {isLoading, data} = useDebouncedFetch(
        "/companies/search/?include_no_managers=true&query=",
        searchQuery
    );

    const [clickedCompany, setClickedCompany] = useState<
        Company & {managers: any[]; truckers: any[]}
        // @ts-ignore
    >(undefined);
    const [loading, setLoading] = useState(false);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-6">
                    <h5>Pick a company to merge into {companyName}</h5>
                    <SearchBar
                        value={searchQuery}
                        placeholder="Search for a company"
                        onQueryChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchQuery(event.target.value);
                        }}
                        loading={isLoading}
                    />
                    <table className="table table-striped">
                        <tbody>
                            {data &&
                                data
                                    .filter((company: Company) => company.pk !== companyPk)
                                    .map((other: Company) => (
                                        <OtherCompanyRow
                                            key={other.pk}
                                            other={other}
                                            onClick={setClickedCompany.bind(undefined, other)}
                                        />
                                    ))}
                        </tbody>
                    </table>
                </div>
                <div className="col-md-6">
                    <h5>Company to merge in {companyName}</h5>
                    {clickedCompany && (
                        <h6 className="alert alert-danger">
                            WARNING: {clickedCompany.name} will be completely deleted from Dashdoc.
                            All its transports, managers, truckers and addresses will be linked to{" "}
                            {companyName}.
                        </h6>
                    )}
                    <table className="table table-striped">
                        <tbody>
                            <tr>
                                <td>ID (will be deleted)</td>
                                <td>{clickedCompany && clickedCompany.pk}</td>
                            </tr>
                            <tr>
                                <td>Name (will be deleted)</td>
                                <td>{clickedCompany && clickedCompany.name}</td>
                            </tr>
                            <tr>
                                <td>VAT number (will be deleted)</td>
                                <td>{clickedCompany && clickedCompany.vat_number}</td>
                            </tr>
                            <tr>
                                <td>Trade number (will be deleted)</td>
                                <td>{clickedCompany && clickedCompany.trade_number}</td>
                            </tr>
                            <tr>
                                <td>Managers (will be merged into {companyName})</td>
                                <td
                                    style={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        width: "300px",
                                    }}
                                >
                                    {clickedCompany &&
                                        clickedCompany.managers
                                            ?.map(
                                                (manager: Manager & {display_name: string}) =>
                                                    manager.display_name
                                            )
                                            .join(", ")}
                                </td>
                            </tr>
                            <tr>
                                <td>Truckers (will be merged into {companyName})</td>
                                <td>
                                    <div
                                        style={{
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            width: "300px",
                                        }}
                                    >
                                        {clickedCompany &&
                                            clickedCompany.truckers
                                                ?.map((trucker: Trucker) => trucker.display_name)
                                                .join(", ")}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {loading ? (
                        <LoadingWheel />
                    ) : (
                        <Button
                            disabled={!clickedCompany}
                            severity="danger"
                            css={{float: "right"}}
                            onClick={async () => {
                                if (
                                    confirm(
                                        `/!\\ WARNING /!\\\nThis will merge company ${clickedCompany.name}(${clickedCompany.pk}) into the current company.\nThis change is irreversible.\n Are you sure to continue?`
                                    )
                                ) {
                                    setLoading(true);
                                    try {
                                        await Api.post(
                                            `/companies/merge/`,
                                            {
                                                base_company: companyPk,
                                                merge_with: [clickedCompany.pk],
                                                remove_addresses: [],
                                            },
                                            {apiVersion: "v4"}
                                        );
                                        setLoading(false);
                                        window.location.reload();
                                    } catch (error) {
                                        setLoading(false);
                                        const jsonError = await error.json();
                                        alert(`Error: ${JSON.stringify(jsonError)}`);
                                    }
                                }
                            }}
                        >
                            Merge
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
