import {t} from "@dashdoc/web-core";
import {Box, TooltipWrapper, theme} from "@dashdoc/web-ui";
import React from "react";
import Highlighter from "react-highlight-words";

export const verifiedIcon = (
    <svg viewBox="0 0 512 512" width="1em" height="1em" style={{marginBottom: "-0.1em"}}>
        <path
            d="M512 256c0-37.7-23.7-69.9-57.1-82.4 14.7-32.4 8.8-71.9-17.9-98.6-26.7-26.7-66.2-32.6-98.6-17.9C325.9 23.7 293.7 0 256 0s-69.9 23.7-82.4 57.1c-32.4-14.7-72-8.8-98.6 17.9-26.7 26.7-32.6 66.2-17.9 98.6C23.7 186.1 0 218.3 0 256s23.7 69.9 57.1 82.4c-14.7 32.4-8.8 72 17.9 98.6 26.6 26.6 66.1 32.7 98.6 17.9 12.5 33.3 44.7 57.1 82.4 57.1s69.9-23.7 82.4-57.1c32.6 14.8 72 8.7 98.6-17.9 26.7-26.7 32.6-66.2 17.9-98.6 33.4-12.5 57.1-44.7 57.1-82.4zm-144.8-44.25L236.16 341.74c-4.31 4.28-11.28 4.25-15.55-.06l-75.72-76.33c-4.28-4.31-4.25-11.28.06-15.56l26.03-25.82c4.31-4.28 11.28-4.25 15.56.06l42.15 42.49 97.2-96.42c4.31-4.28 11.28-4.25 15.55.06l25.82 26.03c4.28 4.32 4.26 11.29-.06 15.56z"
            fill={theme.colors.blue.default}
        />
    </svg>
);

type Props = {
    company: {
        name?: string;
        is_verified?: boolean;
    };
    highlight?: string[];
    tooltip?: boolean;
    withoutContainer?: boolean;
};

export function CompanyName({company, highlight, tooltip, withoutContainer = false}: Props) {
    const content = (
        <>
            {highlight?.length ? (
                <Highlighter
                    autoEscape={true}
                    searchWords={highlight}
                    textToHighlight={company.name || ""}
                />
            ) : (
                company.name
            )}
            {company.is_verified ? (
                tooltip ? (
                    <>
                        &nbsp;
                        <TooltipWrapper
                            content={t("company.verified")}
                            boxProps={{display: "inline"}}
                        >
                            {verifiedIcon}
                        </TooltipWrapper>
                    </>
                ) : (
                    <>
                        &nbsp;
                        {verifiedIcon}
                    </>
                )
            ) : null}
        </>
    );
    return withoutContainer ? content : <Box>{content}</Box>;
}
