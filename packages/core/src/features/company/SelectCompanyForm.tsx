import {SearchInput, apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Callout, ClickableFlex, Flex, Icon, FlexProps, Text} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Address, useToggle} from "dashdoc-utils";
import {CompanyFound} from "features/company/components/CompanyFound";
import {NoCompanySVG} from "features/company/components/NoCompanySVG";
import debounce from "lodash.debounce";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {FlowDelegation, Site} from "types";

const RESULT_LIMIT = 5;

type QueryResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: AvailableCompany[];
};

export type AvailableCompany = {
    pk: number;
    name: string;
    primary_address: Address | null;
    flow_delegations: FlowDelegation[];
};

const initialState: {queryResponse: QueryResponse; moreResults: boolean} = {
    queryResponse: {count: 0, next: null, previous: null, results: []},
    moreResults: false,
};

type Props = {
    search?: string;
    site: Site;
    submitLabel?: string;
    onAddCompany: () => void;
    onSelectCompany: (companyId: number, companyName: string) => void;
};

export function SelectCompanyForm({
    search,
    site,
    submitLabel,
    onAddCompany,
    onSelectCompany,
}: Props) {
    const [hasAlreadyTyped, setHasAlreadyTyped] = useToggle();
    const [data, setData] = useState<{queryResponse: QueryResponse; moreResults: boolean}>(
        initialState
    );
    const [selectedCompanyId, setSelectedCompanyId] = useState<null | number>(null);
    const [selectedCompanyName, setSelectedCompanyName] = useState<null | string>(null);

    const searchCompaniesCallback = useCallback(searchCompanies, [
        site.id,
        selectedCompanyId,
        setSelectedCompanyId,
    ]);
    const debouncedSearch = useMemo(
        () => debounce(searchCompaniesCallback, 400),
        [searchCompaniesCallback]
    );

    useEffect(() => {
        if (search && search.length > 2) {
            debouncedSearch(search);
        }
    }, [search]);

    return (
        <Box>
            <Box maxWidth="480px" margin="auto">
                <Flex flexDirection="column" style={{gap: "18px"}}>
                    <Box>
                        <Text variant="h1">{t("flow.selectCompanyForm.title")}</Text>
                        <Text>
                            {t("selectCompanyForm.findYourCompany", {
                                site_name: site.name,
                            })}
                        </Text>
                    </Box>

                    <SearchInput
                        hideSubmitButton
                        width={"100%"}
                        placeholder={t("flow.selectCompanyForm.searchPlaceholder")}
                        onSubmit={() => null}
                        onChange={handleTextChange}
                        textInputProps={{fontSize: 2, containerProps: {height: 42}}}
                        data-testid="search-company"
                    />
                    <Flex flexDirection="column" style={{gap: "8px"}}>
                        {data.queryResponse.results.map((availableCompany) => {
                            const selected = selectedCompanyId === availableCompany.pk;
                            let flexProps: FlexProps = {
                                border: "1px solid",
                                borderColor: "grey.light",
                            };
                            if (selected) {
                                flexProps = {
                                    border: "1px solid",
                                    borderColor: "blue.default",
                                    backgroundColor: "blue.ultralight",
                                };
                            }
                            return (
                                <ClickableFlex
                                    key={availableCompany.pk}
                                    onClick={() => {
                                        handleSelectExistingCompany(availableCompany.pk);
                                        setSelectedCompanyName(availableCompany.name);
                                    }}
                                    boxShadow="small"
                                    justifyContent="space-between"
                                    px={4}
                                    py={2}
                                    css={css`
                                        & .select {
                                            visibility: hidden;
                                        }
                                        &:hover .select {
                                            visibility: visible;
                                        }
                                    `}
                                    {...flexProps}
                                    data-testid="company-found"
                                >
                                    <Flex flexGrow={1}>
                                        <CompanyFound availableCompany={availableCompany} />
                                    </Flex>
                                    <Box margin="auto">
                                        {selectedCompanyId === availableCompany.pk ? (
                                            <Icon
                                                name="check"
                                                ml={2}
                                                mr={4}
                                                color="blue.default"
                                            />
                                        ) : (
                                            <Button className="select" variant="secondary" ml={2}>
                                                {t("common.select")}
                                            </Button>
                                        )}
                                    </Box>
                                </ClickableFlex>
                            );
                        })}
                        {data.queryResponse.count === 0 && (
                            <Box margin="auto">
                                <NoCompanySVG />
                            </Box>
                        )}
                        {data.moreResults && (
                            <Callout>
                                <Text>
                                    {t("selectCompanyForm.tooManyResults", {
                                        resultLimit: RESULT_LIMIT,
                                    })}
                                </Text>
                            </Callout>
                        )}
                        {hasAlreadyTyped && (
                            <Box mt={4} data-testid="create-another-company">
                                <Text color="grey.dark">
                                    {t("selectCompanyForm.createCompany", {
                                        site_name: site.name,
                                    })}
                                </Text>
                                <Button
                                    onClick={onAddCompany}
                                    className="select"
                                    variant="secondary"
                                    mt={2}
                                    data-testid="company-not-found-add-company"
                                >
                                    <Icon name="add" mr={2} />
                                    {t("selectCompanyForm.addMyCompanyButton")}
                                </Button>
                            </Box>
                        )}
                    </Flex>
                </Flex>
            </Box>
            <Flex mt={3} justifyContent="flex-end">
                <Button
                    type="button"
                    onClick={() => {
                        if (selectedCompanyId !== null) {
                            onSelectCompany(
                                selectedCompanyId,
                                selectedCompanyName ?? t("common.notDefined")
                            );
                        }
                    }}
                    disabled={selectedCompanyId === null}
                    data-testid="validate-selected-company"
                >
                    {submitLabel ?? t("flow.company.validateSelectedCompany")}
                </Button>
            </Flex>
        </Box>
    );

    function handleSelectExistingCompany(companyId: number) {
        setSelectedCompanyId((prev) => {
            if (prev === companyId) {
                return null;
            }
            return companyId;
        });
    }

    function handleTextChange(value: string) {
        if (value.length > 2) {
            setHasAlreadyTyped();
            debouncedSearch(value);
        } else {
            setData(initialState);
        }
    }

    async function searchCompanies(search: string) {
        const payload = {site: site.id, search};
        const params = new URLSearchParams(payload as any).toString();
        const response: QueryResponse = await apiService.get(`/flow/companies/?${params}`, {
            apiVersion: "web",
        });
        const queryResponse = {...response, results: response.results.slice(0, RESULT_LIMIT)};
        setData({queryResponse, moreResults: response.results.length > RESULT_LIMIT});
        setSelectedCompanyId((prev) => {
            if (response.results.find((c) => c.pk === selectedCompanyId)) {
                // keep the selected company if it is still in the search results
                return prev;
            }
            // remove selected company when the search results change without the selected company
            return null;
        });
    }
}
