import {
    AddressSelectOption,
    addressService,
    apiService,
    FilterSelectorProps,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AutoCompleteTextInput,
    FiltersAsyncPaginatedSelect,
    AsyncPaginatedSelectProps,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import isNil from "lodash.isnil";
import map from "lodash.map";
import omitBy from "lodash.omitby";
import sortedUniq from "lodash.uniq";
import React, {useCallback, useMemo, useState} from "react";
import {ActionMeta} from "react-select";
import {FormatOptionLabelContext} from "react-select/src/Select";

import {useExtendedView} from "app/hooks/useExtendedView";

import {AddressesCriteriaQuery} from "../address-by-criteria/addressByCriteriaFilter.types";

import {AddressesQuery} from "./addressFilter.types";

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type FetchAddressesResponse = ReturnType<typeof apiService.Deliveries.getAllAddresses>;
export type Addresses = UnPromisify<FetchAddressesResponse>["results"];

export type FiltersAddressesValue = Addresses;
export type FiltersAddressesProps = FilterSelectorProps<
    AddressesQuery & AddressesCriteriaQuery
> & {
    addresses: Record<string | number, Addresses[0] | undefined>;
    setLoadedAddresses: (addresses: Addresses) => void;
    selectionOnly?: boolean;
};

type AddressesQueryKeys = keyof AddressesQuery;

type PartialAddress = Pick<
    Address,
    "pk" | "address" | "city" | "country" | "is_destination" | "is_origin" | "name" | "postcode"
>;

type Additional = {
    page: number;
    category__in: string | null;
    postcode__in: string | undefined;
    country__in: string | undefined;
    extended_view: boolean;
};

export function FiltersAddresses({
    currentQuery,
    updateQuery,
    addresses,
    setLoadedAddresses,
    selectionOnly,
}: FiltersAddressesProps) {
    const [totalAddresses, setTotalAddresses] = useState<number>(0);
    const [sitesQuery, setSitesQuery] = useState<AddressesQueryKeys>("address__in");

    const [site, setSite] = useState<string>(sitesQuery.substring(0, sitesQuery.indexOf("__")));

    const {extendedView} = useExtendedView();

    const siteText = `${site}_text` as keyof Pick<
        AddressesCriteriaQuery,
        "address_text" | "origin_address_text" | "destination_address_text"
    >;
    const sitePostcode = `${site}_postcode__in` as keyof Pick<
        AddressesCriteriaQuery,
        "address_postcode__in" | "origin_address_postcode__in" | "destination_address_postcode__in"
    >;

    const siteCountry = `${site}_country__in` as keyof Pick<
        AddressesCriteriaQuery,
        "address_country__in" | "origin_address_country__in" | "destination_address_country__in"
    >;

    const isSiteQuery =
        !!currentQuery?.[siteText] ||
        !!currentQuery?.[sitePostcode] ||
        !!currentQuery?.[siteCountry];

    const [additionalInputs, setAdditionalInputs] = useState<AddressesCriteriaQuery>({
        address_text: "",
        address_postcode__in: "",
        address_country__in: "",
        origin_address_text: "",
        origin_address_postcode__in: "",
        origin_address_country__in: "",
        destination_address_text: "",
        destination_address_postcode__in: "",
        destination_address_country__in: "",
    });

    // declare loadOptions function for FiltersAsyncPaginatedSelect
    const loadOptions: AsyncPaginatedSelectProps<PartialAddress>["loadOptions"] = useCallback(
        async (
            text,
            _,
            {page, category__in, postcode__in, country__in, extended_view}: Additional
        ) => {
            const filters = {
                text,
                category__in,
                postcode__in,
                country__in: (country__in as string)?.toUpperCase(),
                extended_view,
            };
            try {
                let {
                    results: addresses,
                    next,
                    count,
                } = await apiService.Deliveries.getAllAddresses({
                    query: {
                        ...filters,
                        page,
                    },
                });
                if (!addresses) {
                    addresses = [];
                }
                setLoadedAddresses(addresses);
                setTotalAddresses(count);

                return {
                    options: addresses,
                    hasMore: !!next,
                    additional: {
                        ...filters,
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchAddress"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [setLoadedAddresses]
    );

    // handle select/unselect address
    const onChange = useCallback(
        (_: any, actionMeta: ActionMeta<PartialAddress>) => {
            const {action} = actionMeta;
            // @ts-ignore
            const newSelection = currentQuery[sitesQuery].reduce(
                (acc, pk) => {
                    acc[pk] = true;
                    return acc;
                },
                {} as Record<string, boolean>
            );
            if ("option" in actionMeta && actionMeta.option?.pk) {
                const pk = actionMeta.option.pk;
                if (action === "select-option") {
                    newSelection[pk] = true;
                }
                if (action === "deselect-option") {
                    delete newSelection[pk];
                }
            }
            updateQuery({[sitesQuery]: Object.keys(newSelection)});
        },
        [currentQuery, sitesQuery, updateQuery]
    );

    const onMultiSelect = useCallback(
        (isSelected: boolean) => {
            let query: any = {
                [siteText]: "",
                [sitePostcode]: "",
                [siteCountry]: "",
            };

            if (isSelected) {
                query = omitBy(
                    {
                        [siteText]: additionalInputs[siteText],
                        [sitePostcode]: additionalInputs[sitePostcode],
                        [siteCountry]: additionalInputs[siteCountry],
                    },
                    isNil
                );
            }

            setAdditionalInputs((filters) => ({...filters, ...query}));
            updateQuery({
                ...query,
                [sitesQuery]: [],
            });
        },
        [updateQuery, additionalInputs, siteCountry, sitePostcode, siteText, sitesQuery]
    );

    const selectedAddresses = useMemo(
        () =>
            addresses
                ? // @ts-ignore
                  Object.values(addresses).filter(({pk}) => {
                      return currentQuery[sitesQuery]?.some(
                          (selectedPk) => selectedPk.toString() === pk.toString()
                      );
                  })
                : [],
        [addresses, currentQuery, sitesQuery]
    );

    const radioOptions = useMemo(
        () => [
            {label: t("common.pickup"), value: "origin_address__in"},
            {label: t("common.delivery"), value: "destination_address__in"},
            {label: t("common.both"), value: "address__in"},
        ],
        []
    );

    const onRadioOptionsChange = useCallback((value: string) => {
        setSitesQuery(value as AddressesQueryKeys);
        setSite(value.substring(0, value.indexOf("__")));
    }, []);

    const additionalSelectProps: Additional = useMemo(() => {
        return {
            page: 1,
            category__in: sitesQuery !== "address__in" ? sitesQuery.split("_")[0] : null,
            postcode__in: additionalInputs[sitePostcode],
            country__in: additionalInputs[siteCountry],
            extended_view: extendedView,
        };
    }, [sitesQuery, additionalInputs, sitePostcode, siteCountry, extendedView]);

    const countrySuggestions = useMemo(
        () =>
            // @ts-ignore
            sortedUniq(map(addresses, (address) => address.country))
                .filter((country) => !!country)
                .map((country) => {
                    return {label: country, value: country};
                }),
        [addresses]
    );

    const additionalFilterInputs = useMemo(() => {
        return [
            {
                ComponentType: TextInput,
                value: additionalInputs[sitePostcode],
                onChange: (value: string) =>
                    setAdditionalInputs((filters) => ({
                        ...filters,
                        [sitePostcode]: value,
                    })),
                placeholder: t("common.postalCode"),
                disabled: isSiteQuery,
                autoComplete: "off",
            },
            {
                ComponentType: AutoCompleteTextInput,
                value: additionalInputs[siteCountry],
                onChange: (value: string) =>
                    setAdditionalInputs((filters) => ({
                        ...filters,
                        [siteCountry]: value.toUpperCase(),
                    })),
                placeholder: t("common.country"),
                rootId: "react-app",
                disabled: isSiteQuery,
                suggestions: countrySuggestions,
            },
        ];
    }, [additionalInputs, countrySuggestions, sitePostcode, siteCountry, isSiteQuery]);

    const cacheUniqs = useMemo(
        () => [sitesQuery, additionalInputs],
        [sitesQuery, additionalInputs]
    );
    const getOptionValue = useCallback(({pk}: PartialAddress) => pk.toString(), []);
    const getOptionLabel = useCallback(({name}: PartialAddress) => name ?? "", []);
    const formatOptionLabel = useCallback(
        (address: Address, {context}: {context: FormatOptionLabelContext}) => (
            <AddressSelectOption
                categories={["origin", "destination"]}
                address={addressService.convertAddressToIOriginalAddress(address)}
                isMenuContext={context === "menu"}
                display="inline-block"
                maxWidth="calc(100% - 1.5em)"
            />
        ),
        []
    );

    const onChangeText = (value: string) => {
        setAdditionalInputs((filters) => ({...filters, [siteText]: value}));
    };

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="filters-addresses"
            label={t("common.site")}
            leftIcon="address"
            radioOptionsLabel={t("common.typeFilter")}
            radioOptions={radioOptions}
            radioOptionsValue={sitesQuery}
            onRadioOptionsChange={onRadioOptionsChange}
            loadOptions={loadOptions}
            defaultOptions={true}
            isOptionDisabled={() => isSiteQuery}
            additionalFilterInputsLabel={t("common.searchCriteria")}
            // @ts-ignore
            additionalFilterInputs={additionalFilterInputs}
            onInputChange={onChangeText}
            defaultInputValue={additionalInputs[siteText]}
            additional={additionalSelectProps}
            cacheUniqs={cacheUniqs}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            placeholder={t("filters.searchByAddress")}
            value={selectedAddresses}
            onChange={onChange}
            onSelectAll={() => onMultiSelect(true)}
            onUnselectAll={() => onMultiSelect(false)}
            defaultSelectAllValue={isSiteQuery}
            isSelectAll={true}
            totalOptions={totalAddresses}
            selectionOnly={selectionOnly}
        />
    );
}
