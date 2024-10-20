import {t} from "@dashdoc/web-core";
import {FiltersSelectOption, Select, SelectOptions} from "@dashdoc/web-ui";
import {RealSimpleCompany} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import React, {FunctionComponent} from "react";
import {OptionTypeBase} from "react-select";
import {OptionsList} from "react-select-async-paginate";

import {getAllCompaniesFromTransport} from "app/services/transport";

import type {Transport} from "app/types/transport";

type DocumentCompaniesVisibilitySelectProps = {
    label?: string;
    initialReadableByCompanyIds: number[];
    transport: Transport;
    authorCompany: number;
    setReadableByCompanyIds: (newSelection: number[]) => void;
};

const getDocumentCompaniesOptions = (
    transport: Transport,
    authorCompany: number
): SelectOptions<number> => {
    const companiesList: Partial<RealSimpleCompany>[] = getAllCompaniesFromTransport(transport);

    const options = companiesList.map((company) => ({
        label: company.name || t("common.unknownName"),
        value: company.pk,
        isFixed: company.pk === authorCompany,
    }));
    return options;
};

const DocumentCompaniesVisibilitySelect: FunctionComponent<
    DocumentCompaniesVisibilitySelectProps
> = (props) => {
    const options = getDocumentCompaniesOptions(props.transport, props.authorCompany);
    let value: SelectOptions<number> = props.initialReadableByCompanyIds
        ? // @ts-ignore
          options.filter((option) => props.initialReadableByCompanyIds.includes(option.value))
        : [];

    const onChange = (_: OptionsList<OptionTypeBase>, {action, option, removedValue}: any) => {
        let newSelection = props.initialReadableByCompanyIds.slice();
        if (action === "select-option") {
            newSelection.push(option.value);
        }
        if (action === "deselect-option") {
            if (!option.isFixed) {
                newSelection.splice(newSelection.indexOf(option.value), 1);
            }
        }
        if (action === "remove-value") {
            if (!removedValue.isFixed) {
                newSelection.splice(newSelection.indexOf(removedValue.value), 1);
            }
        }

        if (!isEqual(newSelection, props.initialReadableByCompanyIds)) {
            props.setReadableByCompanyIds(newSelection);
        }
    };
    return (
        <Select
            data-testid="document-companies-visibility-select"
            label={props.label}
            components={{Option: FiltersSelectOption}}
            options={options}
            isMulti={true}
            value={value}
            onChange={onChange}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            isClearable={false}
            styles={{
                multiValueRemove: (styles, {data}) => {
                    return data.isFixed ? {...styles, display: "none"} : styles;
                },
                multiValue: (styles, {data}) => {
                    return data.isFixed ? {...styles, paddingRight: "8px"} : styles;
                },
            }}
        />
    );
};

export {DocumentCompaniesVisibilitySelect};
