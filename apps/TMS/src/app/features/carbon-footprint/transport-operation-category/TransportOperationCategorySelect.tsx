import {t} from "@dashdoc/web-core";
import {Select} from "@dashdoc/web-ui";
import React, {useEffect, useState} from "react";

import {transportOperationCategoryApiService} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

import type {Transport} from "app/types/transport";

type Props = {
    onSetDefaultValue: (value: TransportOperationCategoryOption) => void;
    onChange: (value: TransportOperationCategoryOption) => void;
    value?: Transport["transport_operation_category"];
};

export type TransportOperationCategoryOption = {
    name: string;
    uid: string;
};

export function TransportOperationCategorySelect({onChange, value, onSetDefaultValue}: Props) {
    const [options, setOptions] = useState<TransportOperationCategoryOption[]>([]);

    useEffect(() => {
        async function fetchOptions() {
            const response = await transportOperationCategoryApiService.getAll();
            setOptions(response.results.map(({uid, name}) => ({uid, name})));
            if (!value) {
                const defaultValue = response.results.find(
                    (transportOperationCategory) => transportOperationCategory.is_default
                );
                if (defaultValue) {
                    onSetDefaultValue({uid: defaultValue.uid, name: defaultValue.name});
                }
            }
        }
        fetchOptions();
    }, []);

    return (
        <Select
            label={t("carbonFootprint.transportOperationCategory")}
            options={options}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uid!}
            isClearable={false}
            onChange={onChange}
            value={value}
            data-testid="transport-operation-category-select"
        />
    );
}
