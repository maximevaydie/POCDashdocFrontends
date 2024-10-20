import {queryService, t} from "@dashdoc/web-core";
import {AsyncPaginatedSelect, AsyncPaginatedSelectProps, toast} from "@dashdoc/web-ui";
import {SupportType} from "dashdoc-utils";
import React, {useCallback} from "react";

import {apiService} from "../../../services/api.service";

type Props = {
    label: string;
    isDisabled?: boolean;
    required?: boolean;
    error?: string;
    onChange: (supportType: SupportType | null) => void;
    value: SupportType | null;
};

export function SupportTypeSelectForDynamicForm({onChange, ...props}: Props) {
    const getOptionValue = useCallback(({uid}: SupportType) => uid, []);
    const getOptionLabel = useCallback(({name}: SupportType) => name, []);

    const loadOptions: AsyncPaginatedSelectProps<SupportType>["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const queryString = `?${queryService.toQueryString({
                    text,
                    page,
                })}`;
                const response: {results: SupportType[]; next: string | null} =
                    await apiService.get(`/support-types/${queryString}`, {apiVersion: "v4"});

                return {
                    options: response.results,
                    hasMore: !!response.next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                toast.error(t("filter.error.couldNotFetchSupportTypes"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        []
    );

    return (
        <AsyncPaginatedSelect<SupportType>
            loadOptions={loadOptions}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            onChange={onChange}
            {...props}
        />
    );
}
