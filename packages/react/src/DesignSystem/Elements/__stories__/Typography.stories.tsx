import {t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Text, ToastContainer, textVariants, toast} from "@dashdoc/web-ui";
import {Meta} from "@storybook/react/types-6-0";
import {copyToClipboard} from "dashdoc-utils";
import React from "react";

const typos = [
    {
        variant: "title",
        text: "Title - Open sans semibold 20px",
        pre: `<Text variant="title">`,
    },
    {
        variant: "h1",
        text: "H1 - Open sans semibold 16px",
        pre: `<Text variant="h1">`,
    },
    {
        variant: "h2",
        text: "H2 - Open sans semibold 14px",
        pre: `<Text variant="h2">`,
    },
    {
        variant: "body",
        text: "Body - Open sans regular 14px",
        pre: `<Text>`,
    },
    {
        variant: "captionBold",
        text: "Caption Bold - Open bold 12px",
        pre: `<Text variant="captionBold">`,
    },
    {
        variant: "caption",
        text: "Caption - Open sans regular 12px",
        pre: `<Text variant="caption">`,
    },
    {
        variant: "subcaption",
        text: "Subcaption - Open sans regular 11px",
        pre: `<Text variant="subcaption">`,
    },
];
export const Typography = () => {
    return (
        <>
            <Box backgroundColor="grey.white" p={4}>
                {typos.map((typo, key) => (
                    <ClickableFlex
                        key={key}
                        alignItems="baseline"
                        justifyContent="space-between"
                        p={2}
                        borderBottom="1px solid"
                        borderColor="grey.light"
                        onClick={() => {
                            handleCopy(typo.pre);
                        }}
                    >
                        <Text ml={4} variant={typo.variant as keyof typeof textVariants}>
                            {typo.text}
                        </Text>
                        <pre style={{padding: 4, marginLeft: 18}}>{typo.pre}</pre>
                    </ClickableFlex>
                ))}
            </Box>
            <ToastContainer />
        </>
    );

    function handleCopy(value: string) {
        copyToClipboard(
            value,
            () => toast.success("Copied", {autoClose: 500}),
            () => toast.error(t("common.error"))
        );
    }
};

export default {
    title: "Web UI/Typography",
    component: Typography,
} as Meta;
