import {Select, AsyncSelectProps} from "@dashdoc/web-ui";
import {SupportType} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect} from "react";

import {fetchSearchSupportType} from "app/redux/actions/company/support-types";
import {useDispatch, useSelector} from "app/redux/hooks";

type SupportTypeSelect = Partial<AsyncSelectProps> & {
    value: SupportType;
    onChange: (value: SupportType) => void;
};

const SupportTypeSelect: FunctionComponent<SupportTypeSelect> = ({value, onChange, ...props}) => {
    const dispatch = useDispatch();

    const supportTypes: SupportType[] = useSelector((state) =>
        // @ts-ignore
        Object.values(state.entities["support-types"] || {})
    );

    const supportTypeOptions = supportTypes.map((type) => {
        return {
            value: type.uid,
            label: type.name,
            "data-testid": `support-type-option-${type.name}`,
        };
    });

    useEffect(() => {
        dispatch(fetchSearchSupportType());
    }, [dispatch]);

    const handleChange = useCallback(
        (value?: {value: string; label: string}) => {
            if (!value) {
                // @ts-ignore
                onChange(null);
            } else {
                const supportType = supportTypes.find((type) => type.uid === value.value);
                // @ts-ignore
                onChange(supportType);
            }
        },
        [onChange, supportTypes]
    );

    return (
        <Select
            value={value ? {value: value.uid, label: value.name} : null}
            // @ts-ignore
            onChange={handleChange}
            options={supportTypeOptions}
            isSearchable={true}
            {...props}
        />
    );
};

export default SupportTypeSelect;
