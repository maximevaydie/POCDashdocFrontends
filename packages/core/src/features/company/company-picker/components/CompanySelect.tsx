import {CompanyName} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    AsyncPaginatedCreatableSelect,
    AsyncPaginatedSelect,
    Flex,
    Icon,
    AsyncSelectProps,
    Text,
    mergeSelectStyles,
    theme,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {useToggle} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {FunctionComponent, useMemo} from "react";
import {Company, FlowProfile, Site} from "types";

import {searchService} from "../search.service";

import {CompanyWithAddressSelectOption} from "./CompanyWithAddressSelectOption";

export type CompanySelectProps = Partial<AsyncSelectProps> & {
    onFindOrCreateCompany?: (name: string) => void;
    displayAddress?: boolean;
    flowSite: Site;
    profile: FlowProfile;
};

export const CompanySelect: FunctionComponent<CompanySelectProps> = ({
    styles = {},
    onFindOrCreateCompany,
    displayAddress,
    flowSite,
    profile,
    ...props
}) => {
    const [isLoading, startLoading, stopLoading] = useToggle(false);

    const debouncedSearchCompanies = useMemo(
        () =>
            debounce(
                async (input: string, _, {page}: {page: number}) => {
                    startLoading();
                    try {
                        const inputToUse = input.length >= 3 ? input : "";
                        // actual search via API
                        const response = await searchService.searchCompanies(
                            flowSite.id,
                            inputToUse,
                            profile,
                            page
                        );

                        if (profile === "siteManager" && page === 1) {
                            const matchesMyCompany = flowSite.name
                                .toLowerCase()
                                .includes(input.toLowerCase());
                            if (
                                matchesMyCompany &&
                                !response.options.some(({pk}) => pk === flowSite.company)
                            ) {
                                const options = [
                                    {
                                        pk: flowSite.company,
                                        name: flowSite.name,
                                    } as Company,
                                    ...(response.options as Company[]),
                                ];
                                response.options = options;
                            }
                        }

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
        [flowSite.company, flowSite.id, flowSite.name, profile, startLoading, stopLoading]
    );

    const SelectComponent = onFindOrCreateCompany
        ? AsyncPaginatedCreatableSelect
        : AsyncPaginatedSelect;
    const creatableProps = onFindOrCreateCompany
        ? {
              formatCreateLabel: (value: string) => {
                  // @ts-ignore
                  let label = t("transportsForm.addCompany", null, {capitalize: true});
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
              onCreateOption: onFindOrCreateCompany,
              isValidNewOption: () => true,
          }
        : null;

    return (
        <SelectComponent
            isLoading={isLoading}
            className="select-big"
            placeholder={t("components.enterCompanyPlaceholder")}
            // @ts-ignore The type cannot be inferred for some reason
            loadOptions={debouncedSearchCompanies}
            defaultOptions={true}
            data-testid={props["data-testid"]}
            getOptionValue={({pk}: {pk?: number}) => {
                return pk?.toString() ?? "";
            }}
            getOptionLabel={({name}: Company) => name}
            isClearable={false}
            formatOptionLabel={(
                company: Company & {
                    __isNew__: boolean;
                    label: string;
                }
            ) =>
                company.__isNew__ ? (
                    company.label
                ) : displayAddress ? (
                    <CompanyWithAddressSelectOption
                        company={company}
                        css={css`
                            line-height: 20px;
                            padding: 5px 0px;
                        `}
                    />
                ) : (
                    <CompanyName company={company} />
                )
            }
            menuPortalTarget={document.body}
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
                              menuPortal: (base) => ({...base, zIndex: theme.zIndices.modal}),
                          },
                          styles
                      )
                    : mergeSelectStyles(
                          {menuPortal: (base) => ({...base, zIndex: theme.zIndices.modal})},
                          styles
                      )
            }
            {...creatableProps}
            {...props}
        />
    );
};
