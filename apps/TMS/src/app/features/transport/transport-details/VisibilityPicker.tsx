import {Icon, Select, SelectOption, SelectOptions, SelectProps} from "@dashdoc/web-ui";
import {VisibilityLevel} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getVisibilityIcon, getVisibilityLabelText} from "app/services/transport";

type VisibilityPickerOption = SelectOption<VisibilityLevel>;
type VisibilityPickerOptions = SelectOptions<VisibilityLevel>;

const getVisibilityOptions = (): VisibilityPickerOptions =>
    ["everyone", "own_company_only", "own_company_only_except_truckers"].map(
        (visibilityLevel: VisibilityLevel) => {
            return {label: getVisibilityLabelText(visibilityLevel), value: visibilityLevel};
        }
    );

type VisibilityPickerProps = Partial<SelectProps<VisibilityPickerOption>>;

const VisibilityPicker: FunctionComponent<VisibilityPickerProps> = (props) => (
    <Select
        options={getVisibilityOptions()}
        isSearchable={false}
        isClearable={false}
        formatOptionLabel={({value}) => getVisibilityLabel(value)}
        {...props}
    />
);

function getVisibilityLabel(visibilityLevel: VisibilityLevel) {
    return (
        <span>
            <Icon name={getVisibilityIcon(visibilityLevel)} />
            {getVisibilityLabelText(visibilityLevel)}
        </span>
    );
}

export {VisibilityPicker, VisibilityPickerOption};
