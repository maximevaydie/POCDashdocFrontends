import {ReportCategory} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {Box, ErrorMessage, Flex, Icon, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

type ReportCategorySelectProps = {
    initialValue?: ReportCategory;
    disabled?: boolean;
    error?: string;
    onChange: (value: ReportCategory) => void;
};

const RadioBox = styled(Box)<{selected: boolean}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid ${theme.colors.grey.default};
    padding: 12px 16px;
    border-radius: 4px;
    &:hover {
        cursor: pointer;
    }
    ${({selected}) =>
        selected &&
        `
    background-color: ${theme.colors.blue.ultralight};
    border: 1px solid ${theme.colors.blue.default};
`})}
`;

export default function ReportCategorySelect({
    initialValue,
    disabled = false,
    error,
    onChange,
}: ReportCategorySelectProps) {
    // @ts-ignore
    const [selectedCategory, setSelectedCategory] = React.useState<ReportCategory>(initialValue);

    const stylesIfDisabled = {
        pointerEvents: "none",
        opacity: 0.5,
        cursor: "not-allowed",
    } as React.CSSProperties;

    return (
        <Box>
            <Flex width="72%" style={{gap: "12px", ...(disabled ? stylesIfDisabled : {})}}>
                <RadioBox
                    data-testid="report-category-select-transports"
                    flex={1}
                    selected={selectedCategory === "transports"}
                    onClick={() => {
                        setSelectedCategory("transports");
                        onChange("transports");
                    }}
                >
                    <Icon
                        name={"truck"}
                        fontSize={5}
                        color={selectedCategory === "transports" ? "blue.default" : "grey.dark"}
                    />
                    <Text color={selectedCategory === "transports" ? "blue.default" : "grey.dark"}>
                        {t("reports.creationModal.category.transports")}
                    </Text>
                </RadioBox>
                <RadioBox
                    data-testid="report-category-select-orders"
                    flex={1}
                    selected={selectedCategory === "orders"}
                    onClick={() => {
                        setSelectedCategory("orders");
                        onChange("orders");
                    }}
                >
                    <Icon
                        name={"cart"}
                        fontSize={5}
                        color={selectedCategory === "orders" ? "blue.default" : "grey.dark"}
                    />
                    <Text
                        fontSize={2}
                        color={selectedCategory === "orders" ? "blue.default" : "grey.dark"}
                    >
                        {t("reports.creationModal.category.orders")}
                    </Text>
                </RadioBox>
            </Flex>

            {error && <ErrorMessage error={error} />}
        </Box>
    );
}
