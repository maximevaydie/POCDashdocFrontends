import {apiService} from "@dashdoc/web-common";
import {Company, FlowProfile} from "types";

type SearchCompany = {
    site: number;
    page: number;
    managed?: true;
    first_delegate?: true;
    search?: string;
};

type SearchCompanyResult = {
    options: Company[];
    hasMore?: boolean;
    additional?: {
        page: number;
    };
};

async function searchCompanies(siteId: number, input: string, profile: FlowProfile, page: number) {
    const params: SearchCompany = {
        site: siteId,
        search: input,
        page,
    };
    if (profile === "siteManager") {
        params.first_delegate = true;
    }
    if (profile === "delegate") {
        params.managed = true;
    }
    const urlParams = new URLSearchParams(params as any).toString();
    const path = `/flow/companies/?${urlParams}`;

    const response: {results: Company[]; next: string | null} = await apiService.get(path, {
        apiVersion: "web",
    });
    const result: SearchCompanyResult = {
        options: response.results,
        hasMore: !!response.next,
        additional: {page: page + 1},
    };
    return result;
}

export const searchService = {searchCompanies};
