import {CompanyName, LogisticPoint} from "@dashdoc/web-common";
import {NoWrap} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};

export const AddressesListCompanyCell: FunctionComponent<Props> = ({
    logisticPoint,
    searchWords,
}) =>
    logisticPoint.company ? (
        <NoWrap>
            <CompanyName
                company={logisticPoint.company}
                highlight={searchWords}
                withoutContainer
            />
        </NoWrap>
    ) : null;
