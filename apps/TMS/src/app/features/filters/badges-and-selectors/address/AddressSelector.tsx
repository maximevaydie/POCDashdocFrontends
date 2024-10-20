import {AddressSelectOption, addressService} from "@dashdoc/web-common";
import {FilteringPaginatedListSelector} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringPaginatedListSelector";
import {FilteringSelectorHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import React, {useCallback, useState} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";

import {AddressesQuery} from "./addressFilter.types";

type Props = {
    query: AddressesQuery;
    updateQuery: (query: Partial<AddressesQuery>) => void;
    initialDataType?: string;
};

type PartialAddress = Pick<
    Address,
    "pk" | "address" | "city" | "country" | "is_destination" | "is_origin" | "name" | "postcode"
>;

export function AddressSelector({query, updateQuery, initialDataType}: Props) {
    const {extendedView} = useExtendedView();

    const formatItemLabel = useCallback(
        (address: Address) => (
            <Flex width="100%">
                <AddressSelectOption
                    categories={["origin", "destination"]}
                    address={addressService.convertAddressToIOriginalAddress(address)}
                    isMenuContext={true}
                    maxWidth="calc(100% - 1.5em)"
                />
            </Flex>
        ),
        []
    );

    const [selectedDataType, setSelectedDataType] = useState<string>(initialDataType ?? "address");

    const dataType = {
        label: t("filter.siteType"),
        options: [
            {
                label: t("common.pickup"),
                headerLabel: t("filter.loadingAddress"),
                id: "origin_address",
            },
            {
                label: t("common.delivery"),
                headerLabel: t("filter.unloadingAddress"),
                id: "destination_address",
            },
            {label: t("common.both"), headerLabel: t("filter.siteAddress"), id: "address"},
        ],
        value: selectedDataType,
        onChange: setSelectedDataType,
    };
    const condition = {
        options: [{label: t("filter.in"), id: "in"}],
        value: "in",
        onChange: () => {},
    };

    const queryKey = (selectedDataType + "__" + condition.value) as keyof AddressesQuery;

    return (
        <>
            <FilteringSelectorHeader dataType={dataType} condition={condition} />
            <FilteringPaginatedListSelector<PartialAddress>
                fetchItemsUrl="deliveries/addresses/"
                additionalQueryParams={{extended_view: extendedView}}
                searchQueryKey="text"
                getItemId={(company) => `${company.pk}`}
                getItemLabel={formatItemLabel}
                values={query[queryKey] ?? []}
                onChange={(value) => updateQuery({[queryKey]: value})}
            />
        </>
    );
}
