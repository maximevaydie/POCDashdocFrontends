import {t} from "@dashdoc/web-core";
import {Icon, IconProps, Text} from "@dashdoc/web-ui";
import React from "react";
import Highlighter from "react-highlight-words";

type Props = {
    label: string;
    icon: IconProps["name"];
    value?: string;
    wordsToHighlight?: string[];
    ["data-testid"]?: string;
};

export function CompanyInformationRow(props: Props) {
    const {label, icon, value, wordsToHighlight = []} = props;
    return (
        <Text data-testid={props["data-testid"]}>
            <Icon name={icon} /> <b>{label}</b> :{" "}
            {value ? (
                <Highlighter autoEscape searchWords={wordsToHighlight} textToHighlight={value} />
            ) : (
                t("common.unspecified")
            )}
        </Text>
    );
}
