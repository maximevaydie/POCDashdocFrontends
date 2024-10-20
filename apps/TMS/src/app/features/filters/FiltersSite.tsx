import {apiService, CompanyName, getConnectedCompany} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Box,
    Button,
    Flex,
    AsyncPaginatedSelectProps,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Company} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useMemo} from "react";
import {useSelector} from "react-redux";
import {FormatOptionLabelContext} from "react-select/src/Select";

import {FiltersProps} from "app/features/filters/deprecated/filters.service";

import {FilterQueryWithNavigationParameters} from "./deprecated/utils";

const SelectedCompanyLabel = ({company}: {company: Company}) => (
    <Flex alignItems="center">
        <Box backgroundColor="blue.default" mr={2} height="24px" width="24px" textAlign="center">
            <Text color="grey.white" variant="captionBold">
                {company.name?.[0]}
            </Text>
        </Box>
        <Text pr={1} lineHeight={0} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {company.name}
        </Text>
    </Flex>
);

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchCompaniesResponse = ReturnType<typeof apiService.Companies.getAll>;
type Companies = UnPromisify<FetchCompaniesResponse>["results"];

export type FiltersSiteValue = Companies;
export type FiltersSiteProps = Pick<
    FiltersProps<FilterQueryWithNavigationParameters>,
    "currentQuery" | "updateQuery"
> & {
    sites: Record<string | number, Companies[number] | undefined>;
    setLoadedSites: (sites: Companies) => void;
    onNoResultFound?: (filter: "site") => void;
};

type SiteQuery = keyof Pick<FiltersSiteProps["currentQuery"], "company">;

const siteQuery: SiteQuery = "company";

export const FiltersSite: FunctionComponent<FiltersSiteProps> = ({
    currentQuery,
    updateQuery,
    sites,
    setLoadedSites,
    onNoResultFound,
}) => {
    const loadOptions: AsyncPaginatedSelectProps<Company>["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const {results: sites = [], next} = await apiService.Companies.getAll({
                    query: {
                        text,
                        page,
                        is_site_company: true,
                    },
                });
                const companyHasNoInvitedSite = sites.length === 0 && !text;
                if (companyHasNoInvitedSite) {
                    onNoResultFound?.("site");
                }
                setLoadedSites(sites);
                return {
                    options: sites,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                        is_site_company: true,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchSites"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [onNoResultFound, setLoadedSites]
    );

    const onChange = useCallback(
        (option: Company) => updateQuery({...currentQuery, company: option.pk.toString()}),
        [updateQuery, currentQuery]
    );

    // Set site from the query parameters if there is one, otherwise return the first site of the list ordered alphabetically.
    const selectedCompany = useMemo(
        () =>
            sites
                ? // @ts-ignore
                  (Object.values(sites).filter(({pk}) => {
                      return currentQuery[siteQuery]?.toString() === pk.toString();
                  })?.[0] ??
                  Object.values(sites).sort((a, b) => {
                      // @ts-ignore
                      return a.name.localeCompare(b.name);
                  })?.[0])
                : undefined,
        [sites, currentQuery]
    );

    useEffect(() => {
        if (selectedCompany && currentQuery.company !== selectedCompany.pk.toString()) {
            updateQuery({company: selectedCompany.pk.toString()});
        }
    }, [updateQuery, selectedCompany, currentQuery.company]);

    const getOptionValue = useCallback(({pk}: Company) => pk.toString(), []);
    const getOptionLabel = useCallback(({name}: Company) => name, []);
    const formatOptionLabel = useCallback(
        (company: Company, {context}: {context: FormatOptionLabelContext}) =>
            context === "menu" ? (
                <Box display="inline-block" maxWidth="calc(100% - 1.5em)">
                    <CompanyName company={company} />
                </Box>
            ) : (
                <SelectedCompanyLabel company={company} />
            ),
        []
    );

    /* Here we're basically checking if the connected company is a site.
     * If it is, display a label instead of a select.
     * TODO - Improve (add property on Company?) */
    const connectedCompany = useSelector(getConnectedCompany);
    if (
        !!sites &&
        Object.values(sites).length === 1 &&
        connectedCompany !== null &&
        sites[connectedCompany.pk]?.pk === connectedCompany.pk &&
        !connectedCompany.primary_address?.is_shipper &&
        !connectedCompany.primary_address?.is_carrier
    ) {
        return (
            <Flex alignItems="center">
                <Button
                    variant="secondary"
                    css={css`
                        cursor: default;
                    `}
                >
                    <SelectedCompanyLabel company={connectedCompany} />
                </Button>
            </Flex>
        );
    }
    return (
        <AsyncPaginatedSelect<Company>
            isClearable={false}
            defaultOptions={true}
            data-testid="filters-addresses"
            loadOptions={loadOptions}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            value={selectedCompany}
            onChange={onChange}
        />
    );
};
