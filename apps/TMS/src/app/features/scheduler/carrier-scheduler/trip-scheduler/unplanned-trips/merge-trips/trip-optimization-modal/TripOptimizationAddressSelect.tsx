import {AddressLabel} from "@dashdoc/web-common";
import {Text, Select, SelectProps} from "@dashdoc/web-ui";
import {TransportAddress} from "dashdoc-utils";
import React from "react";
import {createFilter} from "react-select";

export function TripOptimizationAddressSelect(props: SelectProps) {
    return (
        <Select
            getOptionValue={(address: TransportAddress) => address.pk.toString()}
            getOptionLabel={(address: TransportAddress) =>
                [
                    address.name,
                    address.address,
                    address.postcode,
                    address.city,
                    address.country,
                ].join(" ")
            }
            filterOption={createFilter({
                stringify: (option) => `${option.label}`,
            })}
            formatOptionLabel={(address: TransportAddress) => {
                return (
                    <>
                        <Text fontWeight="bold" color="inherit">
                            {!!address.name && address.name}
                        </Text>
                        <AddressLabel address={address} />
                    </>
                );
            }}
            styles={{
                valueContainer: (provided) => ({
                    ...provided,
                    height: "5em",
                }),
                singleValue: (provided) => ({
                    ...provided,
                    top: "35%",
                }),
            }}
            isClearable={false}
            {...props}
        />
    );
}
