import {queryService, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedCreatableSelect,
    AsyncPaginatedSelect,
    Box,
    Flex,
    Icon,
    AsyncSelectProps,
    BoxProps,
    Text,
    TooltipWrapper,
    mergeSelectStyles,
    select2Service,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Address, Company, useToggle} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {FunctionComponent, useMemo, useState} from "react";
import {FormatOptionLabelMeta} from "react-select";

import {PartnerModal} from "../partner/PartnerModal";
import {HasFeatureFlag, HasNotFeatureFlag} from "../../misc/FeatureFlag";
import {apiService} from "../../../services/api.service";
import {PartnerTooltip} from "../partner/PartnerTooltip";

import {CompanyModal} from "./CompanyModal";
import {CompanyName} from "./CompanyName";
import {NO_COMPANY_VALUE} from "./constants";

import type {DefaultPartnerValue, PartnerDetailOutput} from "../../../types/partnerTypes";
import type {AddressCreatableSelect} from "../address/input/AddressCreatableSelect";

export type CompanyCategory = Parameters<typeof AddressCreatableSelect>[0]["categories"][number];

export type CompanySelectProps = Partial<AsyncSelectProps> & {
    noCompanyOption?: boolean;
    onCreateCompany?: (name: string) => void;
    companyCategory?: CompanyCategory;
    displayAddress?: boolean;
    displayTooltip?: boolean;
    excludeCompaniesPks?: number[];
};

type SearchCompanyResult = {
    options: {pk: number; name: string}[];
    hasMore?: boolean;
    additional?: {
        page: number;
    };
};

async function searchCompanies(
    input: string,
    page: number,
    {noCompanyOption, companyCategory, excludeCompaniesPks}: CompanySelectProps
): Promise<SearchCompanyResult> {
    let params: {
        [key: string]: any;
    } = {
        text: input,
        page: page,
    };

    if (companyCategory) {
        params["category"] = companyCategory;
    }

    let queryString = queryService.toQueryString(params);
    if (queryString !== "") {
        queryString = `${queryString}&hide_count`;
    } else {
        queryString = "hide_count";
    }

    const path = `/companies/?${queryString}`;

    const response: {results: {pk: number; name: string}[]; next: string | null} =
        await apiService.get(path, {apiVersion: "v4"});
    const options = [
        ...(noCompanyOption
            ? [{pk: NO_COMPANY_VALUE, name: `⨯ ${t("components.noPartner")}`}]
            : []),
        ...response.results.filter((company) => !excludeCompaniesPks?.includes(company.pk)),
    ];
    return {
        options: options,
        hasMore: !!response.next,
        additional: {page: page + 1},
    };
}

export const CompanySelect: FunctionComponent<CompanySelectProps> = ({
    styles = {},
    noCompanyOption,
    onCreateCompany,
    companyCategory,
    excludeCompaniesPks,
    displayAddress = false,
    displayTooltip = false,
    ...props
}) => {
    const [isLoading, startLoading, stopLoading] = useToggle(false);
    const debouncedSearchCompanies = useMemo(
        () =>
            debounce(
                async (input: string, _: any, {page}: {page: number}) => {
                    startLoading();
                    try {
                        const response = await searchCompanies(input, page, {
                            noCompanyOption,
                            companyCategory,
                            excludeCompaniesPks,
                        });
                        return response;
                    } finally {
                        stopLoading();
                    }
                },
                250,
                {
                    leading: true,
                }
            ),
        [startLoading, noCompanyOption, companyCategory, stopLoading, excludeCompaniesPks]
    );

    const SelectComponent = onCreateCompany ? AsyncPaginatedCreatableSelect : AsyncPaginatedSelect;
    const creatableProps = onCreateCompany
        ? {
              formatCreateLabel: (value: string) => {
                  let label = t("transportsForm.addPartner", undefined, {capitalize: true});
                  if (companyCategory === "carrier") {
                      label = t("transportsForm.addCarrier", undefined, {capitalize: true});
                  } else if (companyCategory === "shipper") {
                      label = t("transportsForm.addShipper", undefined, {capitalize: true});
                  }

                  if (value) {
                      label = t("common.add") + " : " + value;
                  }

                  return (
                      <Flex alignItems="center">
                          <Icon name="add" mr={1} color="inherit" />
                          <Text color="inherit">{label}</Text>
                      </Flex>
                  );
              },
              onCreateOption: onCreateCompany,
              isValidNewOption: () => true,
          }
        : null;

    const selectRef = React.useRef(null);

    return (
        <SelectComponent
            isLoading={isLoading}
            className="select-big"
            placeholder={t("components.enterCompanyPlaceholder")}
            // @ts-ignore The type cannot be inferred for some reason
            loadOptions={debouncedSearchCompanies}
            defaultOptions={true}
            data-testid={props["data-testid"]}
            getOptionValue={({pk}) => pk}
            getOptionLabel={({name}) => name}
            ref={selectRef}
            formatOptionLabel={(
                company: {pk: number; name: string} | {__isNew__: true; label: string},
                meta: FormatOptionLabelMeta<{pk: number; name: string}, false>
            ) => {
                if ("__isNew__" in company) {
                    return company.label;
                }
                const {context} = meta;
                const isFocused =
                    displayTooltip &&
                    context === "menu" &&
                    select2Service.isFocused(selectRef, company);
                return (
                    <CompanySelectOption
                        company={company}
                        isFocused={isFocused}
                        displayAddress={displayAddress}
                        css={css`
                            line-height: 20px;
                            padding: 5px 0px;
                        `}
                    />
                );
            }}
            styles={
                displayAddress
                    ? mergeSelectStyles(
                          {
                              valueContainer: (provided, {selectProps: {label}}) => ({
                                  ...provided,
                                  height: label ? "5em" : "4em",
                              }),
                              singleValue: (provided, {selectProps: {label}}) => ({
                                  ...provided,
                                  ...(label && {top: "30%"}),
                              }),
                              menu: (provided) => ({
                                  ...provided,
                                  maxHeight: "400px",
                              }),
                          },
                          styles
                      )
                    : styles
            }
            {...creatableProps}
            {...props}
        />
    );
};

