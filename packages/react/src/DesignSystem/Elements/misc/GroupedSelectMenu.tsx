import React, {FunctionComponent, useState} from "react";

import {Box, ClickableFlex, DropdownContent, Icon, Text, SelectOption} from "../index";

type OptionGroup = {
    label: string;
    options: (SelectOption<string | boolean> & {isInitiallyChecked: boolean})[];
    onSelect: (value: string | boolean) => void;
};

export type GroupedSelectMenuProps = {
    optionsByGroup: OptionGroup[];
};

export const GroupedSelectMenu: FunctionComponent<GroupedSelectMenuProps> = ({optionsByGroup}) => {
    const getInitialCheckedOptions = () => {
        const checkedOptions = [];
        for (const optionGroup of optionsByGroup) {
            checkedOptions.push(
                optionGroup.options.find((option) => option.isInitiallyChecked)?.value
            );
        }
        return checkedOptions;
    };

    // @ts-ignore
    const [checkedOptions, setCheckedOptions] = useState<string[]>(getInitialCheckedOptions());

    return (
        <DropdownContent p={3}>
            {optionsByGroup.map((optionGroup, index) => (
                <Box
                    pb={3}
                    mb={3}
                    borderBottom={index < optionsByGroup.length - 1 ? "1px solid" : undefined}
                    borderColor="grey.light"
                    key={index}
                >
                    <Text variant="subcaption" color="grey.dark" fontWeight="400" mb={2}>
                        {optionGroup.label}
                    </Text>
                    {optionGroup.options.map(({label, value}) => (
                        <ClickableFlex
                            onClick={() => {
                                const newcheckedOptions = [...checkedOptions];
                                // @ts-ignore
                                newcheckedOptions[index] = value;
                                setCheckedOptions(newcheckedOptions);
                                // @ts-ignore
                                optionGroup.onSelect(value);
                            }}
                            p={1}
                            key={value?.toString()}
                        >
                            <Icon
                                name="check"
                                color={
                                    checkedOptions[index] === value
                                        ? "blue.default"
                                        : "transparent"
                                }
                                mr={3}
                            />
                            <Text>{label}</Text>
                        </ClickableFlex>
                    ))}
                </Box>
            ))}
        </DropdownContent>
    );
};
