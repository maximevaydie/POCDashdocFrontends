import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {Dropdown, DropdownProps} from "../button/Dropdown";
import {Radio, RadioProps} from "../choice/Radio";
import {Box} from "../layout/Box";

export type FiltersRadioProps = {
    leftIcon?: DropdownProps["leftIcon"];
    label?: DropdownProps["label"];
    radioOptions?: {label: string; value: string}[];
    radioOptionsName?: RadioProps["name"];
    radioOptionsValue?: RadioProps["value"];
    onChange?: RadioProps["onChange"];
    "data-testid"?: string;
};

export const FiltersRadio: FunctionComponent<FiltersRadioProps> = (props) => {
    const {
        leftIcon,
        label,
        radioOptions,
        radioOptionsName,
        radioOptionsValue,
        onChange,
        "data-testid": dataTestId,
    } = props;

    const [isOpen, open, close] = useToggle();

    return (
        <Dropdown
            leftIcon={leftIcon}
            label={label}
            isOpen={isOpen}
            onOpen={open}
            onClose={close}
            data-testid={dataTestId}
        >
            <Box py={3} borderBottom="1px solid" borderColor="grey.light">
                {/*
// @ts-ignore */}
                {radioOptions.map(({label, value}) => (
                    <Box px={3} key={`${label}-${value}`}>
                        <Radio
                            name={radioOptionsName}
                            label={label}
                            value={value}
                            onChange={onChange}
                            checked={radioOptionsValue === value}
                            data-testid={`${dataTestId}-radio-${value}`}
                        />
                    </Box>
                ))}
            </Box>
        </Dropdown>
    );
};
