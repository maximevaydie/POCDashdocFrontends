import {LogisticPoint} from "@dashdoc/web-common";
import {NoWrap} from "@dashdoc/web-ui";
import React from "react";
import Highlighter from "react-highlight-words";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};

export function AddressesListAddressCell({logisticPoint, searchWords}: Props) {
    const part1 = logisticPoint.address;
    const part2 = [
        [logisticPoint.postcode, logisticPoint.city].filter(Boolean).join(" "),
        logisticPoint.country,
    ]
        .filter(Boolean)
        .join(", ");
    return (
        <>
            {part1 && (
                <NoWrap>
                    <Highlighter
                        autoEscape={true}
                        searchWords={searchWords}
                        textToHighlight={part1}
                    />
                </NoWrap>
            )}
            {part2 && (
                <NoWrap>
                    <Highlighter
                        autoEscape={true}
                        searchWords={searchWords}
                        textToHighlight={part2}
                    />
                </NoWrap>
            )}
        </>
    );
}