export const CompanyCreatableSelect: FunctionComponent<
    Omit<CompanySelectProps, "onCreateCompany"> & {hideAddressForm?: boolean}
> = ({companyCategory, hideAddressForm = false, ...selectProps}) => {
    const [addCompanyModalParam, setAddCompanyModalParam] = useState<{name: string} | null>(null);

    const handleNewCompany = (company: Company | PartnerDetailOutput) => {
        // @ts-ignore
        selectProps.onChange(company, {action: "create-option"});
        setAddCompanyModalParam(null);
    };

    const defaultPartnerValue: DefaultPartnerValue = {};
    if (addCompanyModalParam?.name) {
        defaultPartnerValue.name = addCompanyModalParam.name;
    }
    if (companyCategory?.includes("carrier")) {
        defaultPartnerValue.is_carrier = true;
    }
    if (companyCategory?.includes("shipper")) {
        defaultPartnerValue.is_shipper = true;
    }

    return (
        <>
            <CompanySelect
                companyCategory={companyCategory}
                {...selectProps}
                onCreateCompany={(newCompanyName) =>
                    setAddCompanyModalParam({name: newCompanyName})
                }
            />
            {addCompanyModalParam !== null && (
                <>
                    <HasFeatureFlag flagName="betterCompanyRoles">
                        <PartnerModal
                            partner={defaultPartnerValue}
                            onClose={() => setAddCompanyModalParam(null)}
                            onSaved={handleNewCompany}
                        />
                    </HasFeatureFlag>
                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                        <CompanyModal
                            categories={companyCategory ? [companyCategory] : undefined}
                            company={addCompanyModalParam}
                            onClose={() => setAddCompanyModalParam(null)}
                            onSave={handleNewCompany}
                            hideAddressForm={hideAddressForm}
                        />
                    </HasNotFeatureFlag>
                </>
            )}
        </>
    );
};

const formatAddress = (address: Address) => (
    <>
        {address.address && <>{address.address}, </>}
        {address.postcode} {address.city}, {address.country}
    </>
);
function CompanySelectOption({
    company,
    isFocused,
    displayAddress,
    ...props
}: BoxProps & {company: Partial<Company>; isFocused: boolean; displayAddress: boolean}) {
    return (
        <TooltipWrapper
            hidden={!isFocused}
            forceDisplay={isFocused}
            onlyOnDesktop
            content={
                <PartnerTooltip
                    name={company.name ?? ""}
                    notes={company.notes ?? ""}
                    vat_number={company.vat_number}
                    invoicing_remote_id={company.invoicing_remote_id}
                />
            }
            placement="right"
            gap={10}
        >
            {displayAddress ? (
                <Box {...props}>
                    <b>
                        <CompanyName company={company} withoutContainer={true} />
                    </b>
                    <br />
                    {company.primary_address && formatAddress(company.primary_address)}
                </Box>
            ) : (
                <CompanyName company={company} />
            )}
        </TooltipWrapper>
    );
}
