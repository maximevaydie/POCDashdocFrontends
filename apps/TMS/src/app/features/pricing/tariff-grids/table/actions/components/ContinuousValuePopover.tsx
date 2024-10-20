import {t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, NumberInput, Popover, Text, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {FC} from "react";

const Highlighted = styled("span")(themeAwareCss({paddingX: 1, backgroundColor: "grey.light"}));

const helperString = ({
    valueBelow,
    value,
    type,
}: {
    valueBelow: number | null;
    value: number | null;
    type: "line" | "column";
}) => {
    return {
        startText: t("tariffGrids.TheValuesBetween") + " ",
        highlightedText: `${valueBelow === 0 ? "≥" : ">"}${valueBelow} ${t(
            "tariffGrids.AndBetweenTwoValues"
        )} ≤${value}`,
        endText: ` ${
            type === "column"
                ? t("tariffGrids.WillBeConsideredInThisColumn")
                : t("tariffGrids.WillBeConsideredInThisLine")
        }.`,
    };
};

const HelperText: FC<{
    valueBelow: number | null;
    value: number | null;
    type: "line" | "column";
}> = ({valueBelow, value, type}) => {
    const {startText, highlightedText, endText} = helperString({valueBelow, value, type});
    return (
        <Text>
            {startText}
            <Highlighted>{highlightedText}</Highlighted>
            {endText}
        </Text>
    );
};

/**
 * A popover to create or edit a continuous value in a line or column of a tariff grid.
 */
export const ContinuousValuePopover: FC<{
    title: string;
    error: string | null;
    isOpen: boolean;
    value: number | null;
    valueBelow: number | null;
    onChange: (value: number | null) => unknown;
    onValidate: (value: number | null) => unknown;
    onClose: () => unknown;
    onDelete?: () => unknown;
    inputTestId?: string;
    referenceElement: React.ReactElement;
    type: "line" | "column";
}> = ({
    title,
    error,
    isOpen,
    valueBelow,
    value,
    onChange,
    onClose,
    onValidate,
    onDelete,
    inputTestId,
    referenceElement,
    type,
}) => {
    return (
        <Popover
            visibility={{
                isOpen,
                onOpenChange: (openValue) => {
                    if (!openValue) {
                        // close in all cases
                        if (error === null) {
                            onValidate(value);
                        }
                        onClose();
                    }
                },
            }}
            placement={type === "column" ? "bottom-start" : "right-end"}
        >
            <Popover.Trigger>{referenceElement}</Popover.Trigger>
            <Popover.Content width="240px">
                <Popover.Header title={title} />
                <Flex flexDirection={"column"} fontWeight={"normal"}>
                    <Flex
                        borderBottom={"1px solid"}
                        flexDirection={"column"}
                        borderBottomColor="grey.light"
                        style={{gap: 6}}
                    >
                        <Flex flexDirection={"row"} alignItems={"center"}>
                            <Text mr={4}>{t("tariffGrids.UpToValue")}</Text>
                            <Box>
                                <NumberInput
                                    value={value}
                                    autoFocus={true}
                                    onChange={onChange}
                                    min={0}
                                    data-testid={inputTestId}
                                    onTransientChange={onChange} // Update the UI as the value is typed, do not transform localStep during this process
                                    onKeyPress={(event) => {
                                        if (error === null) {
                                            if (event.key === "Enter") {
                                                onValidate(value);
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Flex>
                        <Flex borderTop="1px dashed" borderTopColor="grey.light" py={2}>
                            {error ? (
                                <Text color="red.default">{error}</Text>
                            ) : (
                                <HelperText valueBelow={valueBelow} value={value} type={type} />
                            )}
                        </Flex>
                    </Flex>
                    {onDelete !== undefined && (
                        <Flex p={2}>
                            <IconButton
                                name={"bin"}
                                label={t("common.delete")}
                                data-testid={"popover-delete-button"}
                                onClick={() => {
                                    onDelete();
                                }}
                            />
                        </Flex>
                    )}
                </Flex>
            </Popover.Content>
        </Popover>
    );
};
