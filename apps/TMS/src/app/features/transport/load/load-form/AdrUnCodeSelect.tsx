import {apiService} from "@dashdoc/web-common";
import {getAdrUnCodeLabel, t} from "@dashdoc/web-core";
import {AsyncSelect, AsyncSelectProps} from "@dashdoc/web-ui";
import {AdrUnCode} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

const searchAdrUnCode = (input: string): Promise<AdrUnCode[]> =>
    apiService.AdrUnCodes.getAll({
        query: {
            search: input,
            ordering: "code",
        },
    }).then((result) => {
        const items = result.results.map((item) => ({...item, code: item.code + ""}));
        return items;
    });

export const AdrUnCodeSelect: FunctionComponent<Partial<AsyncSelectProps<AdrUnCode>>> = (
    props
) => {
    return (
        <AsyncSelect
            placeholder={t("adr.enterAdrUnCodePlaceholder")}
            loadOptions={searchAdrUnCode}
            defaultOptions
            getOptionValue={({code}: AdrUnCode | Pick<AdrUnCode, "code">) => code}
            getOptionLabel={(adrUnCode: AdrUnCode | Pick<AdrUnCode, "code">) => {
                if ("pk" in adrUnCode) {
                    return getAdrUnCodeLabel(adrUnCode);
                } else {
                    return adrUnCode.code;
                }
            }}
            {...props}
        />
    );
};
