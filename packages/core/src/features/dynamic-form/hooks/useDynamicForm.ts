import {queryService, t} from "@dashdoc/web-core";
import {zodResolver} from "@hookform/resolvers/zod";
import {APIListResponse, Address, Company, SupportType} from "dashdoc-utils";
import {useCallback} from "react";
import {useForm, UseFormReturn} from "react-hook-form";
import {toast} from "react-toastify";
import {z} from "zod";

import {apiService} from "../../../services/api.service";
import {DynamicFormSpec, DynamicParameterSpec} from "../types";

type Ret = UseFormReturn<
    Record<string, string | Address | Company | SupportType | null>,
    any,
    undefined
>;

export type UseDynamicFormReturn = Omit<Ret, "handleSubmit"> & {
    handleSubmit: (
        onValid: (data: Record<string, string | number | null>) => Promise<void>,
        onInvalid?: Parameters<Ret["handleSubmit"]>[1]
    ) => ReturnType<Ret["handleSubmit"]>;
};

/**
 * Create a react-hook-form Form for the given DynamicFormSpec
 */
export function useDynamicForm(spec: DynamicFormSpec): UseDynamicFormReturn {
    const validationSchema = getValidationSchema(spec);

    const form = useForm<Record<string, string | Address | Company | SupportType | null>>({
        defaultValues: async () => fetchDefaultValues(spec),
        resolver: zodResolver(validationSchema),
    });

    const handleSubmit = useCallback(
        (
            onValid: (data: Record<string, string | number | null>) => Promise<void>,
            onInvalid?: Parameters<typeof form.handleSubmit>[1]
        ): ReturnType<typeof form.handleSubmit> => {
            const onValidWrapper = (
                data: Record<string, string | Address | Company | SupportType | null>
            ) => {
                // Transform the objects to their primary keys
                const newData: Record<string, string | number | null> = {};
                for (const [name, value] of Object.entries(data)) {
                    if (value && typeof value === "object") {
                        if ("pk" in value) {
                            newData[name] = value.pk;
                        } else if ("uid" in value) {
                            newData[name] = value.uid;
                        }
                    } else {
                        newData[name] = value;
                    }
                }

                return onValid(newData);
            };

            return form.handleSubmit(onValidWrapper, onInvalid);
        },
        [form]
    );

    return {
        ...form,
        handleSubmit,
    };
}

async function fetchDefaultValues(
    spec: DynamicFormSpec
): Promise<Record<string, string | Address | Company | SupportType | null>> {
    // The inputs components for logistic points and partners requires a full object
    // But the we only have the ID as the initial value of these fields
    // So we need to load the full object before setting the value
    const [partners, addresses, supportTypes] = await Promise.all([
        fetchDefaultValuesForEntitiesWithPk<Company>(
            spec,
            "partner.shipper",
            apiService.Companies.getAll.bind(apiService.Companies)
        ),
        fetchDefaultValuesForEntitiesWithPk<Address>(
            spec,
            "logistic_point",
            apiService.Addresses.getAll.bind(apiService.Addresses)
        ),
        fetchDefaultValuesForEntitiesWithUid<SupportType>(spec, "support_type", ({query}) =>
            apiService.get(`/support-types/?${queryService.toQueryString(query)}`, {
                apiVersion: "v4",
            })
        ),
    ]);

    return spec.parameters.reduce(
        (acc, parameterSpec) => {
            if (parameterSpec.type === "partner.shipper") {
                if (parameterSpec.initial_value === null) {
                    acc[parameterSpec.key] = null;
                } else {
                    acc[parameterSpec.key] = partners[parameterSpec.initial_value];
                }
            } else if (parameterSpec.type === "logistic_point") {
                if (parameterSpec.initial_value === null) {
                    acc[parameterSpec.key] = null;
                } else {
                    acc[parameterSpec.key] = addresses[parameterSpec.initial_value];
                }
            } else if (parameterSpec.type === "support_type") {
                if (parameterSpec.initial_value === null) {
                    acc[parameterSpec.key] = null;
                } else {
                    acc[parameterSpec.key] = supportTypes[parameterSpec.initial_value];
                }
            } else {
                acc[parameterSpec.key] = parameterSpec.initial_value as string;
            }
            return acc;
        },
        {} as Record<string, string | Address | Company | SupportType | null>
    );
}

async function fetchDefaultValuesForEntitiesWithPk<T extends {pk: number}>(
    spec: DynamicFormSpec,
    type: DynamicParameterSpec["type"],
    f: ({query}: {query: {id__in: number[]}}) => Promise<APIListResponse<T>>
) {
    const ids = spec.parameters
        .filter((parameter) => parameter.type === type)
        .filter((parameter: DynamicParameterSpec) => parameter.initial_value !== null)
        .map((parameter: DynamicParameterSpec) => parameter.initial_value) as number[];

    if (ids.length === 0) {
        return {};
    }

    try {
        const response = await f({query: {id__in: ids}});

        return response.results.reduce(
            (acc: Record<number, T>, entity: T) => {
                acc[entity.pk] = entity;
                return acc;
            },
            {} as Record<number, T>
        );
    } catch (error) {
        toast.error(error);
        return {};
    }
}

async function fetchDefaultValuesForEntitiesWithUid<T extends {uid: string}>(
    spec: DynamicFormSpec,
    type: DynamicParameterSpec["type"],
    f: ({query}: {query: {uid__in: string[]}}) => Promise<APIListResponse<T>>
) {
    const uids = spec.parameters
        .filter((parameter) => parameter.type === type)
        .filter((parameter: DynamicParameterSpec) => parameter.initial_value !== null)
        .map((parameter: DynamicParameterSpec) => parameter.initial_value) as string[];

    if (uids.length === 0) {
        return {};
    }

    try {
        const response = await f({query: {uid__in: uids}});

        return response.results.reduce(
            (acc: Record<string, T>, entity: T) => {
                acc[entity.uid] = entity;
                return acc;
            },
            {} as Record<string, T>
        );
    } catch (error) {
        toast.error(error);
        return {};
    }
}

function getValidationSchema(spec: DynamicFormSpec) {
    return z.object(
        spec.parameters.reduce(
            (acc, parameterSpec) => {
                acc[parameterSpec.key] = getParameterValidationSchema(parameterSpec);
                return acc;
            },
            {} as Record<string, any>
        )
    );
}

function getParameterValidationSchema(parameterSpec: DynamicParameterSpec) {
    if (parameterSpec.type === "partner.shipper" || parameterSpec.type === "logistic_point") {
        if (parameterSpec.is_required) {
            return z.object({pk: z.number()});
        }
        return z.object({pk: z.number()}).nullable();
    } else if (parameterSpec.type === "support_type") {
        if (parameterSpec.is_required) {
            return z.object({uid: z.string().nonempty()});
        }
        return z.object({uid: z.string().nonempty()}).nullable();
    } else {
        if (parameterSpec.is_required) {
            return z.string().nonempty(t("errors.field_cannot_be_empty"));
        }
        return z.string();
    }
}
