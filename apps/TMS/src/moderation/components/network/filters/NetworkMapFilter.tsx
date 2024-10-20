import {
    AsyncPaginatedSelect,
    Box,
    Flex,
    IconButton,
    Select,
    SwitchInput,
    TextInput,
    theme,
    TooltipWrapper,
    SelectOption,
    ClickOutside,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {LatLngBounds} from "leaflet";
import debounce from "lodash.debounce";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {components, MultiValueProps, OptionProps, SingleValueProps} from "react-select";

import {Api} from "moderation/Api";
import {MultiRangeSlider} from "moderation/components/network/filters/MultiRangeSlider";
import {
    NetworkMapSavedFilters,
    renderTooltipContent,
} from "moderation/components/network/filters/NetworkMapSavedFilters";
import {useSavedFilters} from "moderation/hooks/useSavedFilters";
import {
    BUSINESS_SECTOR_DICT,
    COMPANY_TYPE_DICT,
    CRM_OWNER_DICT,
    DASHDOC_ACCOUNT_TYPE,
    LEAD_STATUS_DICT,
    TELEMATIC_TOOL_DICT,
    TMS_DICT,
} from "moderation/network-map/constants";
import {FilterState} from "moderation/network-map/types";

interface NetworkMapFilterProps {
    actualBounds: LatLngBounds;
    updateCompanies: (bounds: LatLngBounds, params: string) => void;
}

interface OptionType {
    value: number;
    company: any;
}

const Option = (props: OptionProps<OptionType, true>) => {
    const {data} = props;
    return (
        <components.Option {...props}>
            <div>
                <span style={{fontSize: "14px", fontWeight: "bold"}}>
                    {data.company.denomination}
                </span>
                <br />
                <span
                    style={{fontSize: "12px", color: "gray"}}
                >{`${data.company.country} - ${data.company.city} (${data.company.postcode})`}</span>
            </div>
        </components.Option>
    );
};

// Custom SingleValue Component
const SingleValue = (props: SingleValueProps<OptionType>) => {
    const {data} = props;
    return (
        <components.SingleValue {...props}>
            <div>{data.company.denomination}</div>
        </components.SingleValue>
    );
};

// Custom MultiValue Component
const MultiValue = (props: MultiValueProps<OptionType>) => {
    const {data} = props;
    return (
        <components.MultiValue {...props}>
            <div>{data.company.denomination}</div>
        </components.MultiValue>
    );
};
export const NetworkMapFilter = ({actualBounds, updateCompanies}: NetworkMapFilterProps) => {
    const [crmOwner, setCrmOwner] = useState<SelectOption<string>>();
    const [tms, setTms] = useState<SelectOption<string>>();
    const [telematicsProvider, setTelematicsProvider] = useState<SelectOption<string>>();
    const [companyTypeFilter, setCompanyTypeFilter] = useState<SelectOption<string>>();
    const [leadStatusFilter, setLeadStatusFilter] = useState<SelectOption<string>>();
    const [businessSectorFilter, setBusinessSectorFilter] = useState<SelectOption<string>>();
    const [dashdocAccountType, setDashdocAccountType] = useState<SelectOption<string>>();
    const [denomination, setDenomination] = useState<string>("");
    const [employeeCountGte, setEmployeeCountGte] = useState<number>();
    const [employeeCountLte, setEmployeeCountLte] = useState<number>();
    const [truckersCountGte, setTruckersCountGte] = useState<number>();
    const [truckersCountLte, setTruckersCountLte] = useState<number>();
    const [officialVehicleCountGte, setOfficialVehicleCountGte] = useState<number>();
    const [officialVehicleCountLte, setOfficialVehicleCountLte] = useState<number>();
    const [isHeadquarters, setIsHeadquarters] = useState<boolean>();
    const [has_active_managers, setHasActiveManagers] = useState<boolean>();
    const [companyInvited, setCompanyInvited] = useState<SelectOption<string>>();
    const [filters, updateFilter, removeFilter] = useSavedFilters({});

    const loadInvitedByCompanyOptions = async (search: string) => {
        const response = await Api.get(`/directory-company/?denomination=${search}`, {
            apiVersion: "web",
        });
        const data = response.results;
        const hasMore = Boolean(response.next);
        const newOptions = data.map((company: any) => ({
            value: company.id,
            company,
        }));

        return {
            options: newOptions,
            hasMore,
        };
    };

    const applySavedFilters = (filters: FilterState[]) => {
        filters.forEach(({name, value}) => {
            const filter = actualFilters.find((filter) => filter.name === name);
            if (filter && filter.setter) {
                filter.setter(value);
            }
        });
    };

    const resetAllFilters = () => {
        actualFilters.forEach(({setter}) => {
            if (setter) {
                setter(undefined as any);
            }
        });
    };

    const actualFilters = useMemo(
        () =>
            [
                {name: "crm_owner_id", value: crmOwner, setter: setCrmOwner},
                {name: "tms", value: tms, setter: setTms},
                {
                    name: "telematics_provider",
                    value: telematicsProvider,
                    setter: setTelematicsProvider,
                },
                {name: "company_type", value: companyTypeFilter, setter: setCompanyTypeFilter},
                {name: "lead_status", value: leadStatusFilter, setter: setLeadStatusFilter},
                {
                    name: "business_sector",
                    value: businessSectorFilter,
                    setter: setBusinessSectorFilter,
                },
                {
                    name: "dashdoc_account_type",
                    value: dashdocAccountType,
                    setter: setDashdocAccountType,
                },
                {name: "denomination", value: denomination, setter: setDenomination},
                {
                    name: "employee_count__gte",
                    value: employeeCountGte,
                    setter: setEmployeeCountGte,
                },
                {
                    name: "employee_count__lte",
                    value: employeeCountLte,
                    setter: setEmployeeCountLte,
                },
                {
                    name: "truckers_count__gte",
                    value: truckersCountGte,
                    setter: setTruckersCountGte,
                },
                {
                    name: "truckers_count__lte",
                    value: truckersCountLte,
                    setter: setTruckersCountLte,
                },
                {
                    name: "official_vehicle_count__gte",
                    value: officialVehicleCountGte,
                    setter: setOfficialVehicleCountGte,
                },
                {
                    name: "official_vehicle_count__lte",
                    value: officialVehicleCountLte,
                    setter: setOfficialVehicleCountLte,
                },
                {name: "is_headquarters", value: isHeadquarters, setter: setIsHeadquarters},
                {
                    name: "has_active_managers",
                    value: has_active_managers,
                    setter: setHasActiveManagers,
                },
                {name: "invited_companies", value: companyInvited, setter: setCompanyInvited},
            ] as FilterState[],
        [
            crmOwner,
            tms,
            telematicsProvider,
            companyTypeFilter,
            leadStatusFilter,
            businessSectorFilter,
            dashdocAccountType,
            denomination,
            employeeCountGte,
            employeeCountLte,
            truckersCountGte,
            truckersCountLte,
            officialVehicleCountGte,
            officialVehicleCountLte,
            isHeadquarters,
            has_active_managers,
            companyInvited,
        ]
    );

    const getQueryString = useCallback(() => {
        const parameters: {[name: string]: string | number | boolean} = {};

        actualFilters.forEach(({name, value}) => {
            if (value) {
                if (Array.isArray(value)) {
                    parameters[name] = getQueryStringFromState(value);
                } else if (value && typeof value === "object" && value.constructor === Object) {
                    // For filters with options, where the value is an object with 'label' and 'value'
                    switch (value.value) {
                        case "has_loggable_managers":
                            parameters["has_loggable_managers"] = true;
                            break;
                        default:
                            parameters[name] = value.value as string | number | boolean;
                    }
                } else {
                    parameters[name] = value as string | number | boolean;
                }
            }
        });

        return Object.keys(parameters)
            .filter((key) => parameters[key])
            .map((key) => `${key}=${parameters[key]}`)
            .join("&");
    }, [actualFilters]);

    const getQueryStringFromState = (state: SelectOption<string> | undefined): string => {
        return state ? state.map(({value}: {value: string}) => value).join(",") : undefined;
    };

    const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);
    const [showSavedFilters, setShowSavedFilters] = useState(false);

    const debounceCountState = debounce((values, setterMin, setterMax) => {
        setterMin(values.min);
        setterMax(values.max);
    }, 100);

    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            applySavedFilters(Object.values(filters)[0]);
        }
    }, []);

    useEffect(() => {
        const queryString = getQueryString();
        updateCompanies(actualBounds, queryString);
    }, [getQueryString]);

    const handleCloseFilters = () => {
        setShowAdditionalFilters(false);
    };

    return (
        <Flex
            style={{gap: "10px"}}
            flexDirection={"row"}
            width={"auto"}
            alignContent={"center"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            position={"relative"}
            zIndex="networkMap20"
        >
            <FilterContainer>
                <TextInput
                    type="text"
                    leftIcon="search"
                    value={denomination}
                    onChange={(value) => {
                        setDenomination(value as string);
                    }}
                />
            </FilterContainer>
            <IconButton
                name={"cleaning"}
                label={window.screen.width < 768 ? "" : "Reset filters"}
                onClick={() => {
                    resetAllFilters();
                }}
            />
            <Box
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <TooltipWrapper content={renderTooltipContent(actualFilters)} placement={"bottom"}>
                    <IconButton
                        name={"filter"}
                        label={window.screen.width < 768 ? "" : "Filters"}
                        onClick={() => {
                            setShowAdditionalFilters(!showAdditionalFilters);
                            setShowSavedFilters(false);
                        }}
                        color={showAdditionalFilters ? "blue.default" : undefined}
                    />
                </TooltipWrapper>
                <ClickOutside
                    onClickOutside={handleCloseFilters}
                    reactRoot={document.getElementById("directory-company-map")}
                >
                    <FiltersContainer
                        style={{
                            display: showAdditionalFilters ? "flex" : "none",
                        }}
                    >
                        <FiltersContainerPart>
                            <FilterContainer
                                style={{
                                    marginBottom: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <SwitchInput
                                    labelLeft={"Only HQ"}
                                    value={isHeadquarters as boolean}
                                    onChange={(value) => {
                                        setIsHeadquarters(value);
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer
                                style={{
                                    marginBottom: "10px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <SwitchInput
                                    labelLeft={"Has active managers"}
                                    value={has_active_managers as boolean}
                                    onChange={(value) => {
                                        setHasActiveManagers(value);
                                    }}
                                />
                            </FilterContainer>
                        </FiltersContainerPart>
                        <Box
                            height={"1px"}
                            width={"100%"}
                            style={{
                                backgroundColor: "#E5E5E5",
                                margin: "5px 0",
                            }}
                        />
                        <FiltersContainerPart>
                            <FilterContainer
                                style={{
                                    marginBottom: "20px",
                                }}
                            >
                                <MultiRangeSlider
                                    min={0}
                                    max={100}
                                    label={"Truckers"}
                                    width={200}
                                    onChange={(values) => {
                                        debounceCountState(
                                            values,
                                            setTruckersCountGte,
                                            setTruckersCountLte
                                        );
                                    }}
                                    onReset={() => {
                                        setTruckersCountGte(undefined);
                                        setTruckersCountLte(undefined);
                                    }}
                                />
                            </FilterContainer>

                            <FilterContainer
                                style={{
                                    marginBottom: "20px",
                                }}
                            >
                                <MultiRangeSlider
                                    min={0}
                                    max={100}
                                    label={"Official number of trucks"}
                                    width={200}
                                    onChange={(values) => {
                                        debounceCountState(
                                            values,
                                            setOfficialVehicleCountGte,
                                            setOfficialVehicleCountLte
                                        );
                                    }}
                                    onReset={() => {
                                        setOfficialVehicleCountGte(undefined);
                                        setOfficialVehicleCountLte(undefined);
                                    }}
                                />
                            </FilterContainer>
                        </FiltersContainerPart>
                        <Box
                            height={"1px"}
                            width={"100%"}
                            style={{
                                backgroundColor: "#E5E5E5",
                                margin: "5px 0",
                            }}
                        />
                        <FiltersContainerPart>
                            <FilterContainer>
                                <Select
                                    label={"Dashdoc account type"}
                                    options={DASHDOC_ACCOUNT_TYPE}
                                    isClearable
                                    closeMenuOnSelect={false}
                                    value={dashdocAccountType}
                                    onChange={(value) => {
                                        setDashdocAccountType(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        );
                                    }}
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap8,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <Select
                                    label={"Lead status"}
                                    options={LEAD_STATUS_DICT}
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    value={leadStatusFilter}
                                    onChange={(value) =>
                                        setLeadStatusFilter(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap7,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <Select
                                    label={"Company type"}
                                    options={COMPANY_TYPE_DICT}
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    value={companyTypeFilter}
                                    onChange={(value) =>
                                        setCompanyTypeFilter(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap6,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <Select
                                    label={"Business sector"}
                                    options={BUSINESS_SECTOR_DICT}
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    value={businessSectorFilter}
                                    onChange={(value) =>
                                        setBusinessSectorFilter(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap5,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <Select
                                    label={"Crm owner"}
                                    options={CRM_OWNER_DICT}
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    value={crmOwner}
                                    onChange={(value) =>
                                        setCrmOwner(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap4,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <Select
                                    label={"Tms"}
                                    options={TMS_DICT}
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    value={tms}
                                    onChange={(value) =>
                                        setTms(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap3,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <Select
                                    label={"Telematics provider"}
                                    options={TELEMATIC_TOOL_DICT}
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    value={telematicsProvider}
                                    onChange={(value) =>
                                        setTelematicsProvider(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap1,
                                        }),
                                    }}
                                />
                            </FilterContainer>
                            <FilterContainer>
                                <AsyncPaginatedSelect
                                    label={"Companies invited by"}
                                    isClearable
                                    isMulti={false}
                                    closeMenuOnSelect={false}
                                    loadOptions={loadInvitedByCompanyOptions}
                                    value={companyInvited}
                                    onChange={(value) =>
                                        setCompanyInvited(
                                            value?.length === 0
                                                ? undefined
                                                : (value as SelectOption<string>)
                                        )
                                    }
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: theme.zIndices.networkMap1,
                                        }),
                                    }}
                                    components={{Option, SingleValue, MultiValue}}
                                />
                            </FilterContainer>
                        </FiltersContainerPart>
                    </FiltersContainer>
                </ClickOutside>
            </Box>
            <NetworkMapSavedFilters
                {...{
                    filters,
                    actualFilters,
                    updateFilter,
                    removeFilter,
                    applySavedFilters,
                }}
                isOpen={showSavedFilters}
                setIsOpen={(value) => {
                    setShowSavedFilters(value);
                    setShowAdditionalFilters(false);
                }}
            />
        </Flex>
    );
};

const FilterContainer = styled(Box)`
    flex: 1;
    min-width: 200px;
`;

const FiltersContainer = styled(Flex)`
    position: absolute;
    top: 50px;
    right: 0px;
    z-index: 10000;
    padding: 10px;
    padding-top: 20px;
    gap: 10px;
    width: auto;
    max-height: 65vh;
    overflow-y: auto;
    background: white;
    border-radius: 5px;
    border: 1px solid #e5e5e5;
    flex-direction: column;
`;

const FiltersContainerPart = styled(Box)`
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, 1fr);

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;
