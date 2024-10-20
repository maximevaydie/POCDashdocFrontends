import {translate as t} from "@dashdoc/web-core";
import {
    Box,
    Text,
    Button,
    ButtonProps,
    Flex,
    Icon,
    Link,
    AutoCompleteTextInput,
} from "@dashdoc/web-ui";
import {STRING_LIST_SEPARATOR} from "dashdoc-utils";
import React, {useEffect, useMemo, useState} from "react";

export interface TextInputEditableListProps {
    onChange: (item: string) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    defaultItem?: string;
    label?: string;
    error?: string;
    "data-testid"?: string;
    confirmationExtractedCodes?: string[];
    addItemLabel: string;
    separator?: string;
    buttonProps?: ButtonProps;
}

export const TextInputEditableList = ({
    onChange,
    defaultItem,
    autoFocus,
    disabled,
    label,
    confirmationExtractedCodes,
    addItemLabel,
    buttonProps,
    error,
    separator = STRING_LIST_SEPARATOR,
    ...otherProps
}: TextInputEditableListProps) => {
    const initialItemList: string[] = useMemo(() => {
        const propsItemAsAList = getItemAsAList(defaultItem, separator);
        if (propsItemAsAList.length) {
            return propsItemAsAList;
        }
        return [""];
    }, [defaultItem, separator]);
    const [itemList, setItemList] = useState<string[]>(initialItemList);

    useEffect(() => {
        setItemList(initialItemList);
    }, [initialItemList]);

    const handleListChange = (newItemList: string[]) => {
        const itemListString = newItemList.filter((item) => !!item).join(separator);
        onChange(itemListString);
    };
    const handleTextChange = (text: string, index: number) => {
        setItemList(() => {
            const newItemList = Object.assign([], itemList, {[index]: text});
            handleListChange(newItemList);
            return newItemList;
        });
    };

    const deleteFromList = (index: number) => {
        setItemList((prev) => {
            const newItemList = [...prev];
            newItemList.splice(index, 1);
            handleListChange(newItemList);
            return newItemList;
        });
    };

    const addItem = () => {
        setItemList(itemList.concat([""]));
    };

    const renderItem = (item: string, index: number) => {
        return (
            <Flex mb={1} key={index}>
                <Box flexBasis="100%">
                    <AutoCompleteTextInput
                        disabled={disabled}
                        containerProps={{flex: 1}}
                        type="text"
                        label={
                            <>
                                {label
                                    ? itemList.length > 1
                                        ? `${label} ${index + 1}`
                                        : label
                                    : t("common.referenceListElementLabel", {index: index + 1})}
                                {confirmationExtractedCodes &&
                                    confirmationExtractedCodes.includes(item) && (
                                        <Icon name="robot" color="blue.dark" ml={1} />
                                    )}
                            </>
                        }
                        value={item}
                        onChange={(text) => handleTextChange(text, index)}
                        autoFocus={!!autoFocus && index === 0}
                        data-testid={`${otherProps["data-testid"]}-${index}`}
                        suggestions={confirmationExtractedCodes?.map((code) => {
                            return {label: code, value: code};
                        })}
                        suggestionsIcon={"robot"}
                        numberOfSuggestions={confirmationExtractedCodes?.length}
                        rootId="react-app"
                        rightIcon={
                            !item && confirmationExtractedCodes?.length ? "robot" : undefined
                        }
                        rightIconColor="yellow.default"
                        rightTooltipContent={t("pdfImport.referencesDetected")}
                    />
                </Box>
                {itemList.length > 1 && (
                    <Button
                        disabled={disabled}
                        variant="secondary"
                        ml={1}
                        onClick={() => {
                            deleteFromList(index);
                        }}
                        {...buttonProps}
                    >
                        <Icon name="delete" />
                    </Button>
                )}
            </Flex>
        );
    };

    return (
        <>
            {itemList.map((item, index) => renderItem(item, index))}
            {!disabled && (
                <Flex mb={1}>
                    <Box flex={1} />
                    <Link
                        data-testid={`${otherProps["data-testid"]}-add`}
                        onClick={() => addItem()}
                    >
                        <Icon name="add" /> {addItemLabel}
                    </Link>
                </Flex>
            )}
            {error && <Text color="red.default">{error}</Text>}
        </>
    );
};

function getItemAsAList(item?: string, separator: string = STRING_LIST_SEPARATOR): string[] {
    if (!item) {
        return [];
    }
    return item.split(separator).map((item) => item);
}
