import {StaticImage} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, theme, useDevice} from "@dashdoc/web-ui";
import React from "react";

export function UnavailabilitiesTooltip() {
    const device = useDevice();
    return (
        <Flex
            flexDirection="column"
            maxWidth={device === "desktop" ? "440px" : "calc(100vw - 22px)"}
        >
            <Text>{t("flow.unavailability.help.toCreate")}</Text>
            <Box mt={4} style={{display: "grid", gridTemplateColumns: "38px 1fr", gap: "6px"}}>
                <Box my="auto">
                    <GaugeSvg />
                </Box>
                <Text>{t("flow.unavailability.help.gauge")}</Text>
                <Box my="auto">
                    <SelectSvg />
                </Box>
                <Text>{t("flow.unavailability.help.howToSelect")}</Text>
                <Box my="auto">
                    <ColorsSvg />
                </Box>
                <Text>{t("flow.unavailability.help.explainColors")}</Text>
            </Box>
            <StaticImage
                my={4}
                px={device === "desktop" ? 10 : 0}
                src="flow-select-unavailabilities.gif"
            />
        </Flex>
    );
}

function GaugeSvg() {
    return (
        <svg
            width="29"
            height="24"
            viewBox="0 0 29 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="0.671875" y="0.5" width="13" height="13" rx="4" fill="#DFE3E8" />
            <rect x="15.6719" y="0.5" width="13" height="13" rx="4" fill="#919EAB" />
            <path
                d="M0.318321 19.1464C0.12306 19.3417 0.12306 19.6583 0.318321 19.8536L3.5003 23.0355C3.69556 23.2308 4.01215 23.2308 4.20741 23.0355C4.40267 22.8403 4.40267 22.5237 4.20741 22.3284L1.37898 19.5L4.20741 16.6716C4.40267 16.4763 4.40267 16.1597 4.20741 15.9645C4.01215 15.7692 3.69556 15.7692 3.5003 15.9645L0.318321 19.1464ZM28.6719 19L0.671875 19V20L28.6719 20V19Z"
                fill={theme.colors.blue.default}
            />
        </svg>
    );
}

function SelectSvg() {
    return (
        <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M14.4336 9.37444V8.11663C14.4473 7.94364 14.425 7.7697 14.3682 7.60574C14.3113 7.44178 14.2212 7.29135 14.1035 7.16391C13.9857 7.03647 13.8428 6.93477 13.6838 6.86522C13.5249 6.79567 13.3532 6.75977 13.1797 6.75977C13.0062 6.75977 12.8345 6.79567 12.6755 6.86522C12.5166 6.93477 12.3737 7.03647 12.2559 7.16391C12.1382 7.29135 12.048 7.44178 11.9912 7.60574C11.9344 7.7697 11.9121 7.94364 11.9258 8.11663V7.49163C11.9258 7.15804 11.7933 6.83811 11.5574 6.60222C11.3215 6.36634 11.0016 6.23382 10.668 6.23382C10.3344 6.23382 10.0144 6.36634 9.77856 6.60222C9.54268 6.83811 9.41016 7.15804 9.41016 7.49163V2.46819C9.42382 2.29521 9.40155 2.12126 9.34473 1.9573C9.28791 1.79334 9.19779 1.64291 9.08001 1.51547C8.96224 1.38803 8.81938 1.28634 8.6604 1.21678C8.50142 1.14723 8.32978 1.11133 8.15625 1.11133C7.98272 1.11133 7.81108 1.14723 7.6521 1.21678C7.49312 1.28634 7.35026 1.38803 7.23249 1.51547C7.11472 1.64291 7.02459 1.79334 6.96777 1.9573C6.91096 2.12126 6.88868 2.29521 6.90234 2.46819V9.99944C6.24194 10.0076 5.61125 10.2752 5.14644 10.7444C4.68162 11.2136 4.41997 11.8468 4.41797 12.5073C4.41755 13.7351 4.80288 14.9321 5.51953 15.9291L6.43359 17.2104C6.78337 17.6952 7.24357 18.0898 7.77611 18.3615C8.30866 18.6332 8.89824 18.7743 9.49609 18.7729H12.6914C13.8147 18.7545 14.8862 18.2969 15.6762 17.4981C16.4662 16.6993 16.912 15.6229 16.918 14.4994V9.37444C16.918 9.04085 16.7854 8.72092 16.5496 8.48504C16.3137 8.24915 15.9937 8.11663 15.6602 8.11663C15.3266 8.11663 15.0066 8.24915 14.7707 8.48504C14.5349 8.72092 14.4023 9.04085 14.4023 9.37444H14.4336Z"
                fill="white"
                stroke={theme.colors.blue.default}
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M6.90234 10V11.8828V10Z" fill="white" />
            <path
                d="M6.90234 10V11.8828"
                stroke={theme.colors.blue.default}
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M9.41016 9.37402V8.11621V9.37402Z" fill="white" />
            <path
                d="M9.41016 9.37402V8.11621"
                stroke={theme.colors.blue.default}
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M11.9258 9.37402V8.11621V9.37402Z" fill="white" />
            <path
                d="M11.9258 9.37402V8.11621"
                stroke={theme.colors.blue.default}
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ColorsSvg() {
    return (
        <svg
            width="29"
            height="14"
            viewBox="0 0 29 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="0.671875" y="0.5" width="13" height="13" rx="4" fill="#B3C4FF" />
            <rect x="15.6719" y="0.5" width="13" height="13" rx="4" fill="#F5A9A9" />
        </svg>
    );
}
